import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../src/lib/database.types';
import { createAdminClient, SUPABASE_URL, ANON_KEY } from './supabase';

// -- Existing exports (keep for unit test backward compat) --
export const TEST_ROLES = [
	'learner',
	'sensei',
	'team_lead',
	'org_admin',
	'platform_admin'
] as const;
export type TestRole = (typeof TEST_ROLES)[number];

export interface TestUser {
	id: string;
	email: string;
	role: TestRole;
}

export function createTestUsers(): Record<TestRole, TestUser> {
	return Object.fromEntries(
		TEST_ROLES.map((role) => [
			role,
			{
				id: `test-${role}-id`,
				email: `test-${role}@teachmesensei.test`,
				role
			}
		])
	) as Record<TestRole, TestUser>;
}

// -- New: Real Supabase authenticated clients for RLS tests --

export interface AuthenticatedTestUser {
	id: string;
	email: string;
	role: TestRole;
	client: SupabaseClient<Database>;
}

export async function createAuthenticatedClients(): Promise<
	Record<TestRole, AuthenticatedTestUser>
> {
	const admin = createAdminClient();
	const users = {} as Record<TestRole, AuthenticatedTestUser>;

	for (const role of TEST_ROLES) {
		const email = `test-${role}@teachmesensei.test`;
		const password = 'TestPassword123!';

		// Create user or retrieve existing one (idempotent for re-runs without db reset)
		// Handles concurrent calls from parallel test files by retrying on transient DB errors
		let userId: string;
		const MAX_CREATE_RETRIES = 3;
		for (let attempt = 0; attempt < MAX_CREATE_RETRIES; attempt++) {
			const { data: userData, error } = await admin.auth.admin.createUser({
				email,
				password,
				email_confirm: true
			});
			if (!error) {
				userId = userData.user.id;
				break;
			}
			if (error.message.includes('already been registered')) {
				const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
				const existing = list.users.find((u) => u.email === email);
				if (!existing) throw new Error(`User ${email} reported as existing but not found`);
				userId = existing.id;
				break;
			}
			if (error.message.includes('Database error') && attempt < MAX_CREATE_RETRIES - 1) {
				// Transient DB error (e.g. concurrent user creation) — wait and retry
				await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
				continue;
			}
			throw new Error(`Failed to create ${role} user: ${error.message}`);
		}
		userId = userId!;

		// Set profile role + complete onboarding (via admin client — bypasses RLS)
		const { error: updateError } = await admin
			.from('profiles')
			.update({
				role: role as Database['public']['Enums']['user_role'],
				display_name: `Test ${role.replace('_', ' ')}`,
				onboarding_complete: true,
				topics: role === 'sensei' ? ['Career Development'] : []
			})
			.eq('id', userId);
		if (updateError) throw new Error(`Failed to set ${role} profile: ${updateError.message}`);

		// Create authenticated client for this user
		const client = createClient<Database>(SUPABASE_URL, ANON_KEY, {
			auth: { autoRefreshToken: false, persistSession: false }
		});
		const { error: signInError } = await client.auth.signInWithPassword({ email, password });
		if (signInError) throw new Error(`Failed to sign in ${role}: ${signInError.message}`);

		users[role] = { id: userId, email, role, client };
	}

	return users;
}
