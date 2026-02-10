import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RequestEvent, ResolveOptions } from '@sveltejs/kit';

// Mock @supabase/ssr
const mockGetUser = vi.fn();
const mockGetSession = vi.fn();
const mockSingle = vi.fn();

vi.mock('@supabase/ssr', () => ({
	createServerClient: vi.fn(() => ({
		auth: {
			getUser: mockGetUser,
			getSession: mockGetSession
		},
		from: vi.fn(() => ({
			select: vi.fn(() => ({
				eq: vi.fn(() => ({
					single: mockSingle
				}))
			}))
		}))
	}))
}));

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'http://localhost:54321',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-key'
}));

import { handle } from './hooks.server';

function createMockEvent(overrides: Partial<RequestEvent> = {}): RequestEvent {
	const cookies = {
		getAll: vi.fn(() => []),
		set: vi.fn(),
		get: vi.fn(),
		delete: vi.fn(),
		serialize: vi.fn()
	};

	return {
		cookies,
		locals: {} as RequestEvent['locals'],
		url: new URL('http://localhost:3000/'),
		route: { id: '/' },
		request: new Request('http://localhost:3000/'),
		params: {},
		isDataRequest: false,
		isSubRequest: false,
		platform: undefined,
		fetch: vi.fn(),
		getClientAddress: vi.fn(() => '127.0.0.1'),
		setHeaders: vi.fn(),
		...overrides
	} as unknown as RequestEvent;
}

function createMockResolve() {
	return vi.fn(() => new Response('OK', { status: 200 }));
}

