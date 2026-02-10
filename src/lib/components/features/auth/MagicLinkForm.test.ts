import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'http://localhost:54321',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-key'
}));

import MagicLinkForm from './MagicLinkForm.svelte';

afterEach(cleanup);

function createMockFormData() {
	return {
		valid: true,
		data: { email: '' },
		id: 'magic-link-form',
		posted: false,
		errors: {},
		constraints: {},
		message: undefined,
		tainted: undefined,
		shape: {}
	};
}

describe('MagicLinkForm', () => {
	it('renders email input and submit button', () => {
		render(MagicLinkForm, {
			props: { data: createMockFormData(), redirectTo: '/dashboard' }
		});
		expect(screen.getByPlaceholderText('your@email.com')).toBeDefined();
		expect(screen.getByText('Send Magic Link')).toBeDefined();
	});

	it('renders the email label', () => {
		render(MagicLinkForm, {
			props: { data: createMockFormData(), redirectTo: '/dashboard' }
		});
		expect(screen.getByText('Email')).toBeDefined();
	});

	it('includes redirectTo as hidden input', () => {
		const { container } = render(MagicLinkForm, {
			props: { data: createMockFormData(), redirectTo: '/settings' }
		});
		const hiddenInput = container.querySelector(
			'input[type="hidden"][name="redirectTo"]'
		) as HTMLInputElement;
		expect(hiddenInput).not.toBeNull();
		expect(hiddenInput.value).toBe('/settings');
	});

	it('form action is set to ?/magic_link', () => {
		const { container } = render(MagicLinkForm, {
			props: { data: createMockFormData(), redirectTo: '/dashboard' }
		});
		const form = container.querySelector('form');
		expect(form?.getAttribute('action')).toBe('?/magic_link');
	});
});
