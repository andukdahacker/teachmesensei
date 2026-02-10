import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'http://localhost:54321',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-key'
}));

// Mock sveltekit-superforms
const mockSuperValidate = vi.fn();
const mockMessage = vi.fn();

vi.mock('sveltekit-superforms', () => ({
	superValidate: (...args: unknown[]) => mockSuperValidate(...args),
	message: (...args: unknown[]) => mockMessage(...args)
}));

vi.mock('sveltekit-superforms/adapters', () => ({
	zod4: vi.fn((schema: unknown) => schema)
}));

vi.mock('$lib/schemas/auth', () => ({
	magicLinkSchema: { _type: 'mock-schema' }
}));

describe('Login page server', () => {
	let actions: Record<string, (event: unknown) => Promise<unknown>>;
	let load: (event: unknown) => Promise<unknown>;

	beforeEach(async () => {
		vi.clearAllMocks();
		mockSuperValidate.mockResolvedValue({
			valid: true,
			data: { email: 'test@example.com' },
			id: 'form-id'
		});
		mockMessage.mockImplementation((form, msg, opts) => ({ form, message: msg, ...opts }));

		// Dynamic import to pick up mocks
		const module = await import('./+page.server');
		actions = module.actions as unknown as Record<string, (event: unknown) => Promise<unknown>>;
		load = module.load as unknown as (event: unknown) => Promise<unknown>;
	});

	describe('load function', () => {
		it('returns form, redirectTo, and error from URL params', async () => {
			const url = new URL('http://localhost:5173/login?redirectTo=%2Fsettings&error=test+error');
			const result = await load({ url });
			expect(result).toHaveProperty('form');
			expect(result).toHaveProperty('redirectTo', '/settings');
			expect(result).toHaveProperty('error', 'test error');
		});

		it('defaults redirectTo to /dashboard when not in URL', async () => {
			const url = new URL('http://localhost:5173/login');
			const result = await load({ url });
			expect(result).toHaveProperty('redirectTo', '/dashboard');
			expect(result).toHaveProperty('error', null);
		});
	});

	describe('actions.magic_link', () => {
		it('calls signInWithOtp with correct email when form is valid', async () => {
			const mockSignInWithOtp = vi.fn().mockResolvedValue({ error: null });
			const formData = new FormData();
			formData.set('email', 'test@example.com');
			formData.set('redirectTo', '/dashboard');

			const event = {
				request: { formData: () => Promise.resolve(formData) },
				locals: {
					supabase: {
						auth: { signInWithOtp: mockSignInWithOtp }
					}
				},
				url: new URL('http://localhost:5173/login')
			};

			await actions.magic_link(event);

			expect(mockSignInWithOtp).toHaveBeenCalledWith({
				email: 'test@example.com',
				options: {
					emailRedirectTo: expect.stringContaining('/login/callback?next=')
				}
			});
		});

		it('returns validation error for invalid email', async () => {
			mockSuperValidate.mockResolvedValue({
				valid: false,
				data: { email: 'invalid' },
				id: 'form-id'
			});

			const formData = new FormData();
			formData.set('email', 'invalid');

			const event = {
				request: { formData: () => Promise.resolve(formData) },
				locals: { supabase: { auth: {} } },
				url: new URL('http://localhost:5173/login')
			};

			const result = await actions.magic_link(event);
			expect(result).toHaveProperty('status', 400);
		});

		it('returns error message when signInWithOtp fails', async () => {
			const mockSignInWithOtp = vi
				.fn()
				.mockResolvedValue({ error: { message: 'Rate limit exceeded' } });
			const formData = new FormData();
			formData.set('email', 'test@example.com');
			formData.set('redirectTo', '/dashboard');

			const event = {
				request: { formData: () => Promise.resolve(formData) },
				locals: {
					supabase: {
						auth: { signInWithOtp: mockSignInWithOtp }
					}
				},
				url: new URL('http://localhost:5173/login')
			};

			await actions.magic_link(event);

			expect(mockMessage).toHaveBeenCalledWith(expect.anything(), 'Rate limit exceeded', {
				status: 400
			});
		});
	});

	describe('actions.google', () => {
		it('calls signInWithOAuth with google provider and redirectTo', async () => {
			expect.assertions(3);
			const mockSignInWithOAuth = vi.fn().mockResolvedValue({
				data: { url: 'https://accounts.google.com/oauth' },
				error: null
			});
			const formData = new FormData();
			formData.set('redirectTo', '/settings');

			const event = {
				request: { formData: () => Promise.resolve(formData) },
				locals: {
					supabase: {
						auth: { signInWithOAuth: mockSignInWithOAuth }
					}
				},
				url: new URL('http://localhost:5173/login')
			};

			try {
				await actions.google(event);
			} catch (e: unknown) {
				// SvelteKit redirect throws
				const err = e as { status: number; location: string };
				expect(err.status).toBe(303);
				expect(err.location).toBe('https://accounts.google.com/oauth');
			}

			expect(mockSignInWithOAuth).toHaveBeenCalledWith({
				provider: 'google',
				options: {
					redirectTo: expect.stringContaining('/login/callback?next=%2Fsettings')
				}
			});
		});

		it('returns fail(400) when signInWithOAuth errors', async () => {
			const mockSignInWithOAuth = vi.fn().mockResolvedValue({
				data: { url: null },
				error: { message: 'Provider error' }
			});
			const formData = new FormData();
			formData.set('redirectTo', '/dashboard');

			const event = {
				request: { formData: () => Promise.resolve(formData) },
				locals: {
					supabase: {
						auth: { signInWithOAuth: mockSignInWithOAuth }
					}
				},
				url: new URL('http://localhost:5173/login')
			};

			const result = await actions.google(event);
			expect(result).toHaveProperty('status', 400);
		});
	});

	describe('actions.github', () => {
		it('calls signInWithOAuth with github provider and redirectTo', async () => {
			expect.assertions(3);
			const mockSignInWithOAuth = vi.fn().mockResolvedValue({
				data: { url: 'https://github.com/login/oauth' },
				error: null
			});
			const formData = new FormData();
			formData.set('redirectTo', '/profile');

			const event = {
				request: { formData: () => Promise.resolve(formData) },
				locals: {
					supabase: {
						auth: { signInWithOAuth: mockSignInWithOAuth }
					}
				},
				url: new URL('http://localhost:5173/login')
			};

			try {
				await actions.github(event);
			} catch (e: unknown) {
				const err = e as { status: number; location: string };
				expect(err.status).toBe(303);
				expect(err.location).toBe('https://github.com/login/oauth');
			}

			expect(mockSignInWithOAuth).toHaveBeenCalledWith({
				provider: 'github',
				options: {
					redirectTo: expect.stringContaining('/login/callback?next=%2Fprofile')
				}
			});
		});

		it('returns fail(400) when signInWithOAuth errors', async () => {
			const mockSignInWithOAuth = vi.fn().mockResolvedValue({
				data: { url: null },
				error: { message: 'Provider error' }
			});
			const formData = new FormData();
			formData.set('redirectTo', '/dashboard');

			const event = {
				request: { formData: () => Promise.resolve(formData) },
				locals: {
					supabase: {
						auth: { signInWithOAuth: mockSignInWithOAuth }
					}
				},
				url: new URL('http://localhost:5173/login')
			};

			const result = await actions.github(event);
			expect(result).toHaveProperty('status', 400);
		});
	});
});
