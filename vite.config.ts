import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vitest/config';

// Stub uninstalled optional peer deps of sveltekit-superforms.
// The barrel import 'sveltekit-superforms/adapters' pulls in all adapter files,
// but we only use zod4. This plugin provides empty stubs with syntheticNamedExports
// so Rollup doesn't fail resolving named imports from uninstalled packages.
const OPTIONAL_PEER_DEPS = new Set([
	'valibot',
	'@valibot/to-json-schema',
	'arktype',
	'@typeschema/class-validator',
	'class-validator',
	'effect',
	'effect/ParseResult',
	'joi',
	'superstruct',
	'typebox',
	'yup',
	'@vinejs/vine',
	'@exodus/schemasafe'
]);

function stubOptionalDeps(): Plugin {
	return {
		name: 'stub-optional-deps',
		enforce: 'pre',
		resolveId(id) {
			if (OPTIONAL_PEER_DEPS.has(id)) {
				return { id: `\0stub:${id}`, syntheticNamedExports: true };
			}
		},
		load(id) {
			if (id.startsWith('\0stub:')) {
				return 'export default {}';
			}
		}
	};
}

export default defineConfig({
	plugins: [stubOptionalDeps(), tailwindcss(), sveltekit()],
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
