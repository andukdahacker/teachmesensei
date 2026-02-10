import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'http://localhost:54321',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-key'
}));

const mockSuperValidate = vi.fn();
const mockMessage = vi.fn();

vi.mock('sveltekit-superforms', () => ({
	superValidate: (...args: unknown[]) => mockSuperValidate(...args),
	message: (...args: unknown[]) => mockMessage(...args)
}));

vi.mock('sveltekit-superforms/adapters', () => ({
	zod4: vi.fn((schema: unknown) => schema)
}));

vi.mock('$lib/schemas/onboarding', () => ({
	ageVerificationSchema: { _type: 'age-schema' },
	roleSelectionSchema: { _type: 'role-schema' },
	profileSetupSchema: { _type: 'profile-schema' }
}));

function createMockSupabase(
	overrides: {
		getUser?: unknown;
		update?: unknown;
		select?: unknown;
	} = {}
) {
	const mockUpdate = vi.fn().mockReturnValue({
		eq: vi.fn().mockResolvedValue(overrides.update ?? { error: null })
	});
	const mockSelect = vi.fn().mockReturnValue({
		eq: vi.fn().mockReturnValue({
			single: vi.fn().mockResolvedValue(
				overrides.select ?? {
					data: {
						display_name: 'Test',
						avatar_url: null,
						role: 'learner',
						date_of_birth: null,
						topics: [],
						onboarding_complete: false
					},
					error: null
				}
			)
		})
	});
	return {
		auth: {
			getUser: vi.fn().mockResolvedValue(
				overrides.getUser ?? {
					data: { user: { id: 'user-1', email: 'test@test.com' } },
					error: null
				}
			)
		},
		from: vi.fn().mockReturnValue({
			select: mockSelect,
			update: mockUpdate
		})
	};
}

