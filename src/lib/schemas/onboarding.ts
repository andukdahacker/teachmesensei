import { z } from 'zod';
import { AVAILABLE_TOPICS } from '$lib/constants/topics';

export const ageVerificationSchema = z.object({
	date_of_birth: z.coerce
		.date()
		.refine(
			(date) => {
				// Single Date reference for both checks avoids midnight-boundary divergence
				const today = new Date();
				return date <= today;
			},
			{ message: "Hmm, that date hasn't happened yet — please check and try again" }
		)
		.refine(
			(date) => {
				const today = new Date();
				const eighteenYearsAgo = new Date(
					today.getFullYear() - 18,
					today.getMonth(),
					today.getDate()
				);
				return date <= eighteenYearsAgo;
			},
			{
				message:
					"TeachMeSensei is designed for adults navigating career transitions. Come back when you're 18!"
			}
		)
});

export const roleSelectionSchema = z.object({
	role: z.enum(['learner', 'sensei'])
});

export const profileSetupSchema = z.object({
	display_name: z
		.string()
		.trim()
		.min(2, 'Name must be at least 2 characters')
		.max(100, 'Name must be 100 characters or less'),
	bio: z.string().max(500, 'Bio must be 500 characters or less').optional().default(''),
	avatar_url: z.url('Please enter a valid URL').optional().or(z.literal('')),
	topics: z
		.array(
			z.string().refine((t) => (AVAILABLE_TOPICS as readonly string[]).includes(t), {
				message: 'Invalid topic selection'
			})
		)
		.default([])
});
