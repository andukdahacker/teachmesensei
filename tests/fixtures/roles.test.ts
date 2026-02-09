import { describe, expect, it } from 'vitest';
import { createTestUsers, TEST_ROLES, type TestRole } from './roles';

describe('createTestUsers', () => {
	it('returns all 5 roles', () => {
		const users = createTestUsers();
		const roles = Object.keys(users) as TestRole[];
		expect(roles).toHaveLength(5);
		expect(roles).toEqual(expect.arrayContaining([...TEST_ROLES]));
	});

	it('each user has id, email, and role fields', () => {
		const users = createTestUsers();
		for (const role of TEST_ROLES) {
			const user = users[role];
			expect(user.id).toBe(`test-${role}-id`);
			expect(user.email).toBe(`test-${role}@teachmesensei.test`);
			expect(user.role).toBe(role);
		}
	});
});
