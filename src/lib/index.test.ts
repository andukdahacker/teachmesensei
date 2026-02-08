import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('project setup', () => {
	it('should have vitest configured correctly', () => {
		expect(cn('foo', 'bar')).toBe('foo bar');
	});

	it('should merge conflicting tailwind classes', () => {
		expect(cn('px-2', 'px-4')).toBe('px-4');
	});
});
