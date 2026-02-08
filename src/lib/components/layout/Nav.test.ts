import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import Nav from './Nav.svelte';

afterEach(cleanup);

describe('Nav', () => {
	it('renders the brand name', () => {
		render(Nav);
		expect(screen.getByText('TeachMeSensei')).toBeDefined();
	});

	it('renders brand link to home', () => {
		render(Nav);
		const links = screen.getAllByRole('link');
		const brandLink = links.find((l: HTMLElement) => l.textContent?.includes('TeachMeSensei'));
		expect(brandLink?.getAttribute('href')).toBe('/');
	});
});
