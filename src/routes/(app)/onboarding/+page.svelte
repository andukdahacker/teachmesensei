<script lang="ts">
	import OnboardingSteps from '$lib/components/features/onboarding/OnboardingSteps.svelte';
	import AgeVerificationStep from '$lib/components/features/onboarding/AgeVerificationStep.svelte';
	import RoleSelectionStep from '$lib/components/features/onboarding/RoleSelectionStep.svelte';
	import ProfileSetupStep from '$lib/components/features/onboarding/ProfileSetupStep.svelte';

	let { data } = $props();
</script>

<div class="mx-auto max-w-lg px-4 py-8">
	<OnboardingSteps currentStep={data.currentStep} />

	{#if data.currentStep === 1}
		<AgeVerificationStep data={data.ageForm} />
	{:else if data.currentStep === 2}
		<RoleSelectionStep data={data.roleForm} />
	{:else if data.currentStep === 3}
		<ProfileSetupStep data={data.profileForm} role={data.profile?.role ?? 'learner'} />
	{/if}
</div>
