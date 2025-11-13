<script>
	import { onMount } from 'svelte';
	import TaskItem from './TaskItem.svelte';

	export let refreshTrigger = 0;

	let tasks = [];
	let loading = true;
    let searchQuery = '';
    $: visibleTasks = tasks.filter((t) =>
        (t.title || '')
            .toString()
            .toLowerCase()
            .includes((searchQuery || '').toLowerCase())
    );

	async function loadTasks() {
		try {
			const response = await fetch('/api/tasks');
			if (response.ok) {
				const data = await response.json();
				tasks = data.tasks;
			}
		} catch (error) {
			console.error('Failed to load tasks:', error);
		} finally {
			loading = false;
		}
	}

	function handleTaskUpdated() {
		loadTasks();
	}

	function handleTaskDeleted() {
		loadTasks();
	}

	$: if (refreshTrigger > 0) {
		loadTasks();
	}

	onMount(() => {
		loadTasks();
	});
</script>

	<div class="tasks-container">
		<div class="tasks-section">
			<h2>Your Tasks</h2>
            <div class="search-row">
                <input
                    type="text"
                    class="search-input"
                    placeholder="Search tasks by name"
                    bind:value={searchQuery}
                />
            </div>
			{#if loading}
				<div class="loading">Loading tasks...</div>
			{:else if tasks.length === 0}
				<div class="no-tasks">No tasks yet. Create one!</div>
			{:else}
				<div class="tasks-list">
					{#each visibleTasks as task (task.id)}
						<TaskItem
							{task}
							on:updated={handleTaskUpdated}
							on:deleted={handleTaskDeleted}
						/>
					{/each}
				</div>
			{/if}
		</div>
	</div><style>
	.tasks-container {
		background: var(--bg-card);
		border-radius: var(--radius-xl);
		padding: var(--space-8);
		border: 1px solid var(--border-muted);
		box-shadow: var(--shadow-xl);
		height: fit-content;
	}

	.tasks-section h2 {
		margin-bottom: var(--space-6);
		color: var(--text-primary);
		font-size: 2rem;
		font-weight: 700;
		text-align: center;
	}

    .search-row {
        display: flex;
        justify-content: center;
        margin-bottom: var(--space-4);
    }

    .search-input {
        width: 100%;
        max-width: 480px;
        padding: var(--space-3) var(--space-4);
        border-radius: var(--radius-lg);
        border: 1px solid var(--border-primary);
        background: var(--bg-elevated);
        color: var(--text-primary);
        outline: none;
    }
    .search-input::placeholder { color: var(--text-muted); }

	.loading,
	.no-tasks {
		text-align: center;
		padding: var(--space-12);
		color: var(--text-muted);
		font-size: 1.1rem;
	}

	.loading::after {
		content: '';
		display: inline-block;
		width: 20px;
		height: 20px;
		margin-left: var(--space-3);
		border: 2px solid var(--border-secondary);
		border-radius: 50%;
		border-top-color: var(--primary);
		animation: spin 1s ease-in-out infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.no-tasks {
		background: var(--bg-secondary);
		border-radius: var(--radius-lg);
		border: 1px dashed var(--border-primary);
	}

	.tasks-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
</style>

