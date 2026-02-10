import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import OAuthButtons from './OAuthButtons.svelte';

afterEach(cleanup);

describe('OAuthButtons', () => {
	it('renders Google and GitHub buttons', () => {
		render(OAuthButtons, { props: { redirectTo: '/dashboard' } });
		expect(screen.getByText('Continue with Google')).toBeDefined();
		expect(screen.getByText('Continue with GitHub')).toBeDefined();
	});

	it('renders two forms with correct actions', () => {
		const { container } = render(OAuthButtons, { props: { redirectTo: '/dashboard' } });
		const forms = container.querySelectorAll('form');
		expect(forms).toHaveLength(2);

		const actions = Array.from(forms).map((f) => f.getAttribute('action'));
		expect(actions).toContain('?/google');
		expect(actions).toContain('?/github');
	});

	it('includes redirectTo as hidden input in both forms', () => {
		const { container } = render(OAuthButtons, { props: { redirectTo: '/settings' } });
		const hiddenInputs = container.querySelectorAll('input[type="hidden"][name="redirectTo"]');
		expect(hiddenInputs).toHaveLength(2);
		hiddenInputs.forEach((input) => {
			expect((input as HTMLInputElement).value).toBe('/settings');
		});
	});

	it('displays error message when error prop is provided', () => {
		render(OAuthButtons, {
			props: {
				redirectTo: '/dashboard',
				error: "We couldn't sign you in with Google. Please try again."
			}
		});
		expect(
			screen.getByText("We couldn't sign you in with Google. Please try again.")
		).toBeDefined();
	});

	it('does not display error message when error is null', () => {
		const { container } = render(OAuthButtons, {
			props: { redirectTo: '/dashboard', error: null }
		});
		const errorDiv = container.querySelector('.bg-amber-50');
		expect(errorDiv).toBeNull();
	});
});
