<script lang="ts">
	let { children } = $props();
</script>

<div class="min-h-screen">
	<header class="border-b border-border px-6 py-4">
		<h1 class="text-lg font-semibold">Admin</h1>
	</header>
	<main>
		{@render children()}
	</main>
</div>
