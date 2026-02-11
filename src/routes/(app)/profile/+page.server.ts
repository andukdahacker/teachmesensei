import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import { updateProfileSchema } from '$lib/schemas/profiles';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const {
		data: { user }
	} = await supabase.auth.getUser();
	if (!user) redirect(303, '/login');

	const { data: profile, error: profileError } = await supabase
		.from('profiles')
		.select('display_name, bio, avatar_url, topics, role, date_of_birth')
		.eq('id', user.id)
		.single();

	if (profileError || !profile) {
		error(500, "We're having trouble loading your profile. Please try again.");
	}

	const form = await superValidate(
		{
			display_name: profile.display_name ?? '',
			bio: profile.bio ?? '',
			avatar_url: profile.avatar_url ?? '',
			topics: profile.topics ?? []
		},
		zod(updateProfileSchema)
	);

	return { profile, form };
};

export const actions: Actions = {
	update_profile: async ({ request, locals: { supabase } }) => {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const form = await superValidate(formData, zod(updateProfileSchema));
		if (!form.valid) return fail(400, { form });

		const { data: profile, error: roleError } = await supabase
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.single();

		if (roleError || !profile) {
			return message(form, "We're having trouble verifying your role. Please try again.", {
				status: 500
			});
		}

		if (profile.role === 'sensei' && (!form.data.topics || form.data.topics.length === 0)) {
			return message(form, 'As a Sensei, please select at least one topic you can help with.', {
				status: 400
			});
		}

		const { error: updateError } = await supabase
			.from('profiles')
			.update({
				display_name: form.data.display_name,
				bio: form.data.bio || null,
				avatar_url: form.data.avatar_url || null,
				topics: form.data.topics
			})
			.eq('id', user.id);

		if (updateError) {
			return message(form, "We're having trouble updating your profile. Please try again.", {
				status: 500
			});
		}

		return message(form, 'Profile updated successfully!');
	}
};
