import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'http://localhost:54321',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-key'
}));

import RoleSelectionStep from './RoleSelectionStep.svelte';

afterEach(cleanup);

function createMockFormData() {
	return {
		valid: true,
		data: { role: 'learner' as const },
		id: 'role-selection-form',
		posted: false,
		errors: {},
		constraints: {},
		message: undefined,
		tainted: undefined,
		shape: {}
	};
}

describe('RoleSelectionStep', () => {
	it('renders learner option', () => {
		render(RoleSelectionStep, {
			props: { data: createMockFormData() }
		});
		expect(screen.getByText("I'm a Learner")).toBeDefined();
	});

	it('renders sensei option', () => {
		render(RoleSelectionStep, {
			props: { data: createMockFormData() }
		});
		expect(screen.getByText("I'm a Sensei")).toBeDefined();
	});

	it('renders learner description', () => {
		render(RoleSelectionStep, {
			props: { data: createMockFormData() }
		});
		expect(
			screen.getByText(
				"I'm navigating a career transition and looking for guidance from experienced professionals."
			)
		).toBeDefined();
	});

	it('renders sensei description', () => {
		render(RoleSelectionStep, {
			props: { data: createMockFormData() }
		});
		expect(
			screen.getByText(
				"I'm an experienced professional ready to mentor others through their career journey."
			)
		).toBeDefined();
	});

	it('renders continue button', () => {
		render(RoleSelectionStep, {
			props: { data: createMockFormData() }
		});
		expect(screen.getByText('Continue')).toBeDefined();
	});

	it('form action is set to ?/select_role', () => {
		const { container } = render(RoleSelectionStep, {
			props: { data: createMockFormData() }
		});
		const form = container.querySelector('form');
		expect(form?.getAttribute('action')).toBe('?/select_role');
	});

	it('has hidden role input', () => {
		const { container } = render(RoleSelectionStep, {
			props: { data: createMockFormData() }
		});
		const hiddenInput = container.querySelector(
			'input[type="hidden"][name="role"]'
		) as HTMLInputElement;
		expect(hiddenInput).not.toBeNull();
	});

	it('renders heading text', () => {
		render(RoleSelectionStep, {
			props: { data: createMockFormData() }
		});
		expect(screen.getByText('How will you use TeachMeSensei?')).toBeDefined();
	});
});
