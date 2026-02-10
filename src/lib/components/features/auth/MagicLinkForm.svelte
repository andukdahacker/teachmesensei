<script lang="ts">
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import type { magicLinkSchema } from '$lib/schemas/auth';
	import type { Infer } from 'sveltekit-superforms';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';

	let {
		data,
		redirectTo = '/dashboard'
	}: {
		data: SuperValidated<Infer<typeof magicLinkSchema>>;
		redirectTo?: string;
	} = $props();

	const sf = superForm(data);
	const { form, enhance, message } = sf;
</script>

<form method="POST" action="?/magic_link" use:enhance>
	<input type="hidden" name="redirectTo" value={redirectTo} />

	<Form.Field form={sf} name="email">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Email</Form.Label>
				<Input {...props} type="email" placeholder="your@email.com" bind:value={$form.email} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	{#if $message}
		<p class="text-sm text-emerald-600 dark:text-emerald-400">{$message}</p>
	{/if}

	<Button type="submit" class="w-full">Send Magic Link</Button>
</form>
