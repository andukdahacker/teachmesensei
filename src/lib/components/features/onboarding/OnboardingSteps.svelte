<script lang="ts">
	let { currentStep }: { currentStep: number } = $props();

	const labels = ['Age', 'Role', 'Profile'];
	const totalSteps = labels.length;
</script>

<div class="mb-8 flex items-center justify-center gap-2">
	{#each Array(totalSteps) as _, i}
		{@const step = i + 1}
		<div class="flex items-center gap-2">
			<div
				class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium {step <=
				currentStep
					? 'bg-primary text-primary-foreground'
					: 'bg-muted text-muted-foreground'}"
			>
				{step}
			</div>
			<span
				class="text-sm {step <= currentStep
					? 'text-foreground font-medium'
					: 'text-muted-foreground'}"
			>
				{labels[i]}
			</span>
		</div>
		{#if step < totalSteps}
			<div class="h-0.5 w-8 {step < currentStep ? 'bg-primary' : 'bg-muted'}"></div>
		{/if}
	{/each}
</div>
