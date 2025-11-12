const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY;

export async function enhanceTaskWithAI(userInput) {
	if (!OPENAI_API_KEY) {
		// Fallback: simple parsing if no API key
		return {
			title: userInput.charAt(0).toUpperCase() + userInput.slice(1),
			description: null
		};
	}

	try {
		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${OPENAI_API_KEY}`
			},
			body: JSON.stringify({
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: 'system',
						content: 'You are a task management assistant. Given a user\'s natural language task input, generate a clear, concise task title and a structured description. Return only a JSON object with "title" and "description" fields.'
					},
					{
						role: 'user',
						content: userInput
					}
				],
				temperature: 0.7,
				max_tokens: 150
			})
		});

		const data = await response.json();
		const content = data.choices?.[0]?.message?.content;

		if (content) {
			try {
				const parsed = JSON.parse(content);
				return {
					title: parsed.title || userInput,
					description: parsed.description || null
				};
			} catch {
				// If JSON parsing fails, use the content as title
				return {
					title: content.trim(),
					description: null
				};
			}
		}
	} catch (error) {
		console.error('AI enhancement error:', error);
	}

	// Fallback
	return {
		title: userInput.charAt(0).toUpperCase() + userInput.slice(1),
		description: null
	};
}