describe('Onboarding page server', () => {
	let actions: Record<string, (event: unknown) => Promise<unknown>>;
	let load: (event: unknown) => Promise<unknown>;

	beforeEach(async () => {
		vi.clearAllMocks();
		mockSuperValidate.mockResolvedValue({
			valid: true,
			data: { date_of_birth: new Date('2000-01-15') },
			id: 'form-id'
		});
		mockMessage.mockImplementation((form, msg, opts) => ({ form, message: msg, ...opts }));

		const module = await import('./+page.server');
		actions = module.actions as unknown as Record<string, (event: unknown) => Promise<unknown>>;
		load = module.load as unknown as (event: unknown) => Promise<unknown>;
	});

	describe('load function', () => {
		it('redirects to /login when user is not authenticated', async () => {
			const supabase = createMockSupabase({
				getUser: { data: { user: null }, error: { message: 'No user' } }
			});
			const url = new URL('http://localhost:5173/onboarding');

			await expect(load({ locals: { supabase }, url })).rejects.toMatchObject({
				status: 303,
				location: '/login'
			});
		});

		it('redirects to /dashboard when onboarding is already complete', async () => {
			const supabase = createMockSupabase({
				select: {
					data: {
						display_name: 'Test',
						avatar_url: null,
						role: 'learner',
						date_of_birth: null,
						topics: [],
						onboarding_complete: true
					},
					error: null
				}
			});
			const url = new URL('http://localhost:5173/onboarding');

			await expect(load({ locals: { supabase }, url })).rejects.toMatchObject({
				status: 303,
				location: '/dashboard'
			});
		});

		it('returns currentStep 1 by default for new user', async () => {
			const supabase = createMockSupabase();
			const url = new URL('http://localhost:5173/onboarding');

			const result = await load({ locals: { supabase }, url });
			expect(result).toHaveProperty('currentStep', 1);
		});

		it('returns currentStep 2 when date_of_birth exists and step=2 requested', async () => {
			const supabase = createMockSupabase({
				select: {
					data: {
						display_name: 'Test',
						avatar_url: null,
						role: 'learner',
						date_of_birth: '2000-01-15',
						topics: [],
						onboarding_complete: false
					},
					error: null
				}
			});
			const url = new URL('http://localhost:5173/onboarding?step=2');

			const result = await load({ locals: { supabase }, url });
			expect(result).toHaveProperty('currentStep', 2);
		});

		it('caps step to maxAllowedStep (prevents skipping)', async () => {
			const supabase = createMockSupabase();
			const url = new URL('http://localhost:5173/onboarding?step=3');

			const result = await load({ locals: { supabase }, url });
			expect(result).toHaveProperty('currentStep', 1);
		});

		it('defaults to step 1 when step param is non-numeric', async () => {
			const supabase = createMockSupabase();
			const url = new URL('http://localhost:5173/onboarding?step=abc');

			const result = await load({ locals: { supabase }, url });
			expect(result).toHaveProperty('currentStep', 1);
		});

		it('pre-fills profileForm with existing profile data (bio, avatar_url)', async () => {
			const supabase = createMockSupabase({
				select: {
					data: {
						display_name: 'Jane Doe',
						avatar_url: 'https://example.com/photo.jpg',
						bio: 'Software engineer',
						role: 'learner',
						date_of_birth: null,
						topics: ['React'],
						onboarding_complete: false
					},
					error: null
				}
			});
			const url = new URL('http://localhost:5173/onboarding');

			await load({ locals: { supabase }, url });

			// Third superValidate call is for profileForm with initial data
			const profileFormCall = mockSuperValidate.mock.calls[2];
			expect(profileFormCall[0]).toEqual({
				display_name: 'Jane Doe',
				bio: 'Software engineer',
				avatar_url: 'https://example.com/photo.jpg',
				topics: ['React']
			});
		});
	});

	describe('actions.age_verify', () => {
		it('updates date_of_birth and redirects to step 2', async () => {
			expect.assertions(2);
			const supabase = createMockSupabase();
			const formData = new FormData();
			formData.set('date_of_birth', '2000-01-15');

			const event = {
				request: { formData: () => Promise.resolve(formData) },
				locals: { supabase }
			};

			try {
				await actions.age_verify(event);
			} catch (e: unknown) {
				const err = e as { status: number; location: string };
				expect(err.status).toBe(303);
				expect(err.location).toBe('/onboarding?step=2');
			}
		});

		it('returns validation error for invalid date', async () => {
			mockSuperValidate.mockResolvedValue({
				valid: false,
				data: { date_of_birth: 'invalid' },
				id: 'form-id'
			});

			const supabase = createMockSupabase();
			const formData = new FormData();
			formData.set('date_of_birth', 'invalid');

			const event = {
				request: { formData: () => Promise.resolve(formData) },
				locals: { supabase }
			};

			const result = await actions.age_verify(event);
			expect(result).toHaveProperty('status', 400);
		});

		it('returns error message when DB update fails', async () => {
			const supabase = createMockSupabase({
				update: { error: { message: 'DB error' } }
			});
			const formData = new FormData();
			formData.set('date_of_birth', '2000-01-15');

			const event = {
				request: { formData: () => Promise.resolve(formData) },
				locals: { supabase }
			};

			await actions.age_verify(event);

			expect(mockMessage).toHaveBeenCalledWith(
				expect.anything(),
				"We're having trouble saving your information. Please try again.",
				{ status: 500 }
			);
		});

		it('redirects to /login when user is not authenticated', async () => {
			expect.assertions(1);
			const supabase = createMockSupabase({
				getUser: { data: { user: null }, error: { message: 'No user' } }
			});
			const formData = new FormData();
			formData.set('date_of_birth', '2000-01-15');

			const event = {
				request: { formData: () => Promise.resolve(formData) },
				locals: { supabase }
			};

			try {
				await actions.age_verify(event);
			} catch (e: unknown) {
				const err = e as { status: number; location: string };
				expect(err.location).toBe('/login');
			}
		});
	});

	describe('actions.select_role', () => {
		it('updates role and redirects to step 3', async () => {
			expect.assertions(2);
			mockSuperValidate.mockResolvedValue({
				valid: true,
				data: { role: 'sensei' },
				id: 'form-id'
			});

			const supabase = createMockSupabase();
			const formData = new FormData();
			formData.set('role', 'sensei');

			const event = {
				request: { formData: () => Promise.resolve(formData) },
				locals: { supabase }
			};

			try {
				await actions.select_role(event);
			} catch (e: unknown) {
				const err = e as { status: number; location: string };
				expect(err.status).toBe(303);
				expect(err.location).toBe('/onboarding?step=3');
			}
		});

		it('returns validation error for invalid role', async () => {
			mockSuperValidate.mockResolvedValue({
				valid: false,
				data: { role: 'invalid' },
				id: 'form-id'
			});

			const supabase = createMockSupabase();
			const formData = new FormData();
			formData.set('role', 'invalid');

			const event = {
				request: { formData: () => Promise.resolve(formData) },
				locals: { supabase }
			};

			const result = await actions.select_role(event);
			expect(result).toHaveProperty('status', 400);
		});

		it('returns error message when DB update fails', async () => {
			mockSuperValidate.mockResolvedValue({
				valid: true,
				data: { role: 'learner' },
				id: 'form-id'
			});

			const supabase = createMockSupabase({
				update: { error: { message: 'DB error' } }
			});
			const formData = new FormData();
			formData.set('role', 'learner');

			const event = {
				request: { formData: () => Promise.resolve(formData) },
				locals: { supabase }
			};

			await actions.select_role(event);

			expect(mockMessage).toHaveBeenCalledWith(
				expect.anything(),
				"We're having trouble saving your role. Please try again.",
				{ status: 500 }
			);
		});
	});

	describe('actions.complete_profile', () => {
		it('updates profile and redirects to /dashboard', async () => {
			expect.assertions(2);
			mockSuperValidate.mockResolvedValue({
				valid: true,
				data: {
					display_name: 'Jane Doe',
					bio: 'Software engineer',
					avatar_url: '',
					topics: ['React']
				},
				id: 'form-id'
			});

			const supabase = createMockSupabase({
				select: { data: { role: 'learner' }, error: null }
			});
			const formData = new FormData();
			formData.set('display_name', 'Jane Doe');

			const event = {
				request: { formData: () => Promise.resolve(formData) },
				locals: { supabase }
			};

			try {
				await actions.complete_profile(event);
			} catch (e: unknown) {
				const err = e as { status: number; location: string };
				expect(err.status).toBe(303);
				expect(err.location).toBe('/dashboard');
			}
		});

		it('returns validation error for invalid profile data', async () => {
			mockSuperValidate.mockResolvedValue({
				valid: false,
				data: { display_name: '' },
				id: 'form-id'
			});

			const supabase = createMockSupabase();
			const formData = new FormData();
			formData.set('display_name', '');

			const event = {
				request: { formData: () => Promise.resolve(formData) },
				locals: { supabase }
			};

			const result = await actions.complete_profile(event);
			expect(result).toHaveProperty('status', 400);
		});

		it('rejects sensei with no topics', async () => {
			mockSuperValidate.mockResolvedValue({
				valid: true,
				data: { display_name: 'Jane', bio: '', avatar_url: '', topics: [] },
				id: 'form-id'
			});

			const supabase = createMockSupabase({
				select: { data: { role: 'sensei' }, error: null }
			});
			const formData = new FormData();
			formData.set('display_name', 'Jane');

			const event = {
				request: { formData: () => Promise.resolve(formData) },
				locals: { supabase }
			};

			await actions.complete_profile(event);

			expect(mockMessage).toHaveBeenCalledWith(
				expect.anything(),
				'As a Sensei, please select at least one topic you can help with.',
				{ status: 400 }
			);
		});

		it('allows learner with no topics', async () => {
			expect.assertions(1);
			mockSuperValidate.mockResolvedValue({
				valid: true,
				data: { display_name: 'Jane', bio: '', avatar_url: '', topics: [] },
				id: 'form-id'
			});

			const supabase = createMockSupabase({
				select: { data: { role: 'learner' }, error: null }
			});
			const formData = new FormData();
			formData.set('display_name', 'Jane');

			const event = {
				request: { formData: () => Promise.resolve(formData) },
				locals: { supabase }
			};

			try {
				await actions.complete_profile(event);
			} catch (e: unknown) {
				const err = e as { status: number; location: string };
				expect(err.location).toBe('/dashboard');
			}
		});

		it('returns error message when DB update fails', async () => {
			mockSuperValidate.mockResolvedValue({
				valid: true,
				data: {
					display_name: 'Jane',
					bio: '',
					avatar_url: '',
					topics: ['React']
				},
				id: 'form-id'
			});

			// First from() call returns role (select), second returns update error
			const mockUpdateEq = vi.fn().mockResolvedValue({ error: { message: 'DB error' } });
			const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });
			const mockSelectSingle = vi.fn().mockResolvedValue({
				data: { role: 'learner' },
				error: null
			});
			const mockSelectEq = vi.fn().mockReturnValue({ single: mockSelectSingle });
			const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq });

			let callCount = 0;
			const supabase = {
				auth: {
					getUser: vi.fn().mockResolvedValue({
						data: { user: { id: 'user-1' } },
						error: null
					})
				},
				from: vi.fn().mockImplementation(() => {
					callCount++;
					if (callCount === 1) {
						return { select: mockSelect };
					}
					return { update: mockUpdate };
				})
			};

			const formData = new FormData();
			formData.set('display_name', 'Jane');

			const event = {
				request: { formData: () => Promise.resolve(formData) },
				locals: { supabase }
			};

			await actions.complete_profile(event);

			expect(mockMessage).toHaveBeenCalledWith(
				expect.anything(),
				"We're having trouble completing your profile. Please try again.",
				{ status: 500 }
			);
		});
	});
});
