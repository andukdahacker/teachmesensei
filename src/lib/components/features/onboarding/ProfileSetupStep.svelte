<script lang="ts">
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import type { profileSetupSchema } from '$lib/schemas/onboarding';
	import type { Infer } from 'sveltekit-superforms';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { AVAILABLE_TOPICS } from '$lib/constants/topics';

	let {
		data,
		role
	}: {
		data: SuperValidated<Infer<typeof profileSetupSchema>>;
		role: 'learner' | 'sensei';
	} = $props();

	const sf = superForm(data);
	const { form, enhance, message } = sf;

	let selectedTopics = $state<string[]>($form.topics ?? []);

	$effect(() => {
		$form.topics = selectedTopics;
	});

	function toggleTopic(topic: string) {
		if (selectedTopics.includes(topic)) {
			selectedTopics = selectedTopics.filter((t) => t !== topic);
		} else {
			selectedTopics = [...selectedTopics, topic];
		}
	}
</script>

<div class="space-y-6">
	<div class="text-center">
		<h2 class="text-xl font-semibold">Complete your profile</h2>
		<p class="text-muted-foreground mt-1">Tell us a bit about yourself</p>
	</div>

	<form method="POST" action="?/complete_profile" use:enhance>
		<div class="space-y-4">
			<Form.Field form={sf} name="display_name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Display Name</Form.Label>
						<Input {...props} type="text" placeholder="Your name" bind:value={$form.display_name} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field form={sf} name="bio">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Bio</Form.Label>
						<Textarea
							{...props}
							placeholder="Tell us about yourself..."
							bind:value={$form.bio}
							class="resize-none"
							rows={3}
						/>
					{/snippet}
				</Form.Control>
				<Form.Description>Optional. Max 500 characters.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field form={sf} name="avatar_url">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Profile Photo URL</Form.Label>
						<Input
							{...props}
							type="text"
							placeholder="https://example.com/your-photo.jpg"
							bind:value={$form.avatar_url}
						/>
					{/snippet}
				</Form.Control>
				<Form.Description>Optional. Paste a link to your profile photo.</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<div>
				<p class="text-sm font-medium mb-2">
					{role === 'sensei'
						? 'Topics you can help with (required)'
						: 'Topics of interest (optional)'}
				</p>

				{#each selectedTopics as topic}
					<input type="hidden" name="topics" value={topic} />
				{/each}

				<div class="flex flex-wrap gap-2">
					{#each AVAILABLE_TOPICS as topic}
						<button
							type="button"
							class="rounded-full border px-3 py-1 text-sm transition-colors {selectedTopics.includes(
								topic
							)
								? 'bg-primary text-primary-foreground border-primary'
								: 'bg-background hover:bg-muted'}"
							onclick={() => toggleTopic(topic)}
						>
							{topic}
						</button>
					{/each}
				</div>

				{#if role === 'sensei' && selectedTopics.length === 0}
					<p class="text-sm text-destructive mt-1">Please select at least one topic</p>
				{/if}
			</div>
		</div>

		{#if $message}
			<p class="text-sm text-destructive mt-2">{$message}</p>
		{/if}

		<Button type="submit" class="mt-6 w-full">Complete Setup</Button>
	</form>
</div>
