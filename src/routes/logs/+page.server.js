import prisma from '$lib/db.js';
import { verifyToken } from '$lib/auth.js';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
  const token = cookies.get('token');
  const decoded = token ? verifyToken(token) : null;
  if (!decoded?.userId) {
    throw redirect(302, '/login');
  }

  try {
    const timeLogs = await prisma.timeLog.findMany({
      where: { userId: decoded.userId },
      include: {
        task: { select: { id: true, title: true } }
      },
      orderBy: { startTime: 'desc' }
    });

    return { timeLogs };
  } catch (e) {
    console.error('Logs load error:', e);
    return { timeLogs: [] };
  }
}
