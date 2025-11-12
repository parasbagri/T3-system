<script>
	import { goto } from '$app/navigation';
	import { isAuthenticated, user } from '$lib/stores.js';
	import { onMount } from 'svelte';

	let name = '';
	let email = '';
	let password = '';
	let error = '';
	let loading = false;

	onMount(() => {
		if ($isAuthenticated) {
			goto('/');
		}
	});

	async function handleRegister() {
		error = '';
		loading = true;

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, password })
			});

			const data = await response.json();

			if (response.ok) {
				user.set(data.user);
				isAuthenticated.set(true);
				goto('/');
			} else {
				error = data.error || 'Registration failed';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="auth-container">
	<div class="auth-card">
		<h1>Sign Up</h1>
		<form on:submit|preventDefault={handleRegister}>
			<div class="form-group">
				<label for="name">Name</label>
				<input
					type="text"
					id="name"
					bind:value={name}
					required
					disabled={loading}
				/>
			</div>
			<div class="form-group">
				<label for="email">Email</label>
				<input
					type="email"
					id="email"
					bind:value={email}
					required
					disabled={loading}
				/>
			</div>
			<div class="form-group">
				<label for="password">Password</label>
				<input
					type="password"
					id="password"
					bind:value={password}
					required
					minlength="6"
					disabled={loading}
				/>
			</div>
			{#if error}
				<div class="error-message">{error}</div>
			{/if}
			<button type="submit" disabled={loading} class="btn btn-primary">
				{loading ? 'Signing up...' : 'Sign Up'}
			</button>
		</form>
		<p class="auth-link">
			Already have an account? <a href="/login">Login</a>
		</p>
	</div>
</div>

<style>
	.auth-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: var(--space-8);
		position: relative;
	}

	.auth-container::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><radialGradient id="a" cx=".66" cy=".70" r=".7"><stop offset="0" stop-color="rgba(255,255,255,.3)"/><stop offset=".5" stop-color="rgba(255,255,255,.1)"/><stop offset="1" stop-color="transparent"/></radialGradient></defs><circle transform="translate(-20 -2) rotate(3)" r="25" fill="url(%23a)"/><circle transform="translate(-10 -10) rotate(-8)" r="10" fill="url(%23a)"/><circle transform="translate(50 50) rotate(0)" r="15" fill="url(%23a)"/></svg>') repeat;
		animation: float 20s ease-in-out infinite;
		opacity: 0.5;
	}

	@keyframes float {
		0%, 100% { transform: translateX(0px) translateY(0px); }
		33% { transform: translateX(-30px) translateY(-20px); }
		66% { transform: translateX(20px) translateY(10px); }
	}

	.auth-card {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		padding: var(--space-10);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-xl);
		width: 100%;
		max-width: 420px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		position: relative;
		z-index: 1;
		animation: slideUp 0.8s ease-out;
	}

	.auth-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: var(--gradient-primary);
		border-radius: var(--radius-xl) var(--radius-xl) 0 0;
	}

	.auth-card h1 {
		margin-bottom: var(--space-8);
		color: white;
		text-align: center;
		font-size: 2.5rem;
		font-weight: 700;
		background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		animation: fadeIn 1s ease-out 0.3s both;
	}

	.form-group {
		margin-bottom: var(--space-6);
		animation: fadeIn 0.6s ease-out;
	}

	.form-group:nth-child(1) { animation-delay: 0.4s; }
	.form-group:nth-child(2) { animation-delay: 0.5s; }
	.form-group:nth-child(3) { animation-delay: 0.6s; }

	.form-group label {
		display: block;
		margin-bottom: var(--space-2);
		color: rgba(255, 255, 255, 0.9);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 0.85rem;
	}

	.form-group input {
		width: 100%;
		padding: var(--space-4);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: var(--radius-lg);
		font-size: 1rem;
		transition: var(--transition);
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		color: white;
	}

	.form-group input::placeholder {
		color: rgba(255, 255, 255, 0.6);
	}

	.form-group input:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2), var(--shadow-lg);
		transform: scale(1.02);
		background: rgba(255, 255, 255, 0.15);
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
		width: 100%;
		padding: var(--space-4) var(--space-6);
		border: none;
		border-radius: var(--radius-lg);
		font-size: 1.1rem;
		font-weight: 600;
		transition: var(--transition-bounce);
		cursor: pointer;
		position: relative;
		overflow: hidden;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		animation: fadeIn 0.6s ease-out 0.7s both;
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
		transition: width 0.6s, height 0.6s;
	}

	.btn:hover:not(:disabled)::before {
		width: 400px;
		height: 400px;
	}

	.btn-primary {
		background: var(--gradient-primary);
		color: white;
		box-shadow: var(--shadow-lg);
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-3px);
		box-shadow: var(--shadow-xl), 0 0 30px rgba(99, 102, 241, 0.5);
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.btn:active {
		transform: scale(0.98);
	}

	.btn:disabled::after {
		content: '';
		position: absolute;
		right: var(--space-4);
		top: 50%;
		transform: translateY(-50%);
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: white;
		animation: spin 1s linear infinite;
	}

	.auth-link {
		text-align: center;
		margin-top: var(--space-6);
		color: rgba(255, 255, 255, 0.8);
		animation: fadeIn 0.6s ease-out 0.8s both;
	}

	.auth-link a {
		color: var(--primary-light);
		text-decoration: none;
		font-weight: 600;
		transition: var(--transition);
		position: relative;
	}

	.auth-link a::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 0;
		height: 2px;
		background: var(--primary-light);
		transition: width 0.3s;
	}

	.auth-link a:hover::after {
		width: 100%;
	}

	.auth-link a:hover {
		color: white;
		text-shadow: 0 0 8px rgba(165, 180, 252, 0.8);
	}
</style>

