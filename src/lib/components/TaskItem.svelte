<script>
	import { createEventDispatcher } from 'svelte';
	import dayjs from 'dayjs';

	export let task;

	const dispatch = createEventDispatcher();

	let editing = false;
	let editTitle = task.title;
	let editDescription = task.description || '';
	let editStatus = task.status;
	let isTracking = false;
	let currentTimeLogId = null;
	let elapsedTime = 0;
	let intervalId = null;
	let startTime = null;
	let startTimeDisplay = '';
	let stopTimeDisplay = '';

	$: statusColors = {
		PENDING: '#f59e0b',
		IN_PROGRESS: '#3b82f6',
		COMPLETED: '#10b981'
	};

	function formatTime(seconds) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
	}

	function formatDateTime(date) {
		return dayjs(date).format('HH:mm:ss');
	}

	function formatTotalTime(seconds) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		if (hours > 0) {
			return `${hours}h ${minutes}m`;
		}
		return `${minutes}m`;
	}

	async function startTracking() {
		try {
			const now = new Date();
			const response = await fetch('/api/time-logs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					taskId: task.id,
					startTime: now.toISOString()
				})
			});

			if (response.ok) {
				const data = await response.json();
				currentTimeLogId = data.timeLog.id;
				isTracking = true;
				startTime = now;
				startTimeDisplay = formatDateTime(now);
				stopTimeDisplay = '';
				elapsedTime = 0;

				intervalId = setInterval(() => {
					elapsedTime = Math.floor((new Date() - startTime) / 1000);
				}, 1000);
			}
		} catch (error) {
			console.error('Failed to start tracking:', error);
		}
	}

	async function stopTracking() {
		if (!currentTimeLogId) return;

		try {
			const stopTime = new Date();
			const response = await fetch(`/api/time-logs/${currentTimeLogId}/stop`, {
				method: 'POST'
			});

			if (response.ok) {
				stopTimeDisplay = formatDateTime(stopTime);
				isTracking = false;
				currentTimeLogId = null;
				if (intervalId) {
					clearInterval(intervalId);
					intervalId = null;
				}
				dispatch('updated');
			}
		} catch (error) {
			console.error('Failed to stop tracking:', error);
		}
	}

	async function saveEdit() {
		try {
			const response = await fetch(`/api/tasks/${task.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: editTitle,
					description: editDescription || null,
					status: editStatus
				})
			});

			if (response.ok) {
				editing = false;
				dispatch('updated');
			}
		} catch (error) {
			console.error('Failed to update task:', error);
		}
	}

	async function completeTask() {
		try {
			const response = await fetch(`/api/tasks/${task.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					status: 'COMPLETED'
				})
			});

			if (response.ok) {
				dispatch('updated');
			}
		} catch (error) {
			console.error('Failed to complete task:', error);
		}
	}

	async function deleteTask() {
		if (!confirm('Are you sure you want to delete this task?')) return;

		try {
			const response = await fetch(`/api/tasks/${task.id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				dispatch('deleted');
			}
		} catch (error) {
			console.error('Failed to delete task:', error);
		}
	}

	function cancelEdit() {
		editing = false;
		editTitle = task.title;
		editDescription = task.description || '';
		editStatus = task.status;
	}

	// Reset display times when task changes
	$: if (task.id) {
		if (!isTracking) {
			startTimeDisplay = '';
			stopTimeDisplay = '';
		}
	}
</script>

<div class="task-item hover-lift fade-in">
	{#if editing}
		<div class="edit-mode">
			<input
				type="text"
				bind:value={editTitle}
				class="edit-input"
				placeholder="Task title"
			/>
			<textarea
				bind:value={editDescription}
				class="edit-textarea"
				placeholder="Description (optional)"
				rows="2"
			></textarea>
			<select bind:value={editStatus} class="edit-select">
				<option value="PENDING">Pending</option>
				<option value="IN_PROGRESS">In Progress</option>
				<option value="COMPLETED">Completed</option>
			</select>
			<div class="edit-actions">
				<button on:click={saveEdit} class="btn btn-sm btn-primary">Save</button>
				<button on:click={cancelEdit} class="btn btn-sm btn-secondary">Cancel</button>
			</div>
		</div>
	{:else}
		<div class="task-header">
			<div class="task-info">
				<h3>{task.title}</h3>
				{#if task.description}
					<p class="task-description">{task.description}</p>
				{/if}
			</div>
			<div class="task-status" style="background-color: {statusColors[task.status]}20; color: {statusColors[task.status]};">
				{task.status.replace('_', ' ')}
			</div>
		</div>

		<div class="task-footer">
			<div class="task-time-info">
				{#if isTracking}
					<div class="timer-active">
						<span class="timer-icon">⏱️</span>
						<span class="timer-text">{formatTime(elapsedTime)}</span>
					</div>
					<div class="time-details">
						<span class="start-time">Started: {startTimeDisplay}</span>
					</div>
				{:else if stopTimeDisplay}
					<div class="time-details">
						<span class="start-time">Started: {startTimeDisplay}</span>
						<span class="stop-time">Stopped: {stopTimeDisplay}</span>
					</div>
				{/if}
				{#if task.totalTime > 0}
					<span class="total-time">Total: {formatTotalTime(task.totalTime)}</span>
				{/if}
			</div>
			<div class="task-actions">
				{#if isTracking}
					<button on:click={stopTracking} class="btn btn-sm btn-danger">Stop</button>
				{:else}
					<button on:click={startTracking} class="btn btn-sm btn-success">Start</button>
				{/if}
				{#if task.status !== 'COMPLETED'}
					<button on:click={completeTask} class="btn btn-sm btn-complete">Complete</button>
				{/if}
				<button on:click={() => editing = true} class="btn btn-sm btn-secondary">Edit</button>
				<button on:click={deleteTask} class="btn btn-sm btn-danger">Delete</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.task-item {
		background: var(--bg-card);
		border-radius: var(--radius-xl);
		padding: var(--space-6);
		box-shadow: var(--shadow-md);
		transition: var(--transition);
		position: relative;
		margin-bottom: var(--space-4);
		border: 1px solid var(--border-muted);
	}

	.task-item:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
		border-color: var(--primary);
	}

	.task-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-6);
	}

	.task-info h3 {
		margin: 0 0 var(--space-2) 0;
		color: var(--text-primary);
		font-size: 1.1rem;
		font-weight: 600;
	}

	.task-description {
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.9rem;
		line-height: 1.5;
	}

	.task-status {
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
		border: 1px solid;
	}

	.task-footer {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-top: var(--space-6);
		padding-top: var(--space-4);
		border-top: 1px solid var(--border-primary);
		flex-wrap: wrap;
		gap: var(--space-4);
	}

	.task-time-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		flex: 1;
		min-width: 0;
		margin-right: var(--space-4);
	}

	.timer-active {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		color: var(--success);
		font-weight: 600;
		padding: var(--space-2) var(--space-4);
		background: rgba(16, 185, 129, 0.1);
		border-radius: var(--radius-full);
		border: 1px solid rgba(16, 185, 129, 0.2);
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
		50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
	}

	.time-details {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		font-size: 0.8rem;
	}

	.start-time, .stop-time {
		font-family: 'Courier New', monospace;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		font-weight: 500;
	}

	.start-time {
		color: var(--success);
		background: rgba(16, 185, 129, 0.1);
	}

	.stop-time {
		color: var(--danger);
		background: rgba(239, 68, 68, 0.1);
	}

	.timer-icon {
		font-size: 1.2rem;
		animation: spin 2s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.total-time {
		color: var(--text-muted);
		font-size: 0.85rem;
		font-weight: 500;
	}

	.task-actions {
		display: flex;
		gap: var(--space-2);
		flex-shrink: 0;
		flex-wrap: wrap;
		align-items: center;
	}

	.edit-mode {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.edit-input,
	.edit-textarea,
	.edit-select {
		padding: var(--space-3) var(--space-4);
		border: 2px solid var(--border-primary);
		border-radius: var(--radius-lg);
		font-size: 1rem;
		font-family: inherit;
		background: var(--bg-secondary);
		color: var(--text-primary);
		transition: var(--transition);
	}

	.edit-input:focus,
	.edit-textarea:focus,
	.edit-select:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
		transform: scale(1.02);
	}

	.edit-actions {
		display: flex;
		gap: var(--space-2);
	}

	.btn {
		padding: var(--space-2) var(--space-4);
		border: 1px solid;
		border-radius: var(--radius);
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: var(--transition);
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	.btn:hover {
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.btn:active {
		transform: translateY(0);
	}

	.btn-sm {
		padding: var(--space-2) var(--space-3);
		font-size: 0.8rem;
		white-space: nowrap;
	}

	.btn-primary {
		background: var(--primary);
		color: white;
		border-color: var(--primary);
		box-shadow: var(--shadow-md);
	}

	.btn-primary:hover {
		background: var(--primary-dark);
		border-color: var(--primary-dark);
		box-shadow: var(--shadow-lg);
	}

	.btn-secondary {
		background: var(--bg-secondary);
		color: var(--text-secondary);
		border-color: var(--border-primary);
	}

	.btn-secondary:hover {
		background: var(--bg-elevated);
		color: var(--text-primary);
		border-color: var(--border-secondary);
	}

	.btn-success {
		background: var(--success);
		color: white;
		border-color: var(--success);
		box-shadow: var(--shadow-md);
	}

	.btn-success:hover {
		background: var(--success-dark);
		border-color: var(--success-dark);
		box-shadow: var(--shadow-lg);
	}

	.btn-complete {
		background: #8b5cf6;
		color: white;
		border-color: #8b5cf6;
		box-shadow: var(--shadow-md);
	}

	.btn-complete:hover {
		background: #7c3aed;
		border-color: #7c3aed;
		box-shadow: var(--shadow-lg);
	}

	.btn-danger {
		background: var(--danger);
		color: white;
		border-color: var(--danger);
		box-shadow: var(--shadow-md);
	}

	.btn-danger:hover {
		background: var(--danger-dark);
		border-color: var(--danger-dark);
		box-shadow: var(--shadow-lg);
	}
</style>

