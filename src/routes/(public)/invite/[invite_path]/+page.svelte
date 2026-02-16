<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { UserCheck, LogIn } from '@lucide/svelte';

	let { data } = $props();

	const { enhance, submitting } = superForm(data.form, {
		onUpdated({ form }) {
			if (form.message) {
				if (form.valid) {
					toast.success(form.message);
				} else {
					toast.error(form.message);
				}
			}
		}
	});

	const sensei = $derived(data.inviteDetails);
	const canClaim = $derived(
		sensei.status === 'unused' &&
			data.isAuthenticated &&
			data.userRole === 'learner' &&
			!sensei.is_connected
	);
	const showLogin = $derived(sensei.status === 'unused' && !data.isAuthenticated);
	const isConnected = $derived(sensei.is_connected);
	const alreadyClaimed = $derived(sensei.status === 'claimed' && !sensei.is_connected);
	const wrongRole = $derived(
		sensei.status === 'unused' && data.isAuthenticated && data.userRole !== 'learner'
	);

	const senseiInitial = $derived(
		sensei.sensei_display_name ? sensei.sensei_display_name.charAt(0).toUpperCase() : '?'
	);
</script>

<svelte:head>
	<title>Connect with {sensei.sensei_display_name ?? 'a Sensei'} | TeachMeSensei</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center p-4">
	<Card.Root class="w-full max-w-md">
		<Card.Content class="flex flex-col items-center gap-6 p-8">
			<!-- Sensei Avatar -->
			<Avatar.Root class="h-24 w-24">
				{#if sensei.sensei_avatar_url}
					<Avatar.Image src={sensei.sensei_avatar_url} alt={sensei.sensei_display_name} />
				{/if}
				<Avatar.Fallback class="text-2xl">{senseiInitial}</Avatar.Fallback>
			</Avatar.Root>

			<!-- Sensei Name & Bio -->
			<div class="text-center space-y-2">
				<h1 class="text-2xl font-semibold">{sensei.sensei_display_name ?? 'a Sensei'}</h1>
				{#if sensei.sensei_bio}
					<p class="text-sm text-muted-foreground">{sensei.sensei_bio}</p>
				{/if}
			</div>

			<!-- Topics -->
			{#if sensei.sensei_topics && sensei.sensei_topics.length > 0}
				<div class="flex flex-wrap justify-center gap-2">
					{#each sensei.sensei_topics as topic (topic)}
						<Badge variant="secondary">{topic}</Badge>
					{/each}
				</div>
			{/if}

			<!-- Mutually exclusive display states -->
			{#if canClaim}
				<form method="POST" action="?/claim" use:enhance class="w-full">
					<input type="hidden" name="code" value={sensei.code} />
					<Button type="submit" disabled={$submitting} class="w-full" size="lg">
						<UserCheck class="h-5 w-5 mr-2" />
						{#if $submitting}
							Connecting...
						{:else}
							Connect with {sensei.sensei_display_name}
						{/if}
					</Button>
				</form>
			{:else if showLogin}
				<div class="w-full text-center space-y-3">
					<p class="text-sm text-muted-foreground">
						Log in to connect with {sensei.sensei_display_name}
					</p>
					<Button
						href="/login?redirectTo={encodeURIComponent(data.invitePath)}"
						class="w-full"
						size="lg"
					>
						<LogIn class="h-5 w-5 mr-2" />
						Login to Connect
					</Button>
				</div>
			{:else if isConnected}
				<div class="w-full text-center space-y-3">
					<div class="rounded-lg bg-green-50 dark:bg-green-950/30 p-4">
						<p class="text-sm font-medium text-green-700 dark:text-green-400">
							You're now connected with {sensei.sensei_display_name}!
						</p>
					</div>
					<Button href="/dashboard" variant="outline" class="w-full">Go to Dashboard</Button>
				</div>
			{:else if alreadyClaimed}
				<div class="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-4 text-center">
					<p class="text-sm text-amber-700 dark:text-amber-400">
						This invite code has already been claimed
					</p>
				</div>
			{:else if wrongRole}
				<div class="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 text-center">
					<p class="text-sm text-blue-700 dark:text-blue-400">
						Only learners can claim invite codes
					</p>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
