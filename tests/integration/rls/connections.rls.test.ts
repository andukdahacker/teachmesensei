import { describe, it, expect, beforeAll } from 'vitest';
import {
	createAuthenticatedClients,
	type AuthenticatedTestUser,
	type TestRole
} from '../../fixtures/roles';
import { createAdminClient, createAnonClient } from '../../fixtures/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RpcResult = any;

describe('connections RLS policies', () => {
	let users: Record<TestRole, AuthenticatedTestUser>;
	let admin: ReturnType<typeof createAdminClient>;
	let secondSenseiId: string;

	beforeAll(async () => {
		users = await createAuthenticatedClients();
		admin = createAdminClient();

		// Create a second sensei for cross-user isolation tests
		const secondEmail = 'second-sensei-conn@teachmesensei.test';
		const { data: secondUser, error: createError } = await admin.auth.admin.createUser({
			email: secondEmail,
			password: 'TestPassword123!',
			email_confirm: true
		});
		if (createError && createError.message.includes('already been registered')) {
			const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
			const existing = list.users.find((u) => u.email === secondEmail);
			if (!existing) throw new Error('Second sensei reported as existing but not found');
			secondSenseiId = existing.id;
		} else if (createError) {
			throw new Error(`Failed to create second sensei: ${createError.message}`);
		} else {
			secondSenseiId = secondUser.user.id;
		}

		// Set second sensei profile
		const { error: updateError } = await admin
			.from('profiles')
			.update({
				role: 'sensei',
				display_name: 'Second Sensei Conn',
				onboarding_complete: true,
				topics: ['Career Development']
			})
			.eq('id', secondSenseiId);
		if (updateError) throw new Error(`Failed to set second sensei profile: ${updateError.message}`);

		// Create a connection between sensei and learner via admin (bypasses RLS)
		await admin
			.from('connections')
			.delete()
			.or(`sensei_id.eq.${users.sensei.id},sensei_id.eq.${secondSenseiId}`);

		const { error: connError } = await admin.from('connections').insert({
			sensei_id: users.sensei.id,
			learner_id: users.learner.id,
			status: 'active',
			connected_at: new Date().toISOString()
		});
		if (connError) throw new Error(`Failed to insert connection: ${connError.message}`);

		// Create a second connection (second sensei -> learner) for isolation tests
		const { error: connError2 } = await admin.from('connections').insert({
			sensei_id: secondSenseiId,
			learner_id: users.learner.id,
			status: 'active',
			connected_at: new Date().toISOString()
		});
		if (connError2) throw new Error(`Failed to insert second connection: ${connError2.message}`);
	}, 30_000);

	describe('SELECT policies', () => {
		it('sensei can read own connections', async () => {
			const { data, error } = await users.sensei.client
				.from('connections')
				.select('*')
				.eq('sensei_id', users.sensei.id);

			expect(error).toBeNull();
			expect(data!.length).toBeGreaterThanOrEqual(1);
			expect(data!.every((c) => c.sensei_id === users.sensei.id)).toBe(true);
		});

		it('learner can read own connections', async () => {
			const { data, error } = await users.learner.client
				.from('connections')
				.select('*')
				.eq('learner_id', users.learner.id);

			expect(error).toBeNull();
			expect(data!.length).toBeGreaterThanOrEqual(1);
			expect(data!.every((c) => c.learner_id === users.learner.id)).toBe(true);
		});

		it('sensei cannot read another sensei connections (RLS silent filter)', async () => {
			const { data, error } = await users.sensei.client
				.from('connections')
				.select('*')
				.eq('sensei_id', secondSenseiId);

			// RLS silent filter — empty array, NOT error
			expect(error).toBeNull();
			expect(data).toHaveLength(0);
		});

		it('non-participant cannot read connections they are not part of (RLS silent filter)', async () => {
			// team_lead is neither sensei_id nor learner_id in these connections
			const { data, error } = await users.team_lead.client
				.from('connections')
				.select('*')
				.eq('learner_id', users.learner.id);

			expect(error).toBeNull();
			expect(data).toHaveLength(0);
		});

		it('admin can read all connections', async () => {
			const { data, error } = await users.platform_admin.client.from('connections').select('*');

			expect(error).toBeNull();
			// Should see connections from both senseis
			const senseiIds = data!.map((c) => c.sensei_id);
			expect(senseiIds).toContain(users.sensei.id);
			expect(senseiIds).toContain(secondSenseiId);
		});
	});

	describe('INSERT policies', () => {
		it('learner cannot INSERT connections directly (no INSERT policy — must use RPC)', async () => {
			// Use secondSenseiId + learner pair that has NO existing connection via this learner client,
			// so the ONLY reason insert fails is RLS blocking (not UNIQUE constraint)
			const { error } = await users.learner.client.from('connections').insert({
				sensei_id: secondSenseiId,
				learner_id: users.team_lead.id,
				status: 'active',
				connected_at: new Date().toISOString()
			});

			// No INSERT policy exists — RLS blocks before UNIQUE constraint is checked
			expect(error).not.toBeNull();
		});
	});
});

