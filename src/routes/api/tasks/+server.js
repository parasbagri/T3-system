import { json } from '@sveltejs/kit';
import prisma from '$lib/db.js';
import { getUserIdFromRequest } from '$lib/auth.js';
import { z } from 'zod';

const taskSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional().nullable(),
	status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional()
});

export async function GET({ request }) {
	const userId = await getUserIdFromRequest(request);
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const tasks = await prisma.task.findMany({
		where: { userId },
		include: {
			timeLogs: true // Include all time logs
		},
		orderBy: { createdAt: 'desc' }
	});

	// Calculate total time for each task and include active timer info
	const tasksWithTime = tasks.map(task => {
		// Separate completed and active time logs
		const completedLogs = task.timeLogs.filter(log => log.endTime !== null);
		const activeLogs = task.timeLogs.filter(log => log.endTime === null);
		
		const totalTime = completedLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
		const activeTimer = activeLogs.length > 0 
			? activeLogs.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))[0]
			: null;
		
		return {
			...task,
			timeLogs: completedLogs, // Only return completed logs for backward compatibility
			totalTime,
			activeTimeLog: activeTimer ? {
				id: activeTimer.id,
				startTime: activeTimer.startTime
			} : null
		};
	});

	return json({ tasks: tasksWithTime });
}

export async function POST({ request }) {
	const userId = await getUserIdFromRequest(request);
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { title, description, status } = taskSchema.parse(body);

		const task = await prisma.task.create({
			data: {
				title,
				description: description || null,
				status: status || 'PENDING',
				userId
			}
		});

		return json({ task }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Invalid input', details: error.errors }, { status: 400 });
		}
		console.error('Task creation error:', error);
		return json({ error: 'Failed to create task' }, { status: 500 });
	}
}

