<script lang="ts">
	import AppShell from '$lib/components/layout/AppShell.svelte';

	let { data, children } = $props();
</script>

<AppShell userRole={data.userRole}>
	{@render children()}
</AppShell>
