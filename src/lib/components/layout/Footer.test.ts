import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import Footer from './Footer.svelte';

afterEach(cleanup);

describe('Footer', () => {
	it('renders copyright text', () => {
		render(Footer);
		const year = new Date().getFullYear().toString();
		expect(screen.getByText(new RegExp(`${year}.*TeachMeSensei`))).toBeDefined();
	});
});
