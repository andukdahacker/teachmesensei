import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'http://localhost:54321',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-key'
}));

vi.mock('@supabase/ssr', () => ({
	createServerClient: vi.fn(() => ({}))
}));

describe('Auth callback handler', () => {
	const mockExchangeCodeForSession = vi.fn();
	const mockVerifyOtp = vi.fn();
	const mockGetUser = vi.fn();
	const mockFrom = vi.fn();
	const mockSelect = vi.fn();
	const mockEq = vi.fn();
	const mockSingle = vi.fn();

	function createMockEvent(searchParams: Record<string, string> = {}) {
		const url = new URL('http://localhost:5173/login/callback');
		for (const [key, value] of Object.entries(searchParams)) {
			url.searchParams.set(key, value);
		}

		mockFrom.mockReturnValue({ select: mockSelect });
		mockSelect.mockReturnValue({ eq: mockEq });
		mockEq.mockReturnValue({ single: mockSingle });

		return {
			url,
			locals: {
				supabase: {
					auth: {
						exchangeCodeForSession: mockExchangeCodeForSession,
						verifyOtp: mockVerifyOtp,
						getUser: mockGetUser
					},
					from: mockFrom
				}
			}
		};
	}

	beforeEach(() => {
		vi.clearAllMocks();
		vi.resetModules();
	});

	it('exchanges code for session on OAuth callback', async () => {
		expect.assertions(3);
		mockExchangeCodeForSession.mockResolvedValue({ error: null });
		mockGetUser.mockResolvedValue({
			data: { user: { id: 'user-1' } }
		});
		mockSingle.mockResolvedValue({
			data: { onboarding_complete: true }
		});

		const event = createMockEvent({ code: 'auth-code-123', next: '/dashboard' });

		const { GET } = await import('../../../src/routes/(public)/login/callback/+server');

		try {
			await GET(event as never);
		} catch (e: unknown) {
			const err = e as { status: number; location: string };
			expect(err.status).toBe(303);
			expect(err.location).toBe('/dashboard');
		}

		expect(mockExchangeCodeForSession).toHaveBeenCalledWith('auth-code-123');
	});

	it('verifies OTP on magic link callback', async () => {
		expect.assertions(3);
		mockVerifyOtp.mockResolvedValue({ error: null });
		mockGetUser.mockResolvedValue({
			data: { user: { id: 'user-1' } }
		});
		mockSingle.mockResolvedValue({
			data: { onboarding_complete: true }
		});

		const event = createMockEvent({
			token_hash: 'hash-abc',
			type: 'email',
			next: '/dashboard'
		});

		const { GET } = await import('../../../src/routes/(public)/login/callback/+server');

		try {
			await GET(event as never);
		} catch (e: unknown) {
			const err = e as { status: number; location: string };
			expect(err.status).toBe(303);
			expect(err.location).toBe('/dashboard');
		}

		expect(mockVerifyOtp).toHaveBeenCalledWith({
			token_hash: 'hash-abc',
			type: 'email'
		});
	});

	it('redirects to /login with error when error_description is present', async () => {
		expect.assertions(3);
		const event = createMockEvent({
			error: 'access_denied',
			error_description: 'User cancelled'
		});

		const { GET } = await import('../../../src/routes/(public)/login/callback/+server');

		try {
			await GET(event as never);
		} catch (e: unknown) {
			const err = e as { status: number; location: string };
			expect(err.status).toBe(303);
			expect(err.location).toContain('/login?error=');
			expect(err.location).toContain('cancelled');
		}
	});

	it('redirects new user (no profile) to /onboarding', async () => {
		expect.assertions(2);
		mockExchangeCodeForSession.mockResolvedValue({ error: null });
		mockGetUser.mockResolvedValue({
			data: { user: { id: 'new-user-1' } }
		});
		mockSingle.mockResolvedValue({ data: null });

		const event = createMockEvent({ code: 'auth-code-456' });

		const { GET } = await import('../../../src/routes/(public)/login/callback/+server');

		try {
			await GET(event as never);
		} catch (e: unknown) {
			const err = e as { status: number; location: string };
			expect(err.status).toBe(303);
			expect(err.location).toBe('/onboarding');
		}
	});

	it('redirects user with incomplete onboarding to /onboarding', async () => {
		expect.assertions(2);
		mockExchangeCodeForSession.mockResolvedValue({ error: null });
		mockGetUser.mockResolvedValue({
			data: { user: { id: 'user-2' } }
		});
		mockSingle.mockResolvedValue({
			data: { onboarding_complete: false }
		});

		const event = createMockEvent({ code: 'auth-code-789' });

		const { GET } = await import('../../../src/routes/(public)/login/callback/+server');

		try {
			await GET(event as never);
		} catch (e: unknown) {
			const err = e as { status: number; location: string };
			expect(err.status).toBe(303);
			expect(err.location).toBe('/onboarding');
		}
	});

	it('redirects existing user to /dashboard by default', async () => {
		expect.assertions(2);
		mockExchangeCodeForSession.mockResolvedValue({ error: null });
		mockGetUser.mockResolvedValue({
			data: { user: { id: 'user-3' } }
		});
		mockSingle.mockResolvedValue({
			data: { onboarding_complete: true }
		});

		const event = createMockEvent({ code: 'auth-code-000' });

		const { GET } = await import('../../../src/routes/(public)/login/callback/+server');

		try {
			await GET(event as never);
		} catch (e: unknown) {
			const err = e as { status: number; location: string };
			expect(err.status).toBe(303);
			expect(err.location).toBe('/dashboard');
		}
	});

	it('redirects to /login with error when no valid auth params', async () => {
		expect.assertions(2);
		const event = createMockEvent({});

		const { GET } = await import('../../../src/routes/(public)/login/callback/+server');

		try {
			await GET(event as never);
		} catch (e: unknown) {
			const err = e as { status: number; location: string };
			expect(err.status).toBe(303);
			expect(err.location).toContain('/login?error=');
		}
	});

	it('prevents open redirect via next parameter', async () => {
		expect.assertions(2);
		mockExchangeCodeForSession.mockResolvedValue({ error: null });
		mockGetUser.mockResolvedValue({
			data: { user: { id: 'user-1' } }
		});
		mockSingle.mockResolvedValue({
			data: { onboarding_complete: true }
		});

		const event = createMockEvent({ code: 'auth-code-123', next: 'https://evil.com' });

		const { GET } = await import('../../../src/routes/(public)/login/callback/+server');

		try {
			await GET(event as never);
		} catch (e: unknown) {
			const err = e as { status: number; location: string };
			expect(err.status).toBe(303);
			expect(err.location).toBe('/dashboard');
		}
	});

	it('redirects to /login with error when getUser returns null after auth', async () => {
		expect.assertions(2);
		mockExchangeCodeForSession.mockResolvedValue({ error: null });
		mockGetUser.mockResolvedValue({
			data: { user: null }
		});

		const event = createMockEvent({ code: 'auth-code-123' });

		const { GET } = await import('../../../src/routes/(public)/login/callback/+server');

		try {
			await GET(event as never);
		} catch (e: unknown) {
			const err = e as { status: number; location: string };
			expect(err.status).toBe(303);
			expect(err.location).toContain('/login?error=');
		}
	});
});
