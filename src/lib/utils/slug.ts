/**
 * Converts a display name to a URL-friendly slug.
 * Used for invite code shareable URLs: /invite/{slug}-{code}
 */
export function generateSlug(displayName: string): string {
	return displayName
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.slice(0, 30);
}
