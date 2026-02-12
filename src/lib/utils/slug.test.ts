import { describe, it, expect } from 'vitest';
import { generateSlug } from './slug';

describe('generateSlug', () => {
	it('converts display name to URL-friendly slug', () => {
		expect(generateSlug('Marcus Chen')).toBe('marcus-chen');
	});

	it('returns empty string for empty input', () => {
		expect(generateSlug('')).toBe('');
	});

	it('removes special characters', () => {
		expect(generateSlug("John O'Brien!")).toBe('john-obrien');
	});

	it('collapses multiple spaces to single dash', () => {
		expect(generateSlug('Jane   Doe')).toBe('jane-doe');
	});

	it('collapses multiple dashes', () => {
		expect(generateSlug('foo---bar')).toBe('foo-bar');
	});

	it('truncates to 30 characters', () => {
		const longName = 'a'.repeat(50);
		expect(generateSlug(longName)).toHaveLength(30);
	});

	it('trims whitespace', () => {
		expect(generateSlug('  Alice  ')).toBe('alice');
	});

	it('strips non-ASCII characters', () => {
		// Unicode letters outside a-z are removed by the regex
		expect(generateSlug('André Müller')).toBe('andr-mller');
	});

	it('returns empty string when input is only special characters', () => {
		expect(generateSlug('!@#$%^&*()')).toBe('');
	});

	it('preserves numbers', () => {
		expect(generateSlug('User 123')).toBe('user-123');
	});

	it('handles mixed dashes and spaces', () => {
		expect(generateSlug('foo - bar  -  baz')).toBe('foo-bar-baz');
	});
});
