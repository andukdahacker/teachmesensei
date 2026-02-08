<script lang="ts">
	import { Home } from '@lucide/svelte';
</script>

<nav class="border-b border-border bg-background">
	<div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
		<a href="/" class="flex items-center gap-2 font-bold text-lg">
			<Home class="h-5 w-5" />
			<span>TeachMeSensei</span>
		</a>
		<div class="hidden items-center gap-4 sm:flex">
			<a href="/" class="text-sm text-muted-foreground hover:text-foreground">Home</a>
		</div>
	</div>
</nav>
