import { json } from '@sveltejs/kit';
import prisma from '$lib/db.js';
import { getUserIdFromRequest } from '$lib/auth.js';
import { z } from 'zod';

const createTimeLogSchema = z.object({
	taskId: z.number().int(),
	startTime: z.string().datetime()
});

export async function GET({ request }) {
	const userId = await getUserIdFromRequest(request);
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const timeLogs = await prisma.timeLog.findMany({
		where: { userId },
		include: {
			task: {
				select: {
					id: true,
					title: true
				}
			}
		},
		orderBy: { startTime: 'desc' }
	});

	return json({ timeLogs });
}

export async function POST({ request }) {
	const userId = await getUserIdFromRequest(request);
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { taskId, startTime } = createTimeLogSchema.parse(body);

		// Verify task belongs to user
		const task = await prisma.task.findFirst({
			where: {
				id: taskId,
				userId
			}
		});

		if (!task) {
			return json({ error: 'Task not found' }, { status: 404 });
		}

		const timeLog = await prisma.timeLog.create({
			data: {
				taskId,
				userId,
				startTime: new Date(startTime)
			}
		});

		return json({ timeLog }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Invalid input', details: error.errors }, { status: 400 });
		}
		console.error('Time log creation error:', error);
		return json({ error: 'Failed to create time log' }, { status: 500 });
	}
}

