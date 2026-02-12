<script lang="ts">
	import { Home, Settings, Ticket, User } from '@lucide/svelte';

	let { userRole = null }: { userRole?: string | null } = $props();
</script>

<aside
	class="flex h-full w-60 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
>
	<div class="flex h-14 items-center border-b border-sidebar-border px-4 font-bold">
		TeachMeSensei
	</div>
	<nav class="flex-1 space-y-1 p-2">
		<a
			href="/dashboard"
			class="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
		>
			<Home class="h-4 w-4" />
			Dashboard
		</a>
		<a
			href="/profile"
			class="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
		>
			<User class="h-4 w-4" />
			Profile
		</a>
		{#if userRole === 'sensei'}
			<a
				href="/invite-codes"
				class="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
			>
				<Ticket class="h-4 w-4" />
				Invite Codes
			</a>
		{/if}
		<a
			href="/settings"
			class="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
		>
			<Settings class="h-4 w-4" />
			Settings
		</a>
	</nav>
</aside>
