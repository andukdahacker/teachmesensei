import { describe, it, expect, beforeAll } from 'vitest';
import {
	createAuthenticatedClients,
	type AuthenticatedTestUser,
	type TestRole
} from '../../fixtures/roles';
import { createAdminClient } from '../../fixtures/supabase';

describe('invite_codes RLS policies', () => {
	let users: Record<TestRole, AuthenticatedTestUser>;
	let admin: ReturnType<typeof createAdminClient>;
	let senseiCode: string;
	let secondSenseiId: string;
	let secondSenseiCode: string;

	beforeAll(async () => {
		users = await createAuthenticatedClients();
		admin = createAdminClient();

		// Create a second sensei for cross-sensei isolation tests
		const secondEmail = 'second-sensei@teachmesensei.test';
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
				display_name: 'Second Sensei',
				onboarding_complete: true,
				topics: ['Career Development']
			})
			.eq('id', secondSenseiId);
		if (updateError) throw new Error(`Failed to set second sensei profile: ${updateError.message}`);

		// Insert test invite codes via admin client (bypasses RLS)
		senseiCode = 'testcd01';
		secondSenseiCode = 'testcd02';

		// Clean up any existing test codes first
		await admin.from('invite_codes').delete().in('code', [senseiCode, secondSenseiCode]);

		const { error: insertError1 } = await admin.from('invite_codes').insert({
			sensei_id: users.sensei.id,
			code: senseiCode,
			shareable_url: `http://localhost:5173/invite/test-sensei-${senseiCode}`,
			status: 'unused'
		});
		if (insertError1) throw new Error(`Failed to insert sensei code: ${insertError1.message}`);

		const { error: insertError2 } = await admin.from('invite_codes').insert({
			sensei_id: secondSenseiId,
			code: secondSenseiCode,
			shareable_url: `http://localhost:5173/invite/second-sensei-${secondSenseiCode}`,
			status: 'unused'
		});
		if (insertError2)
			throw new Error(`Failed to insert second sensei code: ${insertError2.message}`);
	}, 30_000);

	describe('SELECT policies', () => {
		it('sensei can read own invite codes', async () => {
			const { data, error } = await users.sensei.client
				.from('invite_codes')
				.select('*')
				.eq('sensei_id', users.sensei.id);

			expect(error).toBeNull();
			expect(data!.length).toBeGreaterThanOrEqual(1);
			expect(data!.every((c) => c.sensei_id === users.sensei.id)).toBe(true);
		});

		it('authenticated users can read all invite codes (broad SELECT policy for claim flow)', async () => {
			const { data, error } = await users.sensei.client
				.from('invite_codes')
				.select('*')
				.eq('sensei_id', secondSenseiId);

			// invite_codes_select_authenticated allows any authenticated user to SELECT
			// all rows. This is intentional — Story 3.2 claim flow needs learner
			// to look up codes by code value, which requires broad read access.
			expect(error).toBeNull();
			expect(data!.length).toBeGreaterThanOrEqual(1);
		});

		it('learner can read invite code by exact code value', async () => {
			const { data, error } = await users.learner.client
				.from('invite_codes')
				.select('*')
				.eq('code', senseiCode);

			expect(error).toBeNull();
			expect(data).toHaveLength(1);
			expect(data![0].code).toBe(senseiCode);
		});
	});

	describe('INSERT policies', () => {
		it('sensei can insert an invite code for themselves', async () => {
			const testCode = 'snsrins1';

			// Clean up first
			await admin.from('invite_codes').delete().eq('code', testCode);

			const { error } = await users.sensei.client.from('invite_codes').insert({
				sensei_id: users.sensei.id,
				code: testCode,
				shareable_url: `http://localhost:5173/invite/test-${testCode}`
			});

			expect(error).toBeNull();

			// Clean up
			await admin.from('invite_codes').delete().eq('code', testCode);
		});

		it('sensei CANNOT insert an invite code for another sensei', async () => {
			const testCode = 'snsrins2';

			const { error } = await users.sensei.client.from('invite_codes').insert({
				sensei_id: secondSenseiId,
				code: testCode,
				shareable_url: `http://localhost:5173/invite/test-${testCode}`
			});

			// RLS blocks: sensei_id must equal auth.uid()
			expect(error).not.toBeNull();
		});

		it('learner CANNOT insert invite codes', async () => {
			const testCode = 'lrnrins1';

			const { error } = await users.learner.client.from('invite_codes').insert({
				sensei_id: users.learner.id,
				code: testCode,
				shareable_url: `http://localhost:5173/invite/test-${testCode}`
			});

			// RLS blocks: get_user_role() returns 'learner', not 'sensei'
			expect(error).not.toBeNull();
		});
	});

	describe('admin policies', () => {
		it('platform_admin can read ALL invite codes', async () => {
			const { data, error } = await users.platform_admin.client.from('invite_codes').select('*');

			expect(error).toBeNull();
			// Should see codes from both senseis
			const senseiIds = data!.map((c) => c.sensei_id);
			expect(senseiIds).toContain(users.sensei.id);
			expect(senseiIds).toContain(secondSenseiId);
		});
	});
});
