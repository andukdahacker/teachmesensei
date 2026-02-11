import { describe, it, expect } from 'vitest';
import { updateProfileSchema } from './profiles';

describe('updateProfileSchema', () => {
	it('accepts valid profile with all fields', () => {
		const result = updateProfileSchema.safeParse({
			display_name: 'Jane Doe',
			bio: 'Software engineer learning new skills',
			avatar_url: 'https://example.com/photo.jpg',
			topics: ['React', 'TypeScript']
		});
		expect(result.success).toBe(true);
	});

	it('accepts profile with only required fields', () => {
		const result = updateProfileSchema.safeParse({
			display_name: 'Jane Doe'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.bio).toBe('');
			expect(result.data.topics).toEqual([]);
		}
	});

	// display_name validation
	it('rejects display_name shorter than 2 characters', () => {
		const result = updateProfileSchema.safeParse({ display_name: 'J' });
		expect(result.success).toBe(false);
	});

	it('rejects missing display_name', () => {
		const result = updateProfileSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('accepts display_name at exactly 2 characters', () => {
		const result = updateProfileSchema.safeParse({ display_name: 'Jo' });
		expect(result.success).toBe(true);
	});

	it('rejects display_name longer than 100 characters', () => {
		const result = updateProfileSchema.safeParse({
			display_name: 'x'.repeat(101)
		});
		expect(result.success).toBe(false);
	});

	it('accepts display_name at exactly 100 characters', () => {
		const result = updateProfileSchema.safeParse({
			display_name: 'x'.repeat(100)
		});
		expect(result.success).toBe(true);
	});

	it('trims whitespace from display_name before validation', () => {
		const result = updateProfileSchema.safeParse({
			display_name: '  Jane Doe  '
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.display_name).toBe('Jane Doe');
		}
	});

	it('rejects whitespace-only display_name after trimming', () => {
		const result = updateProfileSchema.safeParse({
			display_name: '   '
		});
		expect(result.success).toBe(false);
	});

	// bio validation
	it('rejects bio longer than 500 characters', () => {
		const result = updateProfileSchema.safeParse({
			display_name: 'Jane',
			bio: 'x'.repeat(501)
		});
		expect(result.success).toBe(false);
	});

	it('accepts bio at exactly 500 characters', () => {
		const result = updateProfileSchema.safeParse({
			display_name: 'Jane',
			bio: 'x'.repeat(500)
		});
		expect(result.success).toBe(true);
	});

	// avatar_url validation
	it('accepts empty string avatar_url', () => {
		const result = updateProfileSchema.safeParse({
			display_name: 'Jane',
			avatar_url: ''
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid avatar_url', () => {
		const result = updateProfileSchema.safeParse({
			display_name: 'Jane',
			avatar_url: 'not-a-url'
		});
		expect(result.success).toBe(false);
	});

	it('accepts valid avatar_url', () => {
		const result = updateProfileSchema.safeParse({
			display_name: 'Jane',
			avatar_url: 'https://example.com/avatar.png'
		});
		expect(result.success).toBe(true);
	});

	// topics validation
	it('accepts empty topics array', () => {
		const result = updateProfileSchema.safeParse({
			display_name: 'Jane',
			topics: []
		});
		expect(result.success).toBe(true);
	});

	it('accepts topics array with values', () => {
		const result = updateProfileSchema.safeParse({
			display_name: 'Jane',
			topics: ['React', 'TypeScript', 'Career Switching']
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.topics).toEqual(['React', 'TypeScript', 'Career Switching']);
		}
	});

	it('defaults topics to empty array when not provided', () => {
		const result = updateProfileSchema.safeParse({
			display_name: 'Jane'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.topics).toEqual([]);
		}
	});

	it('defaults bio to empty string when not provided', () => {
		const result = updateProfileSchema.safeParse({
			display_name: 'Jane'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.bio).toBe('');
		}
	});
});
