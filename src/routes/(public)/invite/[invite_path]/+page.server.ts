import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import { claimInviteCodeSchema } from '$lib/schemas/connections';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase }, url }) => {
	const code = params.invite_path.slice(-8);

	// get_invite_details() is SECURITY DEFINER — works for anon + authenticated
	const { data: inviteDetails, error: rpcError } = await supabase.rpc('get_invite_details', {
		code_value: code
	});

	if (rpcError) {
		error(500, 'Something went wrong loading this invite. Please try again in a moment.');
	}

	if (!inviteDetails) {
		error(404, "We couldn't find that invite code. It may have been removed or doesn't exist.");
	}

	// Check if user is authenticated (optional on public page)
	const {
		data: { user }
	} = await supabase.auth.getUser();

	let userRole: string | null = null;
	if (user) {
		const { data: profile } = await supabase
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.single();
		userRole = profile?.role ?? null;
	}

	const form = await superValidate({ code }, zod(claimInviteCodeSchema));

	return {
		inviteDetails,
		isAuthenticated: !!user,
		userRole,
		form,
		invitePath: url.pathname
	};
};

export const actions: Actions = {
	claim: async ({ request, locals: { supabase } }) => {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) {
			const invitePath = new URL(request.url).pathname;
			redirect(303, `/login?redirectTo=${encodeURIComponent(invitePath)}`);
		}

		const formData = await request.formData();
		const form = await superValidate(formData, zod(claimInviteCodeSchema));
		if (!form.valid) return fail(400, { form });

		// Call atomic claim function
		const { data: result, error: rpcError } = await supabase.rpc('claim_invite_code', {
			code_value: form.data.code
		});

		if (rpcError) {
			return message(form, 'Something went wrong connecting you. Please try again in a moment.', {
				status: 500
			});
		}

		if (result?.error) {
			const errorMessages: Record<string, string> = {
				already_claimed: 'This invite code has already been claimed',
				already_connected: "You're already connected with this Sensei!",
				not_found: "We couldn't find that invite code",
				not_learner: 'Only learners can claim invite codes',
				not_authenticated: 'Please log in first to claim this invite code',
				self_connection: "You can't claim your own invite code"
			};
			return message(
				form,
				errorMessages[result.error] ?? 'Something went wrong. Please try again.',
				{ status: 400 }
			);
		}

		return message(
			form,
			`You're now connected with ${result.sensei_name}! Visit your dashboard to see your connections.`
		);
	}
};
