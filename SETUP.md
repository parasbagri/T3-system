# Quick Setup Guide

Follow these steps to get the Task Timer App running:

## Step 1: Create Environment File

Create a `.env` file in the `task-timer-app` directory with the following content:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
OPENAI_API_KEY=""
```

**Important**: 
- Change `JWT_SECRET` to a strong random string for production
- Add your OpenAI API key if you want AI task enhancement (optional)

## Step 2: Install Dependencies

```bash
cd task-timer-app
npm install
```

## Step 3: Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Create database and run migrations
npm run db:migrate
```

When prompted for a migration name, you can use `init` or just press Enter.

## Step 4: Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in the terminal).

## Step 5: Create Your First Account

1. Navigate to the app in your browser
2. Click "Sign up" or go to `/register`
3. Enter your name, email, and password (minimum 6 characters)
4. You'll be automatically logged in and redirected to the tasks page

## Troubleshooting

### Database Issues
- If you get Prisma errors, make sure you've run `npm run db:generate` and `npm run db:migrate`
- The database file will be created at `prisma/dev.db`

### Port Already in Use
- If port 5173 is taken, Vite will automatically use the next available port
- Check the terminal output for the actual port number

### Environment Variables Not Working
- Make sure the `.env` file is in the `task-timer-app` directory (not the parent directory)
- Restart the dev server after creating/modifying `.env`

## Next Steps

- Create tasks and start tracking time
- Try the AI enhancement feature (if you added an OpenAI API key)
- View your daily summary to see productivity metrics
- Explore the API endpoints using browser dev tools or Postman

