<script lang="ts">
	import type { Snippet } from 'svelte';
	import Nav from './Nav.svelte';
	import Footer from './Footer.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="flex min-h-screen flex-col">
	<Nav />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />
</div>
