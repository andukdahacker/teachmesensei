<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { Copy, Link, Ticket } from '@lucide/svelte';

	let { data } = $props();

	const sf = superForm(data.form, {
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
	const { enhance: generateEnhance, submitting: generating } = sf;

	const codes = $derived(data.inviteCodes);
	const atLimit = $derived(codes.length >= 5);

	async function copyToClipboard(text: string, type: 'code' | 'link') {
		try {
			await navigator.clipboard.writeText(text);
			toast.success(
				type === 'code'
					? 'Code copied — your learner can use this to connect with you!'
					: 'Invite link copied — ready to share!'
			);
		} catch {
			toast.error("Couldn't copy — try selecting and copying manually");
		}
	}
</script>

<svelte:head>
	<title>Invite Codes | TeachMeSensei</title>
</svelte:head>

<div class="mx-auto max-w-2xl space-y-6 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-semibold">Invite Codes</h1>
			<p class="text-sm text-muted-foreground mt-1">
				Share codes with your mentees to connect on the platform
			</p>
		</div>
		<Badge variant="secondary">{codes.length} / 5</Badge>
	</div>

	<!-- Generate Code Form -->
	<form method="POST" action="?/generate_code" use:generateEnhance>
		<Button type="submit" disabled={atLimit || $generating} class="w-full sm:w-auto">
			<Ticket class="h-4 w-4 mr-2" />
			{#if $generating}
				Generating...
			{:else if atLimit}
				All 5 codes created
			{:else}
				Generate Invite Code
			{/if}
		</Button>
		{#if atLimit}
			<p class="text-sm text-muted-foreground mt-2">
				You've shared all 5 invite codes! If you need more, reach out to us — we'd love to help you
				grow your mentorship circle.
			</p>
		{/if}
	</form>

	<!-- Invite Codes List -->
	{#if codes.length === 0}
		<Card.Root>
			<Card.Content class="flex flex-col items-center justify-center py-12 text-center">
				<Ticket class="h-12 w-12 text-muted-foreground mb-4" />
				<p class="text-lg font-medium">No invite codes yet</p>
				<p class="text-sm text-muted-foreground mt-1">
					Generate one to start connecting with learners!
				</p>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="space-y-4">
			{#each codes as invite (invite.id)}
				<Card.Root>
					<Card.Content class="p-4">
						<div class="flex items-start justify-between gap-4">
							<div class="min-w-0 flex-1 space-y-2">
								<!-- Code value -->
								<div class="flex items-center gap-2">
									<code class="rounded bg-muted px-2 py-1 font-mono text-sm">
										{invite.code}
									</code>
									<button
										type="button"
										class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
										onclick={() => copyToClipboard(invite.code, 'code')}
									>
										<Copy class="h-3 w-3" />
										Copy code
									</button>
								</div>

								<!-- Shareable link -->
								<div class="flex items-center gap-2">
									<span class="truncate text-xs text-muted-foreground">
										{invite.shareable_url}
									</span>
									<button
										type="button"
										class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
										onclick={() => copyToClipboard(invite.shareable_url, 'link')}
									>
										<Link class="h-3 w-3" />
										Copy link
									</button>
								</div>
							</div>

							<!-- Status badge -->
							<div class="shrink-0">
								{#if invite.status === 'claimed'}
									<Badge variant="default">Claimed</Badge>
								{:else}
									<Badge variant="secondary">Unused</Badge>
								{/if}
							</div>
						</div>

						{#if invite.status === 'claimed'}
							<p class="text-xs text-muted-foreground mt-2">
								Claimed by {invite.claimer?.[0]?.display_name ?? 'a learner'}
							</p>
						{/if}
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>
