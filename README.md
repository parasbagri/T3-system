# Task and Time Tracking App

A full-stack task management application built with SvelteKit that allows users to manage tasks, track time using a real-time timer, and view daily productivity summaries.

## Authentication

- ✔ Fully working auth (Signup, Login, Logout, Protected Routes)
- ✔ Optional test credentials for quicker review:
  - Email: `alice@example.com`
  - Password: `password123`

## Features

- Create, edit, complete, and delete tasks
- Real-time timer with automatic time log creation
- Daily summary dashboard by date
- Case-insensitive search bars on Tasks and Time Logs pages
- Optional AI-powered task enhancement

## Tech Stack

- `SvelteKit` for frontend and backend
- `PostgreSQL` with `Prisma ORM`
- `JWT` auth stored in httpOnly cookies
- `bcrypt` for password hashing
- `Zod` for validation
- `Day.js` for date/time formatting

## Setup Instructions (Local Development)

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure environment variables

   Create a `.env` file at the project root:

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/task_timer"
   JWT_SECRET="replace-with-a-strong-random-string"
   OPENAI_API_KEY="" # optional
   ```

   - Ensure a local PostgreSQL database exists that matches `DATABASE_URL`

3. Generate Prisma client and run migrations

   ```bash
   npm run db:generate
   npx prisma migrate dev
   ```

4. Start the development server

   ```bash
   npm run dev
   ```

   App runs at `http://localhost:5173`.

## Project Structure

```
task-timer-app/
├── prisma/
│   └── schema.prisma          # Database schema (PostgreSQL)
├── src/
│   ├── lib/
│   │   ├── components/        # Reusable Svelte components
│   │   │   ├── CreateTaskForm.svelte
│   │   │   ├── TaskList.svelte
│   │   │   └── TaskItem.svelte
│   │   ├── auth.js            # Authentication utilities
│   │   ├── db.js              # Prisma client instance
│   │   ├── ai.js              # AI enhancement functions
│   │   └── stores.js          # Svelte stores
│   └── routes/
│       ├── api/               # API endpoints
│       │   ├── auth/          # Authentication routes
│       │   ├── tasks/         # Task CRUD routes
│       │   ├── time-logs/     # Time tracking routes
│       │   └── summary/       # Daily summary route
│       ├── login/             # Login page
│       ├── register/          # Registration page
│       ├── summary/           # Daily summary page
│       ├── logs/              # Time logs page
│       └── +page.svelte       # Main tasks page
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` – Register new user
- `POST /api/auth/login` – Login user
- `POST /api/auth/logout` – Logout user
- `GET /api/auth/me` – Get current user

### Tasks
- `GET /api/tasks` – Get all user tasks
- `POST /api/tasks` – Create new task
- `GET /api/tasks/[id]` – Get task by ID
- `PUT /api/tasks/[id]` – Update task
- `DELETE /api/tasks/[id]` – Delete task
- `POST /api/tasks/ai-enhance` – Enhance task with AI

### Time Logs
- `GET /api/time-logs` – Get all user time logs
- `POST /api/time-logs` – Start time tracking
- `POST /api/time-logs/[id]/stop` – Stop time tracking
- `DELETE /api/time-logs/[id]` – Delete a log

### Summary
- `GET /api/summary?date=YYYY-MM-DD` – Get daily summary

## 📸 Screenshots & Page Descriptions

### Login
![Login](assets/login.png)
- Purpose: Authenticate existing users
- Features: Email and password login, link to signup
- Actions: Enter credentials and click `Login`

### Signup
- Purpose: Create a new account
- Features: Name, email, password inputs
- Actions: Submit to register and auto-login

### Tasks
![Tasks](assets/tasks.png)
- Purpose: Manage all tasks
- Features: Create task form, list of tasks, status badges, start/stop timer, edit/delete, complete
- Actions: Create, start/stop, edit, complete, delete tasks

#### Tasks – Search
![Tasks Search](assets/tasks-search.png)
- Purpose: Quickly locate tasks
- Features: Case-insensitive real-time filtering by title
- Actions: Type in the search bar to filter visible task cards

### Time Logs
![Time Logs](assets/time-logs.png)
- Purpose: Review tracked time grouped by task
- Features: Task cards with logs, per-log duration, delete log, delete task, search bar filtering task cards by name
- Actions: Use search to show only matching task cards and their logs

### Daily Summary
![Daily Summary](assets/daily-summary.png)
- Purpose: View productivity metrics for a selected date
- Features: Total time tracked, completed tasks count, lists of tasks and logs
- Actions: Pick a date to update summary

## Usage

1. Register or login (or use test credentials above)
2. Create tasks and optionally enhance with AI
3. Start/stop timers to create time logs
4. Use search on Tasks/Time Logs to filter by task name
5. View the Daily Summary for any date

## Security

- Password hashing with bcrypt
- JWT tokens in httpOnly cookies
- Authorization checks on protected endpoints
- Validation with Zod
- Prisma ORM safeguards
