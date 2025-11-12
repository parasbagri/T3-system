import { json } from '@sveltejs/kit';
import prisma from '$lib/db.js';
import { verifyPassword, generateToken } from '$lib/auth.js';
import { z } from 'zod';

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string()
});

export async function POST({ request, cookies }) {
	try {
		const body = await request.json();
		const { email, password } = loginSchema.parse(body);

		// Find user
		const user = await prisma.user.findUnique({
			where: { email }
		});

		if (!user) {
			return json({ error: 'Invalid credentials' }, { status: 401 });
		}

		// Verify password
		const isValid = await verifyPassword(password, user.password);
		if (!isValid) {
			return json({ error: 'Invalid credentials' }, { status: 401 });
		}

		// Generate token and set cookie
		const token = generateToken(user.id);
		cookies.set('token', token, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		return json({
			user: {
				id: user.id,
				email: user.email,
				name: user.name
			}
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Invalid input', details: error.errors }, { status: 400 });
		}
		console.error('Login error:', error);
		return json({ error: 'Login failed' }, { status: 500 });
	}
}

