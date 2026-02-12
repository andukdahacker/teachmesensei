<script lang="ts">
	import type { Snippet } from 'svelte';
	import Sidebar from './Sidebar.svelte';

	let { children, userRole = null }: { children: Snippet; userRole?: string | null } = $props();
</script>

<div class="flex h-screen">
	<Sidebar {userRole} />
	<main class="flex-1 overflow-y-auto">
		{@render children()}
	</main>
</div>
