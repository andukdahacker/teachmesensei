<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	let { redirectTo = '/dashboard', error = null }: { redirectTo?: string; error?: string | null } =
		$props();
</script>

{#if error}
	<div
		class="bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-200 rounded-md p-3 text-sm"
	>
		{error}
	</div>
{/if}

<form method="POST" action="?/google">
	<input type="hidden" name="redirectTo" value={redirectTo} />
	<Button type="submit" variant="outline" size="lg" class="w-full">Continue with Google</Button>
</form>

<form method="POST" action="?/github">
	<input type="hidden" name="redirectTo" value={redirectTo} />
	<Button type="submit" variant="outline" size="lg" class="w-full">Continue with GitHub</Button>
</form>
