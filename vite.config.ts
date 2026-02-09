import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: 'unit',
					include: ['src/**/*.{test,spec}.{js,ts}', 'tests/fixtures/**/*.{test,spec}.{js,ts}'],
					environment: 'jsdom',
					alias: {
						'@testing-library/svelte': '@testing-library/svelte/svelte5'
					},
					server: {
						deps: {
							inline: ['@testing-library/svelte']
						}
					}
				}
			},
			{
				extends: true,
				test: {
					name: 'integration',
					include: ['tests/integration/**/*.{test,spec}.{js,ts}'],
					environment: 'node'
				}
			}
		]
	},
	// Force browser export condition so Svelte resolves to index-client.js in Vitest/jsdom.
	// Without this, Svelte defaults to index-server.js which throws "mount() not available on server".
	// SvelteKit overrides this for its own SSR build, so production builds are unaffected.
	resolve: {
		conditions: ['browser']
	}
});
