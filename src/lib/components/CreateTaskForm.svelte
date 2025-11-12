<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let userInput = '';
	let title = '';
	let description = '';
	let useAI = false;
	let loading = false;
	let error = '';

	async function enhanceWithAI() {
		if (!userInput.trim()) return;

		loading = true;
		error = '';
		try {
			const response = await fetch('/api/tasks/ai-enhance', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userInput })
			});

			if (response.ok) {
				const data = await response.json();
				title = data.title || userInput;
				description = data.description || '';
			} else {
				error = 'Failed to enhance task';
			}
		} catch (err) {
			error = 'Network error';
		} finally {
			loading = false;
		}
	}

	async function handleSubmit() {
		if (!title.trim()) {
			error = 'Title is required';
			return;
		}

		loading = true;
		error = '';

		try {
			const response = await fetch('/api/tasks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title,
					description: description || null
				})
			});

			if (response.ok) {
				userInput = '';
				title = '';
				description = '';
				useAI = false;
				dispatch('taskCreated');
			} else {
				const data = await response.json();
				error = data.error || 'Failed to create task';
			}
		} catch (err) {
			error = 'Network error';
		} finally {
			loading = false;
		}
	}
</script>

<div class="create-task-card">
	<h2>Create New Task</h2>
	
	<div class="ai-section">
		<label class="ai-checkbox">
			<input type="checkbox" bind:checked={useAI} />
			<span class="checkmark"></span>
			Use AI to enhance task
		</label>
	</div>

	{#if useAI}
		<div class="form-group">
			<label for="userInput">Describe your task (natural language)</label>
			<textarea
				id="userInput"
				bind:value={userInput}
				placeholder="e.g., follow up with designer"
				disabled={loading}
				rows="2"
			></textarea>
			<button
				type="button"
				on:click={enhanceWithAI}
				disabled={loading || !userInput.trim()}
				class="btn btn-secondary"
			>
				{loading ? 'Enhancing...' : 'Enhance with AI'}
			</button>
		</div>
	{/if}

	<div class="form-group">
		<label for="title">Task Title *</label>
		<input
			type="text"
			id="title"
			bind:value={title}
			placeholder="Enter task title"
			required
			disabled={loading}
		/>
	</div>

	<div class="form-group">
		<label for="description">Description</label>
		<textarea
			id="description"
			bind:value={description}
			placeholder="Enter task description (optional)"
			disabled={loading}
			rows="3"
		></textarea>
	</div>

	{#if error}
		<div class="error-message">{error}</div>
	{/if}

	<button
		type="button"
		on:click={handleSubmit}
		disabled={loading || !title.trim()}
		class="btn btn-primary"
	>
		{loading ? 'Creating...' : 'Create Task'}
	</button>
</div>

<style>
	.create-task-card {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		border-radius: var(--radius-xl);
		padding: var(--space-8);
		border: 1px solid rgba(255, 255, 255, 0.15);
		box-shadow: var(--shadow-xl);
		height: fit-content;
	}

	.create-task-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: var(--gradient-primary);
		opacity: 0.8;
	}

	.create-task-card h2 {
		margin-bottom: var(--space-6);
		color: white;
		font-size: 1.75rem;
		font-weight: 700;
		text-align: center;
		background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.ai-section {
		margin-bottom: var(--space-6);
		padding: var(--space-4);
		background: rgba(255, 255, 255, 0.05);
		border-radius: var(--radius-lg);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.ai-checkbox {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		cursor: pointer;
		color: rgba(255, 255, 255, 0.9);
		font-weight: 500;
		transition: var(--transition);
		position: relative;
	}

	.ai-checkbox input[type="checkbox"] {
		opacity: 0;
		position: absolute;
	}

	.checkmark {
		width: 20px;
		height: 20px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: var(--radius-sm);
		position: relative;
		transition: var(--transition);
	}

	.ai-checkbox input:checked + .checkmark {
		background: var(--gradient-primary);
		border-color: var(--primary);
	}

	.ai-checkbox input:checked + .checkmark::after {
		content: '✓';
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		color: white;
		font-size: 12px;
		font-weight: bold;
	}

	.form-group {
		margin-bottom: var(--space-6);
		animation: fadeIn 0.5s ease-out;
	}

	.form-group label {
		display: block;
		margin-bottom: var(--space-2);
		color: rgba(255, 255, 255, 0.9);
		font-weight: 600;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: var(--space-4);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: var(--radius-lg);
		font-size: 1rem;
		transition: var(--transition);
		resize: vertical;
		background: #ffffff !important;
		backdrop-filter: blur(10px);
		color: #000000 !important;
		box-sizing: border-box;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2), var(--shadow-lg);
		transform: scale(1.02);
		background: #ffffff !important;
	}

	.form-group input::placeholder,
	.form-group textarea::placeholder {
		color: #666666 !important;
		opacity: 1 !important;
	}

	.error-message {
		background: rgba(239, 68, 68, 0.1);
		color: #fca5a5;
		padding: var(--space-4);
		border-radius: var(--radius-lg);
		margin-bottom: var(--space-4);
		font-size: 0.9rem;
		border: 1px solid rgba(239, 68, 68, 0.3);
		backdrop-filter: blur(10px);
		animation: bounceIn 0.5s ease-out;
	}

	.btn {
		padding: var(--space-4) var(--space-6);
		border: none;
		border-radius: var(--radius-lg);
		font-size: 1rem;
		font-weight: 600;
		transition: var(--transition-bounce);
		cursor: pointer;
		position: relative;
		overflow: hidden;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.btn::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		transition: width 0.4s, height 0.4s;
	}

	.btn:hover:not(:disabled)::before {
		width: 300px;
		height: 300px;
	}

	.btn-primary {
		background: var(--gradient-primary);
		color: white;
		width: 100%;
		box-shadow: var(--shadow-md);
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.btn-secondary {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		margin-top: var(--space-2);
		border: 1px solid rgba(255, 255, 255, 0.3);
		backdrop-filter: blur(10px);
	}

	.btn-secondary:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.3);
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.btn:active {
		transform: scale(0.98);
	}

	/* Loading animation for buttons */
	.btn:disabled::after {
		content: '';
		position: absolute;
		right: var(--space-4);
		top: 50%;
		transform: translateY(-50%);
		width: 12px;
		height: 12px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: white;
		animation: spin 1s linear infinite;
	}
</style>

