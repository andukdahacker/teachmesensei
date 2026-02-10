import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const code = url.searchParams.get('code');
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type');
	const rawNext = url.searchParams.get('next') ?? '/dashboard';
	const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard';
	const error_description = url.searchParams.get('error_description');
	const error_code = url.searchParams.get('error');

	// Handle OAuth/provider errors
	if (error_description || error_code) {
		console.error('Auth callback error:', { error_code, error_description });
		const errorMsg =
			error_code === 'access_denied'
				? "Authentication was cancelled. No worries — try again when you're ready."
				: (error_description ?? 'Something went wrong during sign-in.');
		redirect(303, `/login?error=${encodeURIComponent(errorMsg)}`);
	}

	// OAuth code exchange (Google, GitHub)
	if (code) {
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (error) {
			console.error('Code exchange error:', error.message);
			redirect(
				303,
				`/login?error=${encodeURIComponent("We couldn't complete sign-in. Please try again.")}`
			);
		}
	}
	// Magic link token verification
	else if (token_hash && type) {
		const { error } = await supabase.auth.verifyOtp({
			token_hash,
			type: type as 'email'
		});
		if (error) {
			console.error('Magic link verification error:', error.message);
			redirect(
				303,
				`/login?error=${encodeURIComponent('This magic link has expired or was already used. Please request a new one.')}`
			);
		}
	}
	// No valid auth params
	else {
		redirect(
			303,
			`/login?error=${encodeURIComponent('Something went wrong. Please try signing in again.')}`
		);
	}

	// Auth succeeded — check if new or returning user
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(
			303,
			`/login?error=${encodeURIComponent('Something went wrong. Please try signing in again.')}`
		);
	}

	const { data: profile } = await supabase
		.from('profiles')
		.select('onboarding_complete')
		.eq('id', user.id)
		.single();

	// New user or onboarding incomplete → onboarding flow (Story 2.3 builds the page)
	if (!profile || !profile.onboarding_complete) {
		redirect(303, '/onboarding');
	}

	// Returning user → original destination or dashboard
	redirect(303, next);
};
