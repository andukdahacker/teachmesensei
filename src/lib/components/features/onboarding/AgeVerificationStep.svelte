<script lang="ts">
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import type { ageVerificationSchema } from '$lib/schemas/onboarding';
	import type { Infer } from 'sveltekit-superforms';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';

	let {
		data
	}: {
		data: SuperValidated<Infer<typeof ageVerificationSchema>>;
	} = $props();

	const sf = superForm(data);
	const { form, enhance, errors, message } = sf;

	const isUnder18 = $derived(
		$errors.date_of_birth?.some((e) => e.includes("Come back when you're 18")) ?? false
	);
</script>

<div class="space-y-6">
	<div class="text-center">
		<h2 class="text-xl font-semibold">Let's get started</h2>
		<p class="text-muted-foreground mt-1">First, we need to verify your age</p>
	</div>

	{#if isUnder18}
		<div
			class="rounded-lg border bg-amber-50 p-6 text-center dark:bg-amber-950/30 dark:border-amber-800"
		>
			<p class="text-amber-800 dark:text-amber-200 font-medium">
				TeachMeSensei is designed for adults navigating career transitions. Come back when you're
				18!
			</p>
		</div>
	{/if}

	<form method="POST" action="?/age_verify" use:enhance>
		<Form.Field form={sf} name="date_of_birth">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Date of Birth</Form.Label>
					<Input {...props} type="date" bind:value={$form.date_of_birth} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		{#if $message}
			<p class="text-sm text-destructive mt-2">{$message}</p>
		{/if}

		<Button type="submit" class="mt-4 w-full">Continue</Button>
	</form>
</div>
