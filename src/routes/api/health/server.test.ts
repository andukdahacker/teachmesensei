import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mutable env objects so tests can override values
const mockPrivateEnv: Record<string, string | undefined> = {
	SUPABASE_SECRET_KEY: 'test-service-role-key'
};

const mockPublicEnv: Record<string, string | undefined> = {
	PUBLIC_SUPABASE_URL: 'http://localhost:54321'
};

vi.mock('$env/dynamic/private', () => ({
	get env() {
		return mockPrivateEnv;
	}
}));

vi.mock('$env/dynamic/public', () => ({
	get env() {
		return mockPublicEnv;
	}
}));

import { GET } from './+server';

describe('GET /api/health', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		mockPrivateEnv.SUPABASE_SECRET_KEY = 'test-service-role-key';
		mockPublicEnv.PUBLIC_SUPABASE_URL = 'http://localhost:54321';
	});

	it('returns 200 with { status: "ok" } when Supabase is reachable', async () => {
		vi.spyOn(global, 'fetch').mockResolvedValue(new Response(null, { status: 200 }));

		const response = await GET();
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body).toEqual({ status: 'ok' });
		expect(global.fetch).toHaveBeenCalledWith(
			'http://localhost:54321/rest/v1/',
			expect.objectContaining({
				headers: { apikey: 'test-service-role-key' }
			})
		);
	});

	it('returns 503 with { status: "degraded" } when Supabase is unreachable', async () => {
		vi.spyOn(global, 'fetch').mockRejectedValue(new Error('fetch failed'));

		const response = await GET();
		const body = await response.json();

		expect(response.status).toBe(503);
		expect(body.status).toBe('degraded');
		expect(body.error).toBe('fetch failed');
	});

	it('returns 503 when Supabase returns non-ok status', async () => {
		vi.spyOn(global, 'fetch').mockResolvedValue(new Response(null, { status: 500 }));

		const response = await GET();
		const body = await response.json();

		expect(response.status).toBe(503);
		expect(body.status).toBe('degraded');
		expect(body.error).toBe('Supabase returned 500');
	});

	it('returns 503 when fetch times out', async () => {
		vi.spyOn(global, 'fetch').mockRejectedValue(
			new DOMException('Signal timed out.', 'TimeoutError')
		);

		const response = await GET();
		const body = await response.json();

		expect(response.status).toBe(503);
		expect(body.status).toBe('degraded');
		expect(body.error).toBe('Signal timed out.');
	});

	it('returns 503 when env vars are missing', async () => {
		mockPrivateEnv.SUPABASE_SECRET_KEY = undefined;
		mockPublicEnv.PUBLIC_SUPABASE_URL = undefined;

		const response = await GET();
		const body = await response.json();

		expect(response.status).toBe(503);
		expect(body.status).toBe('degraded');
		expect(body.error).toBe('Missing Supabase configuration');
	});
});
