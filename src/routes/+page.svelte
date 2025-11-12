<script>
	import { onMount } from 'svelte';
	import { isAuthenticated } from '$lib/stores.js';
	import { goto } from '$app/navigation';
	import TaskList from '$lib/components/TaskList.svelte';
	import CreateTaskForm from '$lib/components/CreateTaskForm.svelte';

	let refreshKey = 0;

	function handleTaskCreated() {
		refreshKey += 1;
	}

	onMount(() => {
		if (!$isAuthenticated) {
			goto('/login');
		}
	});
</script>

<div class="page-container">
	<div class="content-grid">
		<!-- Left Column: Create Task Form -->
		<div class="section section-card">
			<h2 class="section-title">
				<svg class="section-icon" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
				</svg>
				Create New Task
			</h2>
			<CreateTaskForm on:taskCreated={handleTaskCreated} />
		</div>

		<!-- Right Column: Task List -->
		<div class="section section-card task-list-section">
			<h2 class="section-title">
				<svg class="section-icon" viewBox="0 0 24 24" fill="currentColor">
					<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
				</svg>
				Your Tasks
			</h2>
			<TaskList refreshTrigger={refreshKey} />
		</div>
	</div>
</div>

<style>
	.page-container {
		padding: var(--space-8);
		min-height: 100vh;
	}

	.content-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-8);
		max-width: 1400px;
		margin: 0 auto;
	}

	@media (max-width: 1024px) {
		.content-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Section styling for cards */
	:global(.section-card) {
		background: var(--bg-card);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		border: 1px solid var(--border-muted);
		box-shadow: var(--shadow-lg);
	}

	:global(.section-title) {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: var(--space-4);
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	:global(.section-icon) {
		width: 24px;
		height: 24px;
		color: var(--primary);
	}

	/* Stats Grid */
	:global(.stats-grid) {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--space-4);
		margin-bottom: var(--space-6);
	}

	:global(.stat-card) {
		background: var(--bg-secondary);
		border-radius: var(--radius-md);
		padding: var(--space-4);
		border: 1px solid var(--border-primary);
		transition: var(--transition);
		text-align: center;
	}

	:global(.stat-card:hover) {
		background: var(--bg-elevated);
		border-color: var(--primary);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	:global(.stat-label) {
		font-size: 0.9rem;
		color: var(--text-muted);
		margin-bottom: var(--space-2);
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	:global(.stat-value) {
		font-size: 1.8rem;
		font-weight: 700;
		color: var(--text-primary);
		line-height: 1;
	}

	/* Loading States */
	:global(.loading) {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: var(--space-12);
		color: var(--text-muted);
		font-size: 1.1rem;
	}

	:global(.loading-spinner) {
		width: 24px;
		height: 24px;
		border: 3px solid var(--bg-elevated);
		border-top: 3px solid var(--primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-right: var(--space-3);
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	/* Error States */
	:global(.error) {
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: var(--radius-md);
		padding: var(--space-4);
		color: #fca5a5;
		text-align: center;
		margin: var(--space-4) 0;
	}
</style>
