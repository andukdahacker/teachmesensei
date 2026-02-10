import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'http://localhost:54321',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-key'
}));

import AgeVerificationStep from './AgeVerificationStep.svelte';

afterEach(cleanup);

function createMockFormData() {
	return {
		valid: true,
		data: { date_of_birth: new Date() },
		id: 'age-verification-form',
		posted: false,
		errors: {},
		constraints: {},
		message: undefined,
		tainted: undefined,
		shape: {}
	};
}

describe('AgeVerificationStep', () => {
	it('renders date of birth input', () => {
		const { container } = render(AgeVerificationStep, {
			props: { data: createMockFormData() }
		});
		const dateInput = container.querySelector('input[type="date"]');
		expect(dateInput).not.toBeNull();
	});

	it('renders continue button', () => {
		render(AgeVerificationStep, {
			props: { data: createMockFormData() }
		});
		expect(screen.getByText('Continue')).toBeDefined();
	});

	it('renders heading text', () => {
		render(AgeVerificationStep, {
			props: { data: createMockFormData() }
		});
		expect(screen.getByText("Let's get started")).toBeDefined();
	});

	it('renders age verification description', () => {
		render(AgeVerificationStep, {
			props: { data: createMockFormData() }
		});
		expect(screen.getByText('First, we need to verify your age')).toBeDefined();
	});

	it('form action is set to ?/age_verify', () => {
		const { container } = render(AgeVerificationStep, {
			props: { data: createMockFormData() }
		});
		const form = container.querySelector('form');
		expect(form?.getAttribute('action')).toBe('?/age_verify');
	});

	it('renders Date of Birth label', () => {
		render(AgeVerificationStep, {
			props: { data: createMockFormData() }
		});
		expect(screen.getByText('Date of Birth')).toBeDefined();
	});
});
