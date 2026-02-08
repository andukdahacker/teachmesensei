<script lang="ts">
	import PublicShell from '$lib/components/layout/PublicShell.svelte';

	let { children } = $props();
</script>

<PublicShell>
	{@render children()}
</PublicShell>
