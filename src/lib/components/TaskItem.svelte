<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import dayjs from 'dayjs';
	import { timerStore } from '$lib/stores.js';
    import './taskItem.css';

export let task;

	const dispatch = createEventDispatcher();

	let editing = false;
	let editTitle = task.title;
	let editDescription = task.description || '';
let editStatus = task.status;
let startTimeDisplay = '';
let stopTimeDisplay = '';
let localTotalTime = task.totalTime || 0;

	// Get timer state from global store
	$: timerState = $timerStore[task.id];
	$: isTracking = !!timerState;
	$: currentTimeLogId = timerState?.timeLogId || null;
$: elapsedTime = timerState?.elapsedTime || 0;
$: startTime = timerState?.startTime || null;
$: if (task.totalTime !== undefined) {
    localTotalTime = task.totalTime;
}

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
				// Use global timer store to start the timer
				timerStore.startTimer(task.id, data.timeLog.id, now.toISOString());
				startTimeDisplay = formatDateTime(now);
				stopTimeDisplay = '';
			}
		} catch (error) {
			console.error('Failed to start tracking:', error);
		}
	}

async function stopTracking() {
    try {
        const stopTime = new Date();
        const startedAt = startTime;
        const duration = startedAt ? Math.floor((stopTime - startedAt) / 1000) : 0;
        stopTimeDisplay = formatDateTime(stopTime);
        timerStore.stopTimer(task.id);
        if (duration > 0) {
            localTotalTime = (localTotalTime || 0) + duration;
        }
        if (currentTimeLogId) {
            const response = await fetch(`/api/time-logs/${currentTimeLogId}/stop`, {
                method: 'POST'
            });
            if (response.ok) {
                dispatch('updated');
            }
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

	async function revertCompletion() {
		// Revert completed task back to PENDING
		try {
			const response = await fetch(`/api/tasks/${task.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					status: 'PENDING'
				})
			});

			if (response.ok) {
				dispatch('updated');
			}
		} catch (error) {
			console.error('Failed to revert completion:', error);
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

	// Initialize timer if task has an active time log (on mount or when task changes)
	$: if (task.activeTimeLog && !isTracking) {
		// Restore timer from database
		timerStore.initTimer(
			task.id,
			task.activeTimeLog.id,
			task.activeTimeLog.startTime
		);
		startTimeDisplay = formatDateTime(new Date(task.activeTimeLog.startTime));
	}

	// Update start time display when timer starts
	$: if (isTracking && startTime) {
		startTimeDisplay = formatDateTime(startTime);
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
			<button
				class="task-status"
				class:clickable={task.status === 'COMPLETED'}
				style="background-color: {statusColors[task.status]}20; color: {statusColors[task.status]};"
				on:click={task.status === 'COMPLETED' ? revertCompletion : undefined}
				title={task.status === 'COMPLETED' ? 'Click to revert to uncompleted' : ''}
			>
				{task.status.replace('_', ' ')}
			</button>
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
        {#if localTotalTime > 0}
            <span class="total-time">Total: {formatTotalTime(localTotalTime)}</span>
        {/if}
			</div>
			<div class="task-actions">
				{#if task.status === 'COMPLETED'}
					<button disabled class="btn btn-sm btn-success" title="Cannot start timer for completed task">Start</button>
					<button disabled class="btn btn-sm btn-secondary" title="Cannot edit completed task">Edit</button>
					<button on:click={deleteTask} class="btn btn-sm btn-danger">Delete</button>
				{:else}
					{#if isTracking}
						<button on:click={stopTracking} class="btn btn-sm btn-danger">Stop</button>
					{:else}
						<button on:click={startTracking} class="btn btn-sm btn-success">Start</button>
					{/if}
					<button on:click={completeTask} class="btn btn-sm btn-complete">Complete</button>
					<button on:click={() => editing = true} class="btn btn-sm btn-secondary">Edit</button>
					<button on:click={deleteTask} class="btn btn-sm btn-danger">Delete</button>
				{/if}
			</div>
		</div>
	{/if}
</div>
