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
});
