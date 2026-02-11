import { z } from 'zod';

export const updateProfileSchema = z.object({
	display_name: z
		.string()
		.trim()
		.min(2, 'Name must be at least 2 characters')
		.max(100, 'Name must be 100 characters or less'),
	bio: z.string().max(500, 'Bio must be 500 characters or less').optional().default(''),
	avatar_url: z.url('Please enter a valid URL').optional().or(z.literal('')),
	topics: z.array(z.string()).default([])
});
