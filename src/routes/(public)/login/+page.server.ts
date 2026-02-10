import { fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import { magicLinkSchema } from '$lib/schemas/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const form = await superValidate(zod(magicLinkSchema));
	const redirectTo = url.searchParams.get('redirectTo') ?? '/dashboard';
	const error = url.searchParams.get('error') ?? null;
	return { form, redirectTo, error };
};

export const actions: Actions = {
	magic_link: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(magicLinkSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const redirectTo = (formData.get('redirectTo') as string) ?? '/dashboard';
		const { error } = await supabase.auth.signInWithOtp({
			email: form.data.email,
			options: {
				emailRedirectTo: `${url.origin}/login/callback?next=${encodeURIComponent(redirectTo)}`
			}
		});

		if (error) {
			return message(form, error.message, { status: 400 });
		}

		return message(form, 'Check your email for a magic link!');
	},

	google: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData();
		const redirectTo = (formData.get('redirectTo') as string) ?? '/dashboard';
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${url.origin}/login/callback?next=${encodeURIComponent(redirectTo)}`
			}
		});
		if (error) {
			return fail(400, {
				error: "We couldn't connect to Google. Please try again or use a different method."
			});
		}
		redirect(303, data.url);
	},

	github: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData();
		const redirectTo = (formData.get('redirectTo') as string) ?? '/dashboard';
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: 'github',
			options: {
				redirectTo: `${url.origin}/login/callback?next=${encodeURIComponent(redirectTo)}`
			}
		});
		if (error) {
			return fail(400, {
				error: "We couldn't connect to GitHub. Please try again or use a different method."
			});
		}
		redirect(303, data.url);
	}
};
