<script>
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAuthenticated } from '$lib/stores.js';
	import dayjs from 'dayjs';
	import './style.css';

	let summary = null;
	let loading = true;
	let selectedDate = dayjs().format('YYYY-MM-DD');
	let refreshInterval = null;

	onMount(() => {
		if (!$isAuthenticated) {
			goto('/login');
		} else {
			loadSummary();
			// Refresh summary every 30 seconds to update active timers
			refreshInterval = setInterval(loadSummary, 30000);
		}
	});

	onDestroy(() => {
		if (refreshInterval) {
			clearInterval(refreshInterval);
		}
	});

	async function loadSummary() {
		loading = true;
		try {
			const response = await fetch(`/api/summary?date=${selectedDate}`);
			if (response.ok) {
				summary = await response.json();
			}
		} catch (error) {
			console.error('Failed to load summary:', error);
		} finally {
			loading = false;
		}
	}

	function formatTime(seconds) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		if (hours > 0) {
			return `${hours}h ${minutes}m ${secs}s`;
		}
		return `${minutes}m ${secs}s`;
	}

	function formatElapsedTime(startTime) {
		const elapsed = Math.floor((new Date() - new Date(startTime)) / 1000);
		return formatTime(elapsed);
	}

	function formatDateTime(dateTime) {
		return dayjs(dateTime).format('HH:mm:ss');
	}

	$: if (selectedDate) {
		loadSummary();
	}
</script>

<div class="summary-page">
	<div class="summary-container">
		<h1>Daily Summary</h1>
		
		{#if loading}
			<div class="loading">Loading...</div>
		{:else if summary}
			<div class="summary-layout">
				<!-- Left Column: Daily Summary Stats -->
				<div class="summary-left">
					<div class="summary-section">
						<h2 class="section-title">📊 Daily Summary</h2>
						
						<div class="date-selector">
							<label for="date">Select Date:</label>
							<input
								type="date"
								id="date"
								bind:value={selectedDate}
								max={dayjs().format('YYYY-MM-DD')}
								class="beautiful-date-picker"
							/>
						</div>

						<div class="summary-grid">
							<div class="summary-card">
								<h3>Total Time Tracked</h3>
								<p class="stat-value">{formatTime(summary.totalTime)}</p>
							</div>
							<div class="summary-card">
								<h3>Completed Tasks</h3>
								<p class="stat-value">{summary.completedTasks}</p>
							</div>
							<div class="summary-card">
								<h3>In Progress</h3>
								<p class="stat-value">{summary.inProgressTasks}</p>
							</div>
							<div class="summary-card">
								<h3>Pending</h3>
								<p class="stat-value">{summary.pendingTasks}</p>
							</div>
							<div class="summary-card">
								<h3>Tasks Worked On</h3>
								<p class="stat-value">{summary.tasksWorkedOn}</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Right Column: Currently Running & Time Logs -->
				<div class="summary-right">
					{#if summary.activeTimers && summary.activeTimers.length > 0}
						<div class="active-timers-section">
							<h2 class="section-title">🔴 Currently Running</h2>
							<div class="active-timers-list">
								{#each summary.activeTimers as timer}
									<div class="active-timer-item">
										<div class="timer-info">
											<h4>{timer.taskTitle}</h4>
											<p class="timer-start">
												Started at: {formatDateTime(timer.startTime)}
											</p>
										</div>
										<div class="timer-display">
											<span class="timer-icon">⏱️</span>
											<span class="timer-duration">{formatElapsedTime(timer.startTime)}</span>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{:else}
						<div class="no-running-section">
							<h2 class="section-title">🔴 Currently Running</h2>
							<div class="no-active-tasks">
								<p>No tasks currently running</p>
							</div>
						</div>
					{/if}

					{#if summary.timeLogs.length > 0}
						<div class="time-logs-section">
							<h2 class="section-title">⏰ Time Logs</h2>
							<div class="time-logs-list">
								{#each summary.timeLogs as log}
									<div class="time-log-item">
										<div class="log-info">
											<h4>{log.taskTitle}</h4>
											<p class="log-time">
												{formatDateTime(log.startTime)} - {formatDateTime(log.endTime)}
											</p>
										</div>
										<div class="log-duration">
											{formatTime(log.duration)}
										</div>
									</div>
								{/each}
							</div>
						</div>
					{:else}
						<div class="time-logs-section">
							<h2 class="section-title">⏰ Time Logs</h2>
							<div class="no-logs">No time logs for this date</div>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>


