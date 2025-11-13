<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { user, isAuthenticated, timerStore } from '$lib/stores.js';

	onMount(async () => {
		await fetch('/api/auth/logout', { method: 'POST' });
		timerStore.clearAll(); // Clear all active timers on logout
		user.set(null);
		isAuthenticated.set(false);
		goto('/login');
	});
</script>

<div class="logout-container">
	<p>Logging out...</p>
</div>

<style>
	.logout-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		color: white;
	}
</style>

