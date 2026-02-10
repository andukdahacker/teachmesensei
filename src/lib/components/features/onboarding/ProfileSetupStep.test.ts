import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'http://localhost:54321',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-key'
}));

import ProfileSetupStep from './ProfileSetupStep.svelte';

afterEach(cleanup);

function createMockFormData(overrides = {}) {
	return {
		valid: true,
		data: { display_name: '', bio: '', avatar_url: '', topics: [], ...overrides },
		id: 'profile-setup-form',
		posted: false,
		errors: {},
		constraints: {},
		message: undefined,
		tainted: undefined,
		shape: {}
	};
}

describe('ProfileSetupStep', () => {
	it('renders display name input', () => {
		render(ProfileSetupStep, {
			props: { data: createMockFormData(), role: 'learner' }
		});
		expect(screen.getByPlaceholderText('Your name')).toBeDefined();
	});

	it('renders bio textarea', () => {
		render(ProfileSetupStep, {
			props: { data: createMockFormData(), role: 'learner' }
		});
		expect(screen.getByPlaceholderText('Tell us about yourself...')).toBeDefined();
	});

	it('renders avatar URL input', () => {
		render(ProfileSetupStep, {
			props: { data: createMockFormData(), role: 'learner' }
		});
		expect(screen.getByPlaceholderText('https://example.com/your-photo.jpg')).toBeDefined();
	});

	it('renders topic buttons', () => {
		render(ProfileSetupStep, {
			props: { data: createMockFormData(), role: 'learner' }
		});
		expect(screen.getByText('React')).toBeDefined();
		expect(screen.getByText('TypeScript')).toBeDefined();
		expect(screen.getByText('Career Switching')).toBeDefined();
	});

	it('shows topics as optional for learner', () => {
		render(ProfileSetupStep, {
			props: { data: createMockFormData(), role: 'learner' }
		});
		expect(screen.getByText('Topics of interest (optional)')).toBeDefined();
	});

	it('shows topics as required for sensei', () => {
		render(ProfileSetupStep, {
			props: { data: createMockFormData(), role: 'sensei' }
		});
		expect(screen.getByText('Topics you can help with (required)')).toBeDefined();
	});

	it('renders complete setup button', () => {
		render(ProfileSetupStep, {
			props: { data: createMockFormData(), role: 'learner' }
		});
		expect(screen.getByText('Complete Setup')).toBeDefined();
	});

	it('form action is set to ?/complete_profile', () => {
		const { container } = render(ProfileSetupStep, {
			props: { data: createMockFormData(), role: 'learner' }
		});
		const form = container.querySelector('form');
		expect(form?.getAttribute('action')).toBe('?/complete_profile');
	});

	it('renders heading text', () => {
		render(ProfileSetupStep, {
			props: { data: createMockFormData(), role: 'learner' }
		});
		expect(screen.getByText('Complete your profile')).toBeDefined();
	});

	it('pre-fills display_name when provided', () => {
		const { container } = render(ProfileSetupStep, {
			props: {
				data: createMockFormData({ display_name: 'Jane Doe' }),
				role: 'learner'
			}
		});
		const nameInput = container.querySelector('input[placeholder="Your name"]') as HTMLInputElement;
		expect(nameInput?.value).toBe('Jane Doe');
	});
});
