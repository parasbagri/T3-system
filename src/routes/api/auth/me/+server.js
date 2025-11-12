import { json } from '@sveltejs/kit';
import prisma from '$lib/db.js';
import { getUserIdFromRequest } from '$lib/auth.js';

export async function GET({ request }) {
	const userId = await getUserIdFromRequest(request);
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			email: true,
			name: true
		}
	});

	if (!user) {
		return json({ error: 'User not found' }, { status: 404 });
	}

	return json({ user });
}

