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
			timeLogs: {
				where: {
					endTime: { not: null }
				}
			}
		},
		orderBy: { createdAt: 'desc' }
	});

	// Calculate total time for each task
	const tasksWithTime = tasks.map(task => {
		const totalTime = task.timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
		return {
			...task,
			totalTime
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

