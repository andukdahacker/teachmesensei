import { describe, it, expect, beforeAll } from 'vitest';
import {
	createAuthenticatedClients,
	type AuthenticatedTestUser,
	type TestRole
} from '../../fixtures/roles';
import { createAdminClient } from '../../fixtures/supabase';

describe('profiles RLS policies', () => {
	let users: Record<TestRole, AuthenticatedTestUser>;
	let secondLearnerId: string;

	beforeAll(async () => {
		users = await createAuthenticatedClients();

		// Create a second learner for cross-learner isolation tests (idempotent)
		const admin = createAdminClient();
		const secondEmail = 'second-learner@teachmesensei.test';

		const { data: secondUser, error: createError } = await admin.auth.admin.createUser({
			email: secondEmail,
			password: 'TestPassword123!',
			email_confirm: true
		});
		if (createError && createError.message.includes('already been registered')) {
			const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
			const existing = list.users.find((u) => u.email === secondEmail);
			if (!existing) throw new Error('Second learner reported as existing but not found');
			secondLearnerId = existing.id;
		} else if (createError) {
			throw new Error(`Failed to create second learner: ${createError.message}`);
		} else {
			secondLearnerId = secondUser.user.id;
		}
	}, 30_000);

	describe('SELECT policies', () => {
		it('learner can read own profile', async () => {
			const { data, error } = await users.learner.client
				.from('profiles')
				.select('*')
				.eq('id', users.learner.id);

			expect(error).toBeNull();
			expect(data).toHaveLength(1);
			expect(data![0].id).toBe(users.learner.id);
			expect(data![0].role).toBe('learner');
		});

		it('learner cannot read another learner profile', async () => {
			const { data, error } = await users.learner.client
				.from('profiles')
				.select('*')
				.eq('id', secondLearnerId);

			// RLS silently filters — returns empty, not error
			expect(error).toBeNull();
			expect(data).toHaveLength(0);
		});

		it('learner can read sensei profile (public discovery)', async () => {
			const { data, error } = await users.learner.client
				.from('profiles')
				.select('*')
				.eq('id', users.sensei.id);

			expect(error).toBeNull();
			expect(data).toHaveLength(1);
			expect(data![0].id).toBe(users.sensei.id);
			expect(data![0].role).toBe('sensei');
		});

		it('sensei can read own profile', async () => {
			const { data, error } = await users.sensei.client
				.from('profiles')
				.select('*')
				.eq('id', users.sensei.id);

			expect(error).toBeNull();
			expect(data).toHaveLength(1);
			expect(data![0].id).toBe(users.sensei.id);
		});

		it('sensei cannot read learner profile (no connections)', async () => {
			const { data, error } = await users.sensei.client
				.from('profiles')
				.select('*')
				.eq('id', users.learner.id);

			// No connections exist yet — sensei cannot see learner profiles
			expect(error).toBeNull();
			expect(data).toHaveLength(0);
		});

		it('platform_admin can read all profiles', async () => {
			const { data, error } = await users.platform_admin.client.from('profiles').select('*');

			expect(error).toBeNull();
			// At least 5 test users + 1 extra learner created above
			expect(data!.length).toBeGreaterThanOrEqual(5);

			// Verify admin can see different roles
			const roles = data!.map((p) => p.role);
			expect(roles).toContain('learner');
			expect(roles).toContain('sensei');
			expect(roles).toContain('platform_admin');
		});

		it('team_lead cannot read all profiles', async () => {
			const { data, error } = await users.team_lead.client.from('profiles').select('*');

			expect(error).toBeNull();
			// team_lead sees own profile + sensei profiles only (no admin policy)
			const ids = data!.map((p) => p.id);
			expect(ids).toContain(users.team_lead.id);
			expect(ids).toContain(users.sensei.id);
			// Must NOT contain other non-sensei users
			expect(ids).not.toContain(users.learner.id);
			expect(ids).not.toContain(secondLearnerId);
		});

		it('org_admin cannot read all profiles', async () => {
			const { data, error } = await users.org_admin.client.from('profiles').select('*');

			expect(error).toBeNull();
			// org_admin sees own profile + sensei profiles only (no admin policy)
			const ids = data!.map((p) => p.id);
			expect(ids).toContain(users.org_admin.id);
			expect(ids).toContain(users.sensei.id);
			// Must NOT contain other non-sensei users
			expect(ids).not.toContain(users.learner.id);
			expect(ids).not.toContain(secondLearnerId);
		});
	});

	describe('UPDATE policies', () => {
		it('user can update own profile', async () => {
			const { error, data } = await users.learner.client
				.from('profiles')
				.update({ bio: 'Test bio update' })
				.eq('id', users.learner.id)
				.select();

			expect(error).toBeNull();
			expect(data).toHaveLength(1);
			expect(data![0].bio).toBe('Test bio update');
		});

		it('user cannot update another user profile', async () => {
			const { data, error } = await users.learner.client
				.from('profiles')
				.update({ bio: 'Malicious update' })
				.eq('id', users.sensei.id)
				.select();

			// RLS silently filters — update affects 0 rows, not an error
			expect(error).toBeNull();
			expect(data).toHaveLength(0);
		});
	});

	describe('INSERT policies', () => {
		it('user cannot insert a profile directly', async () => {
			const { error } = await users.learner.client.from('profiles').insert({
				id: '00000000-0000-0000-0000-000000000099',
				role: 'learner',
				display_name: 'Fake Profile'
			} as never);

			// No INSERT policy — RLS blocks with permission error
			expect(error).not.toBeNull();
		});
	});
});
