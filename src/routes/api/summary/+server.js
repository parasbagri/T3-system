import { json } from '@sveltejs/kit';
import prisma from '$lib/db.js';
import { getUserIdFromRequest } from '$lib/auth.js';
import dayjs from 'dayjs';

export async function GET({ request, url }) {
	const userId = await getUserIdFromRequest(request);
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const dateParam = url.searchParams.get('date');
	const targetDate = dateParam ? dayjs(dateParam) : dayjs();
	const startOfDay = targetDate.startOf('day').toDate();
	const endOfDay = targetDate.endOf('day').toDate();

	// Get all tasks for the user
	const allTasks = await prisma.task.findMany({
		where: { userId },
		include: {
			timeLogs: {
				where: {
					startTime: {
						gte: startOfDay,
						lte: endOfDay
					},
					endTime: { not: null }
				}
			}
		}
	});

	// Get tasks with active time logs (currently running timers)
	const activeTimeLogs = await prisma.timeLog.findMany({
		where: {
			userId,
			endTime: null // Active timers have no end time
		},
		include: {
			task: {
				select: {
					id: true,
					title: true,
					status: true
				}
			}
		}
	});

	// Get completed time logs for the day
	const timeLogs = await prisma.timeLog.findMany({
		where: {
			userId,
			startTime: {
				gte: startOfDay,
				lte: endOfDay
			},
			endTime: { not: null }
		},
		include: {
			task: {
				select: {
					id: true,
					title: true
				}
			}
		}
	});

	// Calculate statistics
	const totalTime = timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
	const completedTasks = allTasks.filter(t => t.status === 'COMPLETED').length;
	const inProgressTasks = allTasks.filter(t => t.status === 'IN_PROGRESS').length;
	const pendingTasks = allTasks.filter(t => t.status === 'PENDING').length;

	// Tasks worked on today
	const tasksWorkedOn = [...new Set(timeLogs.map(log => log.task.id))];

	return json({
		date: targetDate.format('YYYY-MM-DD'),
		totalTime,
		completedTasks,
		inProgressTasks,
		pendingTasks,
		tasksWorkedOn: tasksWorkedOn.length,
		activeTimers: activeTimeLogs.map(log => ({
			id: log.id,
			taskId: log.task.id,
			taskTitle: log.task.title,
			startTime: log.startTime,
			elapsedTime: Math.floor((new Date() - log.startTime) / 1000)
		})),
		timeLogs: timeLogs.map(log => ({
			id: log.id,
			taskTitle: log.task.title,
			startTime: log.startTime,
			endTime: log.endTime,
			duration: log.duration
		}))
	});
}

