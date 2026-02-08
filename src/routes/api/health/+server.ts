import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

export async function GET() {
	try {
		const url = publicEnv.PUBLIC_SUPABASE_URL;
		const key = env.SUPABASE_SECRET_KEY;

		if (!url || !key) {
			return json({ status: 'degraded', error: 'Missing Supabase configuration' }, { status: 503 });
		}

		const response = await fetch(`${url}/rest/v1/`, {
			headers: { apikey: key },
			signal: AbortSignal.timeout(5000)
		});

		if (!response.ok) {
			throw new Error(`Supabase returned ${response.status}`);
		}

		return json({ status: 'ok' });
	} catch (err) {
		const message =
			err instanceof Error
				? err.message
				: typeof err === 'object' && err !== null && 'message' in err
					? String((err as { message: unknown }).message)
					: 'Unknown error';
		return json({ status: 'degraded', error: message }, { status: 503 });
	}
}
