import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Integration tests for auth hooks.
 *
 * These tests exercise the full handle chain with mocked Supabase clients
 * to verify route guard behavior end-to-end. For tests against a real
 * Supabase local stack, see the RLS integration tests added in Story 2.5.
 */

const mockGetUser = vi.fn();
const mockGetSession = vi.fn();

vi.mock('@supabase/ssr', () => ({
	createServerClient: vi.fn(() => ({
		auth: {
			getUser: mockGetUser,
			getSession: mockGetSession
		}
	}))
}));

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'http://localhost:54321',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-key'
}));

import { handle } from '../../../src/hooks.server';

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

describe('Auth hooks integration', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'No user' } });
		mockGetSession.mockResolvedValue({ data: { session: null } });
	});

	it('server-side hook correctly resolves authenticated user session', async () => {
		const mockUser = { id: 'user-123', email: 'sensei@test.com', app_metadata: { role: 'sensei' } };
		const mockSession = {
			access_token: 'valid-token',
			refresh_token: 'refresh-token',
			user: mockUser
		};

		mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
		mockGetSession.mockResolvedValue({ data: { session: mockSession } });

		const event = createMockEvent({ route: { id: '/(app)/dashboard' } });
		const resolve = createMockResolve();

		await handle({ event, resolve });

		// Verify safeGetSession was set up and returns correct data
		const result = await event.locals.safeGetSession();
		expect(result.user).toEqual(mockUser);
		expect(result.session).toEqual(mockSession);

		// Verify auth.getUser() was called (trusted server-side check)
		expect(mockGetUser).toHaveBeenCalled();
	});

	it('unauthenticated request to (app) route gets redirected to /login with redirectTo', async () => {
		const event = createMockEvent({ route: { id: '/(app)/dashboard' } });
		const resolve = createMockResolve();

		const response = await handle({ event, resolve });

		expect(response.status).toBe(303);
		expect(response.headers.get('location')).toContain('/login?redirectTo=');
		expect(resolve).not.toHaveBeenCalled();
	});

	it('(public) route accessible without auth', async () => {
		const event = createMockEvent({ route: { id: '/(public)' } });
		const resolve = createMockResolve();

		const response = await handle({ event, resolve });

		expect(resolve).toHaveBeenCalled();
		expect(response.status).toBe(200);
	});

	it('role-gated admin route returns 403 for wrong role', async () => {
		const mockUser = { id: 'user-1', email: 'learner@test.com', app_metadata: { role: 'learner' } };
		mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
		mockGetSession.mockResolvedValue({
			data: { session: { access_token: 'token', user: mockUser } }
		});

		const event = createMockEvent({ route: { id: '/(admin)/admin' } });
		const resolve = createMockResolve();

		const response = await handle({ event, resolve });

		expect(response.status).toBe(403);
		expect(resolve).not.toHaveBeenCalled();
	});

	it('role-gated enterprise route returns 403 for wrong role', async () => {
		const mockUser = { id: 'user-1', email: 'learner@test.com', app_metadata: { role: 'learner' } };
		mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
		mockGetSession.mockResolvedValue({
			data: { session: { access_token: 'token', user: mockUser } }
		});

		const event = createMockEvent({ route: { id: '/(enterprise)/enterprise' } });
		const resolve = createMockResolve();

		const response = await handle({ event, resolve });

		expect(response.status).toBe(403);
		expect(resolve).not.toHaveBeenCalled();
	});
});
