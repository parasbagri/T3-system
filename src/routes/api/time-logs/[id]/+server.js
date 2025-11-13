import { json } from '@sveltejs/kit';
import prisma from '$lib/db.js';
import { getUserIdFromRequest } from '$lib/auth.js';

export async function DELETE({ request, params }) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const timeLogId = parseInt(params.id);

  const existingLog = await prisma.timeLog.findFirst({
    where: { id: timeLogId, userId },
    select: { id: true }
  });

  if (!existingLog) {
    return json({ error: 'Time log not found' }, { status: 404 });
  }

  await prisma.timeLog.delete({ where: { id: timeLogId } });
  return json({ message: 'Time log deleted' });
}
