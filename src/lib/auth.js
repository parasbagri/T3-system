import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = import.meta.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export async function hashPassword(password) {
	return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
	return await bcrypt.compare(password, hash);
}

export function generateToken(userId) {
	return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch (error) {
		return null;
	}
}

export async function getUserIdFromRequest(request) {
	const cookieHeader = request.headers.get('cookie');
	if (!cookieHeader) return null;

	const cookies = Object.fromEntries(
		cookieHeader.split(';').map(c => {
			const [key, ...rest] = c.trim().split('=');
			return [key, rest.join('=')];
		})
	);

	const token = cookies.token;
	if (!token) return null;

	const decoded = verifyToken(token);
	return decoded?.userId || null;
}

