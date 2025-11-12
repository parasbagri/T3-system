import { json } from '@sveltejs/kit';
import { enhanceTaskWithAI } from '$lib/ai.js';
import { z } from 'zod';

const enhanceSchema = z.object({
	userInput: z.string().min(1)
});

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { userInput } = enhanceSchema.parse(body);

		const enhanced = await enhanceTaskWithAI(userInput);

		return json({ ...enhanced });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Invalid input', details: error.errors }, { status: 400 });
		}
		console.error('AI enhance error:', error);
		return json({ error: 'Failed to enhance task' }, { status: 500 });
	}
}

