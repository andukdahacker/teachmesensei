import { z } from 'zod';

// Validates the invite code extracted from the URL path.
// Code is always 8 lowercase alphanumeric chars (enforced by DB CHECK constraint).
export const claimInviteCodeSchema = z.object({
	code: z
		.string()
		.length(8)
		.regex(/^[a-z0-9]+$/, 'Invalid invite code format')
});
