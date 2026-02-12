import { error, redirect, fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import { generateInviteCodeSchema } from '$lib/schemas/invites';
import { PUBLIC_APP_URL } from '$env/static/public';
import { generateSlug } from '$lib/utils/slug';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const {
		data: { user }
	} = await supabase.auth.getUser();
	if (!user) redirect(303, '/login');

	const { data: profile } = await supabase
		.from('profiles')
		.select('role, display_name')
		.eq('id', user.id)
		.single();

	if (!profile || profile.role !== 'sensei') {
		redirect(303, '/dashboard');
	}

	const { data: inviteCodes, error: codesError } = await supabase
		.from('invite_codes')
		.select(
			`
			id,
			code,
			shareable_url,
			status,
			claimed_by,
			claimed_at,
			created_at,
			claimer:profiles!claimed_by(display_name, avatar_url)
		`
		)
		.eq('sensei_id', user.id)
		.order('created_at', { ascending: true });

	if (codesError) {
		throw error(500, 'Unable to load your invite codes right now. Please try again.');
	}

	const form = await superValidate(zod(generateInviteCodeSchema));

	return {
		inviteCodes: inviteCodes ?? [],
		form
	};
};

export const actions: Actions = {
	generate_code: async ({ request, locals: { supabase }, url }) => {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const form = await superValidate(formData, zod(generateInviteCodeSchema));
		if (!form.valid) return fail(400, { form });

		const { data: profile } = await supabase
			.from('profiles')
			.select('role, display_name')
			.eq('id', user.id)
			.single();

		if (!profile || profile.role !== 'sensei') {
			return message(form, 'Only senseis can generate invite codes.', { status: 403 });
		}

		const { count, error: countError } = await supabase
			.from('invite_codes')
			.select('id', { count: 'exact', head: true })
			.eq('sensei_id', user.id);

		if (countError) {
			return message(form, 'Something went wrong checking your codes. Please try again.', {
				status: 500
			});
		}

		if ((count ?? 0) >= 5) {
			return message(
				form,
				"You've shared all 5 invite codes! If you need more, reach out to us — we'd love to help you grow your mentorship circle.",
				{ status: 400 }
			);
		}

		const baseUrl = PUBLIC_APP_URL || url.origin;
		const MAX_RETRIES = 3;

		for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
			const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
			const bytes = crypto.getRandomValues(new Uint8Array(8));
			const code = Array.from(bytes, (b) => chars[b % chars.length]).join('');
			const slug = generateSlug(profile.display_name || 'sensei');
			const shareable_url = `${baseUrl}/invite/${slug}-${code}`;

			const { error: insertError } = await supabase
				.from('invite_codes')
				.insert({ sensei_id: user.id, code, shareable_url });

			if (!insertError) {
				return message(form, 'Invite code created!');
			}

			// Supabase returns code '23505' for unique constraint violation
			if (insertError.code !== '23505') {
				return message(
					form,
					'Something went wrong creating your invite code. Please try again in a moment.',
					{ status: 500 }
				);
			}
			// Code collision — retry with new random code
		}

		return message(
			form,
			'Something went wrong creating your invite code. Please try again in a moment.',
			{ status: 500 }
		);
	}
};
