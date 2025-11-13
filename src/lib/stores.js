import { writable } from 'svelte/store';

export const user = writable(null);
export const isAuthenticated = writable(false);

// Global timer store to persist timers across navigation
const createTimerStore = () => {
	const { subscribe, set, update } = writable({});
	const intervals = new Map(); // Map<taskId, intervalId>

	return {
		subscribe,
		// Start a timer for a task
		startTimer: (taskId, timeLogId, startTime) => {
			update(timers => {
				// Clear any existing interval for this task
				if (intervals.has(taskId)) {
					clearInterval(intervals.get(taskId));
				}

				// Create new timer entry
				const newTimers = {
					...timers,
					[taskId]: {
						timeLogId,
						startTime: new Date(startTime),
						elapsedTime: 0
					}
				};

				// Start interval to update elapsed time
				const intervalId = setInterval(() => {
					update(currentTimers => {
						if (currentTimers[taskId]) {
							const elapsed = Math.floor((new Date() - currentTimers[taskId].startTime) / 1000);
							return {
								...currentTimers,
								[taskId]: {
									...currentTimers[taskId],
									elapsedTime: elapsed
								}
							};
						}
						return currentTimers;
					});
				}, 1000);

				intervals.set(taskId, intervalId);
				return newTimers;
			});
		},
		// Stop a timer for a task
		stopTimer: (taskId) => {
			update(timers => {
				if (intervals.has(taskId)) {
					clearInterval(intervals.get(taskId));
					intervals.delete(taskId);
				}
				const newTimers = { ...timers };
				delete newTimers[taskId];
				return newTimers;
			});
		},
		// Initialize timer from database (for restoring on page load)
		initTimer: (taskId, timeLogId, startTime) => {
			update(timers => {
				// Don't reinitialize if already running
				if (timers[taskId]) {
					return timers;
				}

				// Clear any existing interval for this task
				if (intervals.has(taskId)) {
					clearInterval(intervals.get(taskId));
				}

				const start = new Date(startTime);
				const elapsed = Math.floor((new Date() - start) / 1000);

				const newTimers = {
					...timers,
					[taskId]: {
						timeLogId,
						startTime: start,
						elapsedTime: elapsed
					}
				};

				// Start interval to update elapsed time
				const intervalId = setInterval(() => {
					update(currentTimers => {
						if (currentTimers[taskId]) {
							const elapsed = Math.floor((new Date() - currentTimers[taskId].startTime) / 1000);
							return {
								...currentTimers,
								[taskId]: {
									...currentTimers[taskId],
									elapsedTime: elapsed
								}
							};
						}
						return currentTimers;
					});
				}, 1000);

				intervals.set(taskId, intervalId);
				return newTimers;
			});
		},
		// Clear all timers (useful for logout)
		clearAll: () => {
			intervals.forEach(intervalId => clearInterval(intervalId));
			intervals.clear();
			set({});
		}
	};
};

export const timerStore = createTimerStore();

