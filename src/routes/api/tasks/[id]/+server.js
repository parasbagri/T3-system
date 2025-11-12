import { json } from '@sveltejs/kit';
import prisma from '$lib/db.js';
import { getUserIdFromRequest } from '$lib/auth.js';
import { z } from 'zod';

const updateTaskSchema = z.object({
	title: z.string().min(1).optional(),
	description: z.string().optional().nullable(),
	status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional()
});

export async function GET({ request, params }) {
	const userId = await getUserIdFromRequest(request);
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const taskId = parseInt(params.id);
	const task = await prisma.task.findFirst({
		where: {
			id: taskId,
			userId
		},
		include: {
			timeLogs: {
				where: {
					endTime: { not: null }
				}
			}
		}
	});

	if (!task) {
		return json({ error: 'Task not found' }, { status: 404 });
	}

	const totalTime = task.timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
	return json({ task: { ...task, totalTime } });
}

export async function PUT({ request, params }) {
	const userId = await getUserIdFromRequest(request);
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const taskId = parseInt(params.id);
		const body = await request.json();
		const updates = updateTaskSchema.parse(body);

		// Verify task belongs to user
		const existingTask = await prisma.task.findFirst({
			where: {
				id: taskId,
				userId
			}
		});

		if (!existingTask) {
			return json({ error: 'Task not found' }, { status: 404 });
		}

		const task = await prisma.task.update({
			where: { id: taskId },
			data: updates
		});

		return json({ task });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Invalid input', details: error.errors }, { status: 400 });
		}
		console.error('Task update error:', error);
		return json({ error: 'Failed to update task' }, { status: 500 });
	}
}

export async function DELETE({ request, params }) {
	const userId = await getUserIdFromRequest(request);
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const taskId = parseInt(params.id);

	// Verify task belongs to user
	const existingTask = await prisma.task.findFirst({
		where: {
			id: taskId,
			userId
		}
	});

	if (!existingTask) {
		return json({ error: 'Task not found' }, { status: 404 });
	}

	await prisma.task.delete({
		where: { id: taskId }
	});

	return json({ message: 'Task deleted successfully' });
}

