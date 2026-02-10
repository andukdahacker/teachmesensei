<script lang="ts">
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import type { roleSelectionSchema } from '$lib/schemas/onboarding';
	import type { Infer } from 'sveltekit-superforms';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';

	let {
		data
	}: {
		data: SuperValidated<Infer<typeof roleSelectionSchema>>;
	} = $props();

	const sf = superForm(data);
	const { form, enhance, message } = sf;

	let selectedRole = $state<string>($form.role ?? '');
</script>

<div class="space-y-6">
	<div class="text-center">
		<h2 class="text-xl font-semibold">How will you use TeachMeSensei?</h2>
		<p class="text-muted-foreground mt-1">Choose the role that best describes you</p>
	</div>

	<form method="POST" action="?/select_role" use:enhance>
		<input type="hidden" name="role" value={selectedRole} />

		<div class="grid gap-4">
			<button type="button" onclick={() => (selectedRole = 'learner')} class="text-left">
				<Card.Root
					class="cursor-pointer transition-colors {selectedRole === 'learner'
						? 'border-primary bg-primary/5'
						: 'hover:border-muted-foreground/50'}"
				>
					<Card.Header>
						<Card.Title>I'm a Learner</Card.Title>
						<Card.Description>
							I'm navigating a career transition and looking for guidance from experienced
							professionals.
						</Card.Description>
					</Card.Header>
				</Card.Root>
			</button>

			<button type="button" onclick={() => (selectedRole = 'sensei')} class="text-left">
				<Card.Root
					class="cursor-pointer transition-colors {selectedRole === 'sensei'
						? 'border-primary bg-primary/5'
						: 'hover:border-muted-foreground/50'}"
				>
					<Card.Header>
						<Card.Title>I'm a Sensei</Card.Title>
						<Card.Description>
							I'm an experienced professional ready to mentor others through their career journey.
						</Card.Description>
					</Card.Header>
				</Card.Root>
			</button>
		</div>

		{#if $message}
			<p class="text-sm text-destructive mt-2">{$message}</p>
		{/if}

		<Button type="submit" class="mt-4 w-full" disabled={!selectedRole}>Continue</Button>
	</form>
</div>
