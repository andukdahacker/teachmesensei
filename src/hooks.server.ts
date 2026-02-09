import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';

const resolveOptions = {
	filterSerializedResponseHeaders(name: string) {
		return name === 'content-range' || name === 'x-supabase-api-version';
	}
};

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});

	let sessionCache: {
		session: import('@supabase/supabase-js').Session | null;
		user: import('@supabase/supabase-js').User | null;
	} | null = null;

	event.locals.safeGetSession = async () => {
		if (sessionCache) return sessionCache;
		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) {
			sessionCache = { session: null, user: null };
			return sessionCache;
		}
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		sessionCache = { session, user };
		return sessionCache;
	};

	const { user } = await event.locals.safeGetSession();

	const routeId = event.route.id ?? '';

	// Public routes and API routes — always accessible
	if (routeId.startsWith('/(public)') || routeId.startsWith('/api')) {
		return resolve(event, resolveOptions);
	}

	// All other routes require authentication
	if (!user) {
		return new Response(null, {
			status: 303,
			headers: { location: '/login' }
		});
	}

	// Admin routes — require admin or platform_admin role
	if (routeId.startsWith('/(admin)')) {
		const role = user.app_metadata?.role;
		if (role !== 'admin' && role !== 'platform_admin') {
			return new Response('Forbidden', { status: 403 });
		}
	}

	// Enterprise routes — require team_lead or org_admin role
	if (routeId.startsWith('/(enterprise)')) {
		const role = user.app_metadata?.role;
		if (role !== 'team_lead' && role !== 'org_admin') {
			return new Response('Forbidden', { status: 403 });
		}
	}

	return resolve(event, resolveOptions);
};
