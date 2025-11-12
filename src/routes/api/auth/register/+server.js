import { json } from '@sveltejs/kit';
import prisma from '$lib/db.js';
import { hashPassword, generateToken } from '$lib/auth.js';
import { z } from 'zod';

const registerSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
	name: z.string().min(1)
});

export async function POST({ request, cookies }) {
	try {
		const body = await request.json();
		const { email, password, name } = registerSchema.parse(body);

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email }
		});

		if (existingUser) {
			return json({ error: 'User already exists' }, { status: 400 });
		}

		// Hash password and create user
		const hashedPassword = await hashPassword(password);
		const user = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				name
			}
		});

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
		console.error('Registration error:', error);
		return json({ error: 'Registration failed' }, { status: 500 });
	}
}