describe('hooks.server.ts', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'No user' } });
		mockGetSession.mockResolvedValue({ data: { session: null } });
		mockSingle.mockResolvedValue({ data: { onboarding_complete: true }, error: null });
	});

	describe('Supabase client setup', () => {
		it('attaches supabase client to event.locals', async () => {
			const event = createMockEvent({ route: { id: '/(public)' } });
			const resolve = createMockResolve();

			await handle({ event, resolve });

			expect(event.locals.supabase).toBeDefined();
			expect(event.locals.supabase.auth).toBeDefined();
		});

		it('attaches safeGetSession to event.locals', async () => {
			const event = createMockEvent({ route: { id: '/(public)' } });
			const resolve = createMockResolve();

			await handle({ event, resolve });

			expect(event.locals.safeGetSession).toBeDefined();
			expect(typeof event.locals.safeGetSession).toBe('function');
		});
	});

	describe('safeGetSession', () => {
		it('returns session and user when getUser succeeds', async () => {
			const mockUser = { id: 'user-1', email: 'test@test.com' };
			const mockSession = { access_token: 'token', user: mockUser };

			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
			mockGetSession.mockResolvedValue({ data: { session: mockSession } });

			const event = createMockEvent({ route: { id: '/(public)' } });
			const resolve = createMockResolve();

			await handle({ event, resolve });

			const result = await event.locals.safeGetSession();
			expect(result.user).toEqual(mockUser);
			expect(result.session).toEqual(mockSession);
		});

		it('returns null session and user when getUser fails', async () => {
			mockGetUser.mockResolvedValue({
				data: { user: null },
				error: { message: 'Invalid token' }
			});

			const event = createMockEvent({ route: { id: '/(public)' } });
			const resolve = createMockResolve();

			await handle({ event, resolve });

			const result = await event.locals.safeGetSession();
			expect(result.session).toBeNull();
			expect(result.user).toBeNull();
		});
	});

	describe('Route guards — (public) routes', () => {
		it('allows unauthenticated access to (public) routes', async () => {
			const event = createMockEvent({ route: { id: '/(public)' } });
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(resolve).toHaveBeenCalled();
			expect(response.status).toBe(200);
		});
	});

	describe('Route guards — API routes', () => {
		it('allows unauthenticated access to /api routes', async () => {
			const event = createMockEvent({
				route: { id: '/api/health' },
				url: new URL('http://localhost:3000/api/health')
			});
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(resolve).toHaveBeenCalled();
			expect(response.status).toBe(200);
		});
	});

	describe('Route guards — (app) routes', () => {
		it('redirects unauthenticated users to /login with redirectTo param', async () => {
			const event = createMockEvent({
				route: { id: '/(app)/dashboard' },
				url: new URL('http://localhost:3000/dashboard')
			});
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(response.status).toBe(303);
			const location = response.headers.get('location')!;
			expect(location).toContain('/login?redirectTo=');
			expect(location).toContain(encodeURIComponent('/dashboard'));
		});

		it('preserves query string in redirectTo param', async () => {
			const event = createMockEvent({
				route: { id: '/(app)/dashboard' },
				url: new URL('http://localhost:3000/dashboard?tab=profile')
			});
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(response.status).toBe(303);
			const location = response.headers.get('location')!;
			expect(location).toContain(encodeURIComponent('/dashboard?tab=profile'));
		});

		it('allows authenticated users', async () => {
			const mockUser = { id: 'user-1', email: 'test@test.com' };
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
			mockGetSession.mockResolvedValue({
				data: { session: { access_token: 'token', user: mockUser } }
			});

			const event = createMockEvent({ route: { id: '/(app)/dashboard' } });
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(resolve).toHaveBeenCalled();
			expect(response.status).toBe(200);
		});
	});

	describe('Route guards — (admin) routes', () => {
		it('redirects unauthenticated users to /login with redirectTo', async () => {
			const event = createMockEvent({ route: { id: '/(admin)/admin' } });
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(response.status).toBe(303);
			expect(response.headers.get('location')).toContain('/login?redirectTo=');
		});

		it('returns 403 for authenticated users without admin role', async () => {
			const mockUser = { id: 'user-1', email: 'test@test.com', app_metadata: { role: 'learner' } };
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
			mockGetSession.mockResolvedValue({
				data: { session: { access_token: 'token', user: mockUser } }
			});

			const event = createMockEvent({ route: { id: '/(admin)/admin' } });
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(response.status).toBe(403);
		});

		it('allows admin role users', async () => {
			const mockUser = {
				id: 'user-1',
				email: 'admin@test.com',
				app_metadata: { role: 'admin' }
			};
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
			mockGetSession.mockResolvedValue({
				data: { session: { access_token: 'token', user: mockUser } }
			});

			const event = createMockEvent({ route: { id: '/(admin)/admin' } });
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(resolve).toHaveBeenCalled();
			expect(response.status).toBe(200);
		});

		it('allows platform_admin role users', async () => {
			const mockUser = {
				id: 'user-1',
				email: 'admin@test.com',
				app_metadata: { role: 'platform_admin' }
			};
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
			mockGetSession.mockResolvedValue({
				data: { session: { access_token: 'token', user: mockUser } }
			});

			const event = createMockEvent({ route: { id: '/(admin)/admin' } });
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(resolve).toHaveBeenCalled();
			expect(response.status).toBe(200);
		});
	});

	describe('Route guards — (enterprise) routes', () => {
		it('redirects unauthenticated users to /login with redirectTo', async () => {
			const event = createMockEvent({ route: { id: '/(enterprise)/enterprise' } });
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(response.status).toBe(303);
			expect(response.headers.get('location')).toContain('/login?redirectTo=');
		});

		it('returns 403 for authenticated users without enterprise role', async () => {
			const mockUser = { id: 'user-1', email: 'test@test.com', app_metadata: { role: 'learner' } };
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
			mockGetSession.mockResolvedValue({
				data: { session: { access_token: 'token', user: mockUser } }
			});

			const event = createMockEvent({ route: { id: '/(enterprise)/enterprise' } });
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(response.status).toBe(403);
		});

		it('allows team_lead role users', async () => {
			const mockUser = {
				id: 'user-1',
				email: 'lead@test.com',
				app_metadata: { role: 'team_lead' }
			};
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
			mockGetSession.mockResolvedValue({
				data: { session: { access_token: 'token', user: mockUser } }
			});

			const event = createMockEvent({ route: { id: '/(enterprise)/enterprise' } });
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(resolve).toHaveBeenCalled();
			expect(response.status).toBe(200);
		});

		it('allows org_admin role users', async () => {
			const mockUser = {
				id: 'user-1',
				email: 'orgadmin@test.com',
				app_metadata: { role: 'org_admin' }
			};
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
			mockGetSession.mockResolvedValue({
				data: { session: { access_token: 'token', user: mockUser } }
			});

			const event = createMockEvent({ route: { id: '/(enterprise)/enterprise' } });
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(resolve).toHaveBeenCalled();
			expect(response.status).toBe(200);
		});
	});

	describe('Route guards — no route group (fallback)', () => {
		it('redirects unauthenticated users to /login with redirectTo when route has no group', async () => {
			const event = createMockEvent({ route: { id: '/' } });
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(response.status).toBe(303);
			expect(response.headers.get('location')).toContain('/login?redirectTo=');
		});

		it('redirects unauthenticated users when route.id is null', async () => {
			const event = createMockEvent({ route: { id: null } });
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(response.status).toBe(303);
			expect(response.headers.get('location')).toContain('/login?redirectTo=');
		});

		it('allows authenticated users on routes with no group', async () => {
			const mockUser = { id: 'user-1', email: 'test@test.com' };
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
			mockGetSession.mockResolvedValue({
				data: { session: { access_token: 'token', user: mockUser } }
			});

			const event = createMockEvent({ route: { id: '/' } });
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(resolve).toHaveBeenCalled();
			expect(response.status).toBe(200);
		});
	});

	describe('Route guards — undefined app_metadata', () => {
		it('returns 403 for admin route when app_metadata is undefined', async () => {
			const mockUser = { id: 'user-1', email: 'test@test.com' };
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
			mockGetSession.mockResolvedValue({
				data: { session: { access_token: 'token', user: mockUser } }
			});

			const event = createMockEvent({ route: { id: '/(admin)/admin' } });
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(response.status).toBe(403);
		});

		it('returns 403 for admin route when app_metadata is empty object', async () => {
			const mockUser = { id: 'user-1', email: 'test@test.com', app_metadata: {} };
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
			mockGetSession.mockResolvedValue({
				data: { session: { access_token: 'token', user: mockUser } }
			});

			const event = createMockEvent({ route: { id: '/(admin)/admin' } });
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(response.status).toBe(403);
		});

		it('returns 403 for enterprise route when app_metadata is undefined', async () => {
			const mockUser = { id: 'user-1', email: 'test@test.com' };
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
			mockGetSession.mockResolvedValue({
				data: { session: { access_token: 'token', user: mockUser } }
			});

			const event = createMockEvent({ route: { id: '/(enterprise)/enterprise' } });
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(response.status).toBe(403);
		});

		it('returns 403 for enterprise route when app_metadata is empty object', async () => {
			const mockUser = { id: 'user-1', email: 'test@test.com', app_metadata: {} };
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
			mockGetSession.mockResolvedValue({
				data: { session: { access_token: 'token', user: mockUser } }
			});

			const event = createMockEvent({ route: { id: '/(enterprise)/enterprise' } });
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(response.status).toBe(403);
		});
	});

	describe('safeGetSession caching', () => {
		it('returns cached result on second call without additional Supabase calls', async () => {
			const mockUser = { id: 'user-1', email: 'test@test.com' };
			const mockSession = { access_token: 'token', user: mockUser };

			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
			mockGetSession.mockResolvedValue({ data: { session: mockSession } });

			const event = createMockEvent({ route: { id: '/(public)' } });
			const resolve = createMockResolve();

			await handle({ event, resolve });

			// First call already happened in handle(). Reset call counts.
			const getUserCallCount = mockGetUser.mock.calls.length;
			const getSessionCallCount = mockGetSession.mock.calls.length;

			// Second call should return cached result
			const result = await event.locals.safeGetSession();
			expect(result.user).toEqual(mockUser);
			expect(result.session).toEqual(mockSession);

			// No additional Supabase calls
			expect(mockGetUser.mock.calls.length).toBe(getUserCallCount);
			expect(mockGetSession.mock.calls.length).toBe(getSessionCallCount);
		});
	});

	describe('filterSerializedResponseHeaders', () => {
		it('passes content-range and x-supabase-api-version headers', async () => {
			const mockUser = { id: 'user-1', email: 'test@test.com' };
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
			mockGetSession.mockResolvedValue({
				data: { session: { access_token: 'token', user: mockUser } }
			});

			const event = createMockEvent({ route: { id: '/(app)/dashboard' } });
			const resolve = vi.fn(
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				(_event: RequestEvent, _opts?: ResolveOptions) => new Response('OK', { status: 200 })
			);

			await handle({ event, resolve });

			expect(resolve).toHaveBeenCalledTimes(1);
			const capturedOpts = resolve.mock.calls[0][1]!;
			expect(capturedOpts).toBeDefined();
			expect(capturedOpts.filterSerializedResponseHeaders!('content-range', '')).toBe(true);
			expect(capturedOpts.filterSerializedResponseHeaders!('x-supabase-api-version', '')).toBe(
				true
			);
			expect(capturedOpts.filterSerializedResponseHeaders!('x-custom-header', '')).toBe(false);
		});
	});

	describe('Onboarding redirect guard', () => {
		it('redirects unonboarded user from (app) route to /onboarding', async () => {
			const mockUser = { id: 'user-1', email: 'test@test.com' };
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
			mockGetSession.mockResolvedValue({
				data: { session: { access_token: 'token', user: mockUser } }
			});
			mockSingle.mockResolvedValue({ data: { onboarding_complete: false }, error: null });

			const event = createMockEvent({ route: { id: '/(app)/dashboard' } });
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(response.status).toBe(303);
			expect(response.headers.get('location')).toBe('/onboarding');
		});

		it('redirects when profile is null (no profile row)', async () => {
			const mockUser = { id: 'user-1', email: 'test@test.com' };
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
			mockGetSession.mockResolvedValue({
				data: { session: { access_token: 'token', user: mockUser } }
			});
			mockSingle.mockResolvedValue({ data: null, error: null });

			const event = createMockEvent({ route: { id: '/(app)/dashboard' } });
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(response.status).toBe(303);
			expect(response.headers.get('location')).toBe('/onboarding');
		});

		it('allows onboarded user to access (app) routes', async () => {
			const mockUser = { id: 'user-1', email: 'test@test.com' };
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
			mockGetSession.mockResolvedValue({
				data: { session: { access_token: 'token', user: mockUser } }
			});
			mockSingle.mockResolvedValue({ data: { onboarding_complete: true }, error: null });

			const event = createMockEvent({ route: { id: '/(app)/dashboard' } });
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(resolve).toHaveBeenCalled();
			expect(response.status).toBe(200);
		});

		it('does NOT redirect when on onboarding route itself', async () => {
			const mockUser = { id: 'user-1', email: 'test@test.com' };
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
			mockGetSession.mockResolvedValue({
				data: { session: { access_token: 'token', user: mockUser } }
			});
			mockSingle.mockResolvedValue({ data: { onboarding_complete: false }, error: null });

			const event = createMockEvent({ route: { id: '/(app)/onboarding' } });
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(resolve).toHaveBeenCalled();
			expect(response.status).toBe(200);
		});

		it('does NOT check onboarding for non-(app) routes', async () => {
			const mockUser = { id: 'user-1', email: 'test@test.com' };
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
			mockGetSession.mockResolvedValue({
				data: { session: { access_token: 'token', user: mockUser } }
			});

			const event = createMockEvent({ route: { id: '/' } });
			const resolve = createMockResolve();

			const response = await handle({ event, resolve });

			expect(resolve).toHaveBeenCalled();
			expect(response.status).toBe(200);
		});
	});
});
