import { json } from '@sveltejs/kit';
import prisma from '$lib/db.js';
import { getUserIdFromRequest } from '$lib/auth.js';

export async function POST({ request, params }) {
	const userId = await getUserIdFromRequest(request);
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const timeLogId = parseInt(params.id);

	// Verify time log belongs to user
	const existingLog = await prisma.timeLog.findFirst({
		where: {
			id: timeLogId,
			userId
		}
	});

	if (!existingLog) {
		return json({ error: 'Time log not found' }, { status: 404 });
	}

	if (existingLog.endTime) {
		return json({ error: 'Time log already stopped' }, { status: 400 });
	}

	const endTime = new Date();
	const duration = Math.floor((endTime - existingLog.startTime) / 1000); // Duration in seconds

	const timeLog = await prisma.timeLog.update({
		where: { id: timeLogId },
		data: {
			endTime,
			duration
		}
	});

	return json({ timeLog });
}

