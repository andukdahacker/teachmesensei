import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import Sidebar from './Sidebar.svelte';

afterEach(cleanup);

describe('Sidebar', () => {
	it('renders the brand name', () => {
		render(Sidebar);
		expect(screen.getByText('TeachMeSensei')).toBeDefined();
	});

	it('renders Dashboard link', () => {
		render(Sidebar);
		expect(screen.getByText('Dashboard')).toBeDefined();
	});

	it('renders Settings link', () => {
		render(Sidebar);
		expect(screen.getByText('Settings')).toBeDefined();
	});

	it('has dashboard navigation link', () => {
		render(Sidebar);
		const links = screen.getAllByRole('link');
		const dashboardLink = links.find((l: HTMLElement) => l.textContent?.includes('Dashboard'));
		expect(dashboardLink?.getAttribute('href')).toBe('/dashboard');
	});

	it('has settings navigation link', () => {
		render(Sidebar);
		const links = screen.getAllByRole('link');
		const settingsLink = links.find((l: HTMLElement) => l.textContent?.includes('Settings'));
		expect(settingsLink?.getAttribute('href')).toBe('/settings');
	});

	it('shows Invite Codes link for sensei role', () => {
		render(Sidebar, { props: { userRole: 'sensei' } });
		expect(screen.getByText('Invite Codes')).toBeDefined();
		const links = screen.getAllByRole('link');
		const inviteLink = links.find((l: HTMLElement) => l.textContent?.includes('Invite Codes'));
		expect(inviteLink?.getAttribute('href')).toBe('/invite-codes');
	});

	it('does not show Invite Codes link when userRole is null', () => {
		render(Sidebar);
		const links = screen.getAllByRole('link');
		const inviteLink = links.find((l: HTMLElement) => l.textContent?.includes('Invite Codes'));
		expect(inviteLink).toBeUndefined();
	});

	it('does not show Invite Codes link for learner role', () => {
		render(Sidebar, { props: { userRole: 'learner' } });
		const links = screen.getAllByRole('link');
		const inviteLink = links.find((l: HTMLElement) => l.textContent?.includes('Invite Codes'));
		expect(inviteLink).toBeUndefined();
	});
});
