<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import { AVAILABLE_TOPICS } from '$lib/constants/topics';

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
	const { form, enhance, message, submitting } = sf;

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

	const initials = $derived(
		(data.profile.display_name ?? '')
			.split(' ')
			.map((n: string) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)
	);
</script>

<svelte:head>
	<title>Profile | TeachMeSensei</title>
</svelte:head>

<div class="mx-auto max-w-2xl space-y-8 p-6">
	<!-- Profile Header -->
	<div class="flex items-center gap-4">
		<Avatar class="size-20">
			{#if data.profile.avatar_url}
				<AvatarImage src={data.profile.avatar_url} alt={data.profile.display_name ?? 'Profile'} />
			{/if}
			<AvatarFallback class="text-lg">{initials || '?'}</AvatarFallback>
		</Avatar>
		<div>
			<h1 class="text-2xl font-semibold">{data.profile.display_name ?? 'Your Profile'}</h1>
			<Badge variant="secondary" class="mt-1">
				{data.profile.role === 'sensei' ? 'Sensei' : 'Learner'}
			</Badge>
		</div>
	</div>

	<!-- Edit Form -->
	<form method="POST" action="?/update_profile" use:enhance>
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
							placeholder="Tell the community about yourself"
							bind:value={$form.bio}
							class="resize-none"
							rows={3}
						/>
						<Form.Description>Optional. Max 500 characters.</Form.Description>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field form={sf} name="avatar_url">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Photo URL</Form.Label>
						<Input
							{...props}
							type="text"
							placeholder="https://example.com/photo.jpg"
							bind:value={$form.avatar_url}
						/>
						<Form.Description>Paste a link to your profile photo.</Form.Description>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!-- Topics -->
			<div>
				<p class="text-sm font-medium mb-2">
					{data.profile.role === 'sensei' ? 'Your Expertise' : 'Your Interests (optional)'}
				</p>

				{#each selectedTopics as topic (topic)}
					<input type="hidden" name="topics" value={topic} />
				{/each}

				<div class="flex flex-wrap gap-2">
					{#each AVAILABLE_TOPICS as topic (topic)}
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

				{#if data.profile.role === 'sensei' && selectedTopics.length === 0}
					<p class="text-sm text-destructive mt-1">Please select at least one topic</p>
				{/if}
			</div>
		</div>

		<Button type="submit" class="mt-6 w-full" disabled={$submitting}>
			{$submitting ? 'Saving...' : 'Save Profile'}
		</Button>
	</form>
</div>
