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

/**
 * Creates test user objects for each role.
 * Stub implementation — returns placeholder data.
 * Will be replaced with actual Supabase user creation in Epic 2.
 */
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
