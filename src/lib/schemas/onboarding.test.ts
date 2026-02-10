import { describe, it, expect } from 'vitest';
import { ageVerificationSchema, roleSelectionSchema, profileSetupSchema } from './onboarding';

describe('ageVerificationSchema', () => {
	it('accepts a valid date of birth for an adult (18+)', () => {
		const result = ageVerificationSchema.safeParse({
			date_of_birth: '2000-01-15'
		});
		expect(result.success).toBe(true);
	});

	it('accepts someone turning 18 today', () => {
		const today = new Date();
		const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
		const dateStr = eighteenYearsAgo.toISOString().split('T')[0];
		const result = ageVerificationSchema.safeParse({
			date_of_birth: dateStr
		});
		expect(result.success).toBe(true);
	});

	it('rejects someone under 18', () => {
		const today = new Date();
		const seventeenYearsAgo = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
		const dateStr = seventeenYearsAgo.toISOString().split('T')[0];
		const result = ageVerificationSchema.safeParse({
			date_of_birth: dateStr
		});
		expect(result.success).toBe(false);
	});

	it('rejects a future date of birth', () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		const dateStr = tomorrow.toISOString().split('T')[0];
		const result = ageVerificationSchema.safeParse({
			date_of_birth: dateStr
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing date_of_birth', () => {
		const result = ageVerificationSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('rejects invalid date string', () => {
		const result = ageVerificationSchema.safeParse({
			date_of_birth: 'not-a-date'
		});
		expect(result.success).toBe(false);
	});

	it('accepts a very old date of birth', () => {
		const result = ageVerificationSchema.safeParse({
			date_of_birth: '1940-05-20'
		});
		expect(result.success).toBe(true);
	});

	it('includes warm under-18 message in error', () => {
		const today = new Date();
		const fifteenYearsAgo = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
		const dateStr = fifteenYearsAgo.toISOString().split('T')[0];
		const result = ageVerificationSchema.safeParse({
			date_of_birth: dateStr
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			const messages = result.error.issues.map((i) => i.message);
			expect(messages.some((m) => m.includes("Come back when you're 18"))).toBe(true);
		}
	});
});

describe('roleSelectionSchema', () => {
	it('accepts learner role', () => {
		const result = roleSelectionSchema.safeParse({ role: 'learner' });
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.role).toBe('learner');
	});

	it('accepts sensei role', () => {
		const result = roleSelectionSchema.safeParse({ role: 'sensei' });
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.role).toBe('sensei');
	});

	it('rejects invalid role', () => {
		const result = roleSelectionSchema.safeParse({ role: 'admin' });
		expect(result.success).toBe(false);
	});

	it('rejects missing role', () => {
		const result = roleSelectionSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('rejects empty string role', () => {
		const result = roleSelectionSchema.safeParse({ role: '' });
		expect(result.success).toBe(false);
	});
});

describe('profileSetupSchema', () => {
	it('accepts valid profile with all fields', () => {
		const result = profileSetupSchema.safeParse({
			display_name: 'Jane Doe',
			bio: 'Software engineer learning new skills',
			avatar_url: 'https://example.com/photo.jpg',
			topics: ['React', 'TypeScript']
		});
		expect(result.success).toBe(true);
	});

	it('accepts profile with only required fields', () => {
		const result = profileSetupSchema.safeParse({
			display_name: 'Jane Doe'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.bio).toBe('');
			expect(result.data.topics).toEqual([]);
		}
	});

	it('rejects display_name shorter than 2 characters', () => {
		const result = profileSetupSchema.safeParse({
			display_name: 'J'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing display_name', () => {
		const result = profileSetupSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('rejects bio longer than 500 characters', () => {
		const result = profileSetupSchema.safeParse({
			display_name: 'Jane',
			bio: 'x'.repeat(501)
		});
		expect(result.success).toBe(false);
	});

	it('accepts bio at exactly 500 characters', () => {
		const result = profileSetupSchema.safeParse({
			display_name: 'Jane',
			bio: 'x'.repeat(500)
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty string avatar_url', () => {
		const result = profileSetupSchema.safeParse({
			display_name: 'Jane',
			avatar_url: ''
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid avatar_url', () => {
		const result = profileSetupSchema.safeParse({
			display_name: 'Jane',
			avatar_url: 'not-a-url'
		});
		expect(result.success).toBe(false);
	});

	it('accepts valid avatar_url', () => {
		const result = profileSetupSchema.safeParse({
			display_name: 'Jane',
			avatar_url: 'https://example.com/avatar.png'
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty topics array', () => {
		const result = profileSetupSchema.safeParse({
			display_name: 'Jane',
			topics: []
		});
		expect(result.success).toBe(true);
	});

	it('accepts topics array with values', () => {
		const result = profileSetupSchema.safeParse({
			display_name: 'Jane',
			topics: ['React', 'TypeScript', 'Career Switching']
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.topics).toEqual(['React', 'TypeScript', 'Career Switching']);
		}
	});

	it('accepts display_name at exactly 2 characters', () => {
		const result = profileSetupSchema.safeParse({
			display_name: 'Jo'
		});
		expect(result.success).toBe(true);
	});

	it('rejects display_name longer than 100 characters', () => {
		const result = profileSetupSchema.safeParse({
			display_name: 'x'.repeat(101)
		});
		expect(result.success).toBe(false);
	});

	it('accepts display_name at exactly 100 characters', () => {
		const result = profileSetupSchema.safeParse({
			display_name: 'x'.repeat(100)
		});
		expect(result.success).toBe(true);
	});

	it('trims whitespace from display_name before validation', () => {
		const result = profileSetupSchema.safeParse({
			display_name: '  Jane Doe  '
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.display_name).toBe('Jane Doe');
		}
	});

	it('rejects whitespace-only display_name after trimming', () => {
		const result = profileSetupSchema.safeParse({
			display_name: '   '
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid topic not in AVAILABLE_TOPICS', () => {
		const result = profileSetupSchema.safeParse({
			display_name: 'Jane',
			topics: ['React', 'Not A Real Topic']
		});
		expect(result.success).toBe(false);
	});

	it('accepts only valid topics from AVAILABLE_TOPICS', () => {
		const result = profileSetupSchema.safeParse({
			display_name: 'Jane',
			topics: ['React', 'TypeScript', 'Career Switching']
		});
		expect(result.success).toBe(true);
	});
});
