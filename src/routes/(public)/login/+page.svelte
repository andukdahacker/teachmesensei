<script lang="ts">
	import OAuthButtons from '$lib/components/features/auth/OAuthButtons.svelte';
	import MagicLinkForm from '$lib/components/features/auth/MagicLinkForm.svelte';
	import { Separator } from '$lib/components/ui/separator';

	let { data, form: formResult } = $props();
	const oauthError = $derived(
		formResult && 'error' in formResult ? (formResult.error as string) : null
	);
</script>

<div class="flex min-h-[80vh] items-center justify-center px-4">
	<div class="w-full max-w-sm space-y-6">
		<div class="space-y-2 text-center">
			<h1 class="text-2xl font-semibold tracking-tight">Welcome back</h1>
			<p class="text-muted-foreground text-sm">Sign in to TeachMeSensei</p>
		</div>

		{#if data.error || oauthError}
			<div
				class="bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-200 rounded-md p-3 text-sm"
			>
				{data.error ?? oauthError}
			</div>
		{/if}

		<div class="space-y-3">
			<OAuthButtons redirectTo={data.redirectTo} />
		</div>

		<div class="relative flex items-center">
			<Separator class="flex-1" />
			<span class="text-muted-foreground px-3 text-xs uppercase">or</span>
			<Separator class="flex-1" />
		</div>

		<MagicLinkForm data={data.form} redirectTo={data.redirectTo} />
	</div>
</div>