describe('claim flow RPC functions', () => {
	let users: Record<TestRole, AuthenticatedTestUser>;
	let admin: ReturnType<typeof createAdminClient>;

	beforeAll(async () => {
		users = await createAuthenticatedClients();
		admin = createAdminClient();

		// Clean up any test codes and connections from previous runs
		await admin.from('connections').delete().eq('sensei_id', users.sensei.id);
		await admin
			.from('invite_codes')
			.delete()
			.in('code', [
				'clmtest1',
				'clmtest2',
				'clmtest3',
				'clmtest4',
				'clmtest5',
				'clmtest6',
				'clmtest7'
			]);
	}, 30_000);

	describe('get_invite_details()', () => {
		beforeAll(async () => {
			// Insert invite codes for tests
			await admin.from('invite_codes').insert({
				sensei_id: users.sensei.id,
				code: 'clmtest1',
				shareable_url: 'http://localhost:5173/invite/test-sensei-clmtest1',
				status: 'unused'
			});
		});

		it('returns sensei info for valid code (anon client)', async () => {
			const anon = createAnonClient();
			const { data, error } = await anon.rpc('get_invite_details', {
				code_value: 'clmtest1'
			});

			expect(error).toBeNull();
			expect(data).not.toBeNull();
			const details = data as RpcResult;
			expect(details.code).toBe('clmtest1');
			expect(details.status).toBe('unused');
			expect(details.sensei_id).toBe(users.sensei.id);
			expect(details.sensei_display_name).toBeTruthy();
			expect(details.is_connected).toBe(false);
		});

		it('returns null for non-existent code', async () => {
			const anon = createAnonClient();
			const { data, error } = await anon.rpc('get_invite_details', {
				code_value: 'nonexist'
			});

			expect(error).toBeNull();
			expect(data).toBeNull();
		});

		it('returns is_connected=false for authenticated user with no connection', async () => {
			// Learner is authenticated but has no connection to this sensei (cleaned up in parent beforeAll)
			const { data, error } = await users.learner.client.rpc('get_invite_details', {
				code_value: 'clmtest1'
			});

			expect(error).toBeNull();
			expect(data).not.toBeNull();
			const details = data as RpcResult;
			expect(details.is_connected).toBe(false);
		});

		it('returns is_connected=true for authenticated user with existing connection', async () => {
			// Create a connection
			await admin.from('connections').insert({
				sensei_id: users.sensei.id,
				learner_id: users.learner.id,
				status: 'active',
				connected_at: new Date().toISOString()
			});

			const { data, error } = await users.learner.client.rpc('get_invite_details', {
				code_value: 'clmtest1'
			});

			expect(error).toBeNull();
			expect(data).not.toBeNull();
			const details = data as RpcResult;
			expect(details.is_connected).toBe(true);

			// Clean up connection for subsequent tests
			await admin
				.from('connections')
				.delete()
				.eq('sensei_id', users.sensei.id)
				.eq('learner_id', users.learner.id);
		});
	});

	describe('claim_invite_code()', () => {
		it('successfully claims unused code — creates connection + updates invite code status', async () => {
			// Insert fresh unused code
			await admin.from('invite_codes').insert({
				sensei_id: users.sensei.id,
				code: 'clmtest2',
				shareable_url: 'http://localhost:5173/invite/test-sensei-clmtest2',
				status: 'unused'
			});

			const { data: rawResult, error } = await users.learner.client.rpc('claim_invite_code', {
				code_value: 'clmtest2'
			});

			expect(error).toBeNull();
			expect(rawResult).not.toBeNull();
			const result = rawResult as RpcResult;
			expect(result.success).toBe(true);
			expect(result.sensei_id).toBe(users.sensei.id);
			expect(result.sensei_name).toBeTruthy();

			// Verify invite code status changed via admin
			const { data: inviteCode } = await admin
				.from('invite_codes')
				.select('status, claimed_by')
				.eq('code', 'clmtest2')
				.single();
			expect(inviteCode!.status).toBe('claimed');
			expect(inviteCode!.claimed_by).toBe(users.learner.id);

			// Verify connection created via admin
			const { data: connection } = await admin
				.from('connections')
				.select('*')
				.eq('sensei_id', users.sensei.id)
				.eq('learner_id', users.learner.id)
				.single();
			expect(connection).not.toBeNull();
			expect(connection!.status).toBe('active');

			// Clean up
			await admin
				.from('connections')
				.delete()
				.eq('sensei_id', users.sensei.id)
				.eq('learner_id', users.learner.id);
		});

		it('rejects already-claimed code', async () => {
			// Insert claimed code
			await admin.from('invite_codes').insert({
				sensei_id: users.sensei.id,
				code: 'clmtest3',
				shareable_url: 'http://localhost:5173/invite/test-sensei-clmtest3',
				status: 'claimed',
				claimed_by: users.learner.id,
				claimed_at: new Date().toISOString()
			});

			const { data: rawResult3, error } = await users.learner.client.rpc('claim_invite_code', {
				code_value: 'clmtest3'
			});

			expect(error).toBeNull();
			expect(rawResult3).not.toBeNull();
			const result3 = rawResult3 as RpcResult;
			expect(result3.error).toBe('already_claimed');
		});

		it('rejects when learner already connected to sensei (duplicate prevention)', async () => {
			// Insert unused code and existing connection
			await admin.from('invite_codes').insert({
				sensei_id: users.sensei.id,
				code: 'clmtest4',
				shareable_url: 'http://localhost:5173/invite/test-sensei-clmtest4',
				status: 'unused'
			});
			await admin.from('connections').insert({
				sensei_id: users.sensei.id,
				learner_id: users.learner.id,
				status: 'active',
				connected_at: new Date().toISOString()
			});

			const { data: rawResult4, error } = await users.learner.client.rpc('claim_invite_code', {
				code_value: 'clmtest4'
			});

			expect(error).toBeNull();
			expect(rawResult4).not.toBeNull();
			const result4 = rawResult4 as RpcResult;
			expect(result4.error).toBe('already_connected');

			// Clean up
			await admin
				.from('connections')
				.delete()
				.eq('sensei_id', users.sensei.id)
				.eq('learner_id', users.learner.id);
		});

		it('rejects for non-learner role (sensei trying to claim)', async () => {
			await admin.from('invite_codes').insert({
				sensei_id: users.sensei.id,
				code: 'clmtest5',
				shareable_url: 'http://localhost:5173/invite/test-sensei-clmtest5',
				status: 'unused'
			});

			// Use sensei client (not a learner) to try claiming
			const { data: rawResult5, error } = await users.sensei.client.rpc('claim_invite_code', {
				code_value: 'clmtest5'
			});

			expect(error).toBeNull();
			expect(rawResult5).not.toBeNull();
			const result5 = rawResult5 as RpcResult;
			expect(result5.error).toBe('not_learner');
		});
	});
});
