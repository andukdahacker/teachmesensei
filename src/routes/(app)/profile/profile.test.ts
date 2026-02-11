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

vi.mock('$lib/schemas/profiles', () => ({
	updateProfileSchema: { _type: 'update-profile-schema' }
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
						display_name: 'Test User',
						bio: 'A bio',
						avatar_url: null,
						topics: ['React'],
						role: 'learner',
						date_of_birth: '2000-01-15'
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

describe('Profile page server', () => {
	let actions: Record<string, (event: unknown) => Promise<unknown>>;
	let load: (event: unknown) => Promise<unknown>;

	beforeEach(async () => {
		vi.clearAllMocks();
		mockSuperValidate.mockResolvedValue({
			valid: true,
			data: {
				display_name: 'Test User',
				bio: 'A bio',
				avatar_url: '',
				topics: ['React']
			},
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

			await expect(load({ locals: { supabase } })).rejects.toMatchObject({
				status: 303,
				location: '/login'
			});
		});

		it('throws 500 error when profile cannot be loaded', async () => {
			const supabase = createMockSupabase({
				select: { data: null, error: { message: 'DB error' } }
			});

			await expect(load({ locals: { supabase } })).rejects.toMatchObject({
				status: 500
			});
		});

		it('returns profile and form data for authenticated user', async () => {
			const supabase = createMockSupabase();

			const result = await load({ locals: { supabase } });
			expect(result).toHaveProperty('profile');
			expect(result).toHaveProperty('form');
		});

		it('pre-fills form with existing profile data', async () => {
			const supabase = createMockSupabase({
				select: {
					data: {
						display_name: 'Jane Doe',
						bio: 'Software engineer',
						avatar_url: 'https://example.com/photo.jpg',
						topics: ['React', 'TypeScript'],
						role: 'sensei',
						date_of_birth: '1990-05-20'
					},
					error: null
				}
			});

			await load({ locals: { supabase } });

			expect(mockSuperValidate).toHaveBeenCalledWith(
				{
					display_name: 'Jane Doe',
					bio: 'Software engineer',
					avatar_url: 'https://example.com/photo.jpg',
					topics: ['React', 'TypeScript']
				},
				expect.anything()
			);
		});

		it('defaults null fields to empty values in form', async () => {
			const supabase = createMockSupabase({
				select: {
					data: {
						display_name: null,
						bio: null,
						avatar_url: null,
						topics: null,
						role: 'learner',
						date_of_birth: null
					},
					error: null
				}
			});

			await load({ locals: { supabase } });

			expect(mockSuperValidate).toHaveBeenCalledWith(
				{
					display_name: '',
					bio: '',
					avatar_url: '',
					topics: []
				},
				expect.anything()
			);
		});
	});

	describe('actions.update_profile', () => {
		it('redirects to /login when user is not authenticated', async () => {
			const supabase = createMockSupabase({
				getUser: { data: { user: null }, error: { message: 'No user' } }
			});
			const formData = new FormData();
			formData.set('display_name', 'Jane');

			await expect(
				actions.update_profile({
					request: { formData: () => Promise.resolve(formData) },
					locals: { supabase }
				})
			).rejects.toMatchObject({
				status: 303,
				location: '/login'
			});
		});

		it('returns validation error for invalid data', async () => {
			mockSuperValidate.mockResolvedValue({
				valid: false,
				data: { display_name: '' },
				id: 'form-id'
			});

			const supabase = createMockSupabase();
			const formData = new FormData();
			formData.set('display_name', '');

			const result = await actions.update_profile({
				request: { formData: () => Promise.resolve(formData) },
				locals: { supabase }
			});
			expect(result).toHaveProperty('status', 400);
		});

		it('returns success message on successful update', async () => {
			const supabase = createMockSupabase({
				select: { data: { role: 'learner' }, error: null }
			});
			const formData = new FormData();
			formData.set('display_name', 'Jane Doe');

			await actions.update_profile({
				request: { formData: () => Promise.resolve(formData) },
				locals: { supabase }
			});

			expect(mockMessage).toHaveBeenCalledWith(expect.anything(), 'Profile updated successfully!');
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

			await actions.update_profile({
				request: { formData: () => Promise.resolve(formData) },
				locals: { supabase }
			});

			expect(mockMessage).toHaveBeenCalledWith(
				expect.anything(),
				'As a Sensei, please select at least one topic you can help with.',
				{ status: 400 }
			);
		});

		it('returns error when role fetch fails', async () => {
			const supabase = createMockSupabase({
				select: { data: null, error: { message: 'DB error' } }
			});
			const formData = new FormData();
			formData.set('display_name', 'Jane');

			await actions.update_profile({
				request: { formData: () => Promise.resolve(formData) },
				locals: { supabase }
			});

			expect(mockMessage).toHaveBeenCalledWith(
				expect.anything(),
				"We're having trouble verifying your role. Please try again.",
				{ status: 500 }
			);
		});

		it('allows learner with no topics', async () => {
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

			await actions.update_profile({
				request: { formData: () => Promise.resolve(formData) },
				locals: { supabase }
			});

			expect(mockMessage).toHaveBeenCalledWith(expect.anything(), 'Profile updated successfully!');
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
						return {
							select: vi.fn().mockReturnValue({
								eq: vi.fn().mockReturnValue({
									single: vi.fn().mockResolvedValue({
										data: { role: 'learner' },
										error: null
									})
								})
							})
						};
					}
					return {
						update: vi.fn().mockReturnValue({
							eq: vi.fn().mockResolvedValue({
								error: { message: 'DB error' }
							})
						})
					};
				})
			};

			const formData = new FormData();
			formData.set('display_name', 'Jane');

			await actions.update_profile({
				request: { formData: () => Promise.resolve(formData) },
				locals: { supabase }
			});

			expect(mockMessage).toHaveBeenCalledWith(
				expect.anything(),
				"We're having trouble updating your profile. Please try again.",
				{ status: 500 }
			);
		});

		it('sends null for empty bio and avatar_url', async () => {
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

			const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
			const mockUpdateFn = vi.fn().mockReturnValue({ eq: mockUpdateEq });
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
						return {
							select: vi.fn().mockReturnValue({
								eq: vi.fn().mockReturnValue({
									single: vi.fn().mockResolvedValue({
										data: { role: 'learner' },
										error: null
									})
								})
							})
						};
					}
					return { update: mockUpdateFn };
				})
			};

			const formData = new FormData();
			formData.set('display_name', 'Jane');

			await actions.update_profile({
				request: { formData: () => Promise.resolve(formData) },
				locals: { supabase }
			});

			expect(mockUpdateFn).toHaveBeenCalledWith({
				display_name: 'Jane',
				bio: null,
				avatar_url: null,
				topics: ['React']
			});
		});
	});
});
