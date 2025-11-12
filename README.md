# Task and Time Tracking App

A full-stack task management application built with SvelteKit that allows users to manage tasks, track time using a real-time timer, and view daily productivity summaries.

## Features

### ✅ Authentication
- User registration and login
- Secure password hashing with bcrypt
- JWT-based session management
- Protected routes and API endpoints

### ✅ Task Management
- Create tasks with natural language input
- AI-powered task enhancement (optional - requires OpenAI API key)
- View all tasks
- Edit task details (title, description, status)
- Update task status: Pending, In Progress, Completed
- Delete tasks

### ✅ Real-Time Time Tracking
- Start/stop timer for each task
- Real-time elapsed time display
- Automatic time log creation
- View total time spent on each task
- View all time logs

### ✅ Daily Summary
- View summary for any date
- Total time tracked
- Completed tasks count
- In-progress and pending tasks
- Tasks worked on
- Detailed time log list

## Tech Stack

- **Frontend/Backend**: SvelteKit
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT tokens with httpOnly cookies
- **Validation**: Zod
- **Date Handling**: Day.js
- **AI Enhancement**: OpenAI API (optional)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
OPENAI_API_KEY=""
```

**Note**: 
- Replace `JWT_SECRET` with a strong random string in production
- Add your OpenAI API key if you want to use AI task enhancement (optional)

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Run database migrations
npm run db:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
task-timer-app/
├── prisma/
│   └── schema.prisma          # Database schema
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
│       └── +page.svelte       # Main tasks page
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/[id]` - Get task by ID
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task
- `POST /api/tasks/ai-enhance` - Enhance task with AI

### Time Logs
- `GET /api/time-logs` - Get all user time logs
- `POST /api/time-logs` - Start time tracking
- `POST /api/time-logs/[id]/stop` - Stop time tracking

### Summary
- `GET /api/summary?date=YYYY-MM-DD` - Get daily summary

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Create Tasks**: Use the form to create tasks. Optionally use AI enhancement for better task titles and descriptions
3. **Track Time**: Click "Start" on any task to begin tracking time. Click "Stop" to end the session
4. **Manage Tasks**: Edit task details, change status, or delete tasks
5. **View Summary**: Navigate to Daily Summary to see your productivity metrics

## Database Schema

- **User**: id, email, password, name, createdAt, updatedAt
- **Task**: id, title, description, status, userId, createdAt, updatedAt
- **TimeLog**: id, taskId, userId, startTime, endTime, duration, createdAt, updatedAt

## Security Features

- Password hashing with bcrypt
- JWT tokens stored in httpOnly cookies
- User authorization checks on all protected endpoints
- Input validation with Zod schemas
- SQL injection protection via Prisma ORM

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio

## Notes

- The app uses SQLite for simplicity. For production, consider PostgreSQL or MySQL
- AI enhancement is optional and works without an API key (uses simple fallback)
- All time tracking is stored in seconds
- The daily summary can be viewed for any past date
