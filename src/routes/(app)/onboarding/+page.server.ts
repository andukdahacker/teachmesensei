import { fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import {
	ageVerificationSchema,
	roleSelectionSchema,
	profileSetupSchema
} from '$lib/schemas/onboarding';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const {
		data: { user }
	} = await supabase.auth.getUser();
	if (!user) redirect(303, '/login');

	const { data: profile } = await supabase
		.from('profiles')
		.select('display_name, avatar_url, bio, role, date_of_birth, topics, onboarding_complete')
		.eq('id', user.id)
		.single();

	if (profile?.onboarding_complete) redirect(303, '/dashboard');

	// Determine max allowed step from DB state (prevents skipping)
	// NOTE: Step 3 is gated by date_of_birth + URL param only. Users can skip role
	// selection via URL manipulation, defaulting to 'learner'. A proper fix requires
	// additional DB state (e.g., role_selected_at column). Accepted for Phase 1 —
	// users can change role in profile management (Story 2.4).
	let maxAllowedStep = 1;
	if (profile?.date_of_birth) maxAllowedStep = 2;

	const requestedStep = parseInt(url.searchParams.get('step') ?? '1') || 1;
	if (profile?.date_of_birth && requestedStep >= 3) maxAllowedStep = 3;

	const currentStep = Math.min(requestedStep, maxAllowedStep);

	const ageForm = await superValidate(zod(ageVerificationSchema));
	const roleForm = await superValidate(zod(roleSelectionSchema));
	const profileForm = await superValidate(
		{
			display_name: profile?.display_name ?? '',
			bio: profile?.bio ?? '',
			avatar_url: profile?.avatar_url ?? '',
			topics: profile?.topics ?? []
		},
		zod(profileSetupSchema)
	);

	return { currentStep, profile, ageForm, roleForm, profileForm };
};

export const actions: Actions = {
	age_verify: async ({ request, locals: { supabase } }) => {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const form = await superValidate(formData, zod(ageVerificationSchema));
		if (!form.valid) return fail(400, { ageForm: form, step: 1 });

		const { error } = await supabase
			.from('profiles')
			.update({ date_of_birth: form.data.date_of_birth.toISOString().split('T')[0] })
			.eq('id', user.id);

		if (error) {
			return message(form, "We're having trouble saving your information. Please try again.", {
				status: 500
			});
		}

		redirect(303, '/onboarding?step=2');
	},

	select_role: async ({ request, locals: { supabase } }) => {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const form = await superValidate(formData, zod(roleSelectionSchema));
		if (!form.valid) return fail(400, { roleForm: form, step: 2 });

		const { error } = await supabase
			.from('profiles')
			.update({ role: form.data.role })
			.eq('id', user.id);

		if (error) {
			return message(form, "We're having trouble saving your role. Please try again.", {
				status: 500
			});
		}

		redirect(303, '/onboarding?step=3');
	},

	complete_profile: async ({ request, locals: { supabase } }) => {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const form = await superValidate(formData, zod(profileSetupSchema));
		if (!form.valid) return fail(400, { profileForm: form, step: 3 });

		// For sensei, topics are required (min 1)
		const { data: profile } = await supabase
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.single();

		if (profile?.role === 'sensei' && (!form.data.topics || form.data.topics.length === 0)) {
			return message(form, 'As a Sensei, please select at least one topic you can help with.', {
				status: 400
			});
		}

		const { error } = await supabase
			.from('profiles')
			.update({
				display_name: form.data.display_name,
				bio: form.data.bio || null,
				avatar_url: form.data.avatar_url || null,
				topics: form.data.topics,
				onboarding_complete: true
			})
			.eq('id', user.id);

		if (error) {
			return message(form, "We're having trouble completing your profile. Please try again.", {
				status: 500
			});
		}

		redirect(303, '/dashboard');
	}
};
