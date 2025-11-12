import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with dummy data...');

  // Wipe existing data for a clean seed
  await prisma.timeLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  // Create users with hashed passwords yes
  const passwordAlice = await bcrypt.hash('password123', 10);
  const passwordBob = await bcrypt.hash('securepass', 10);

  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      password: passwordAlice,
      name: 'Alice'
    }
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      password: passwordBob,
      name: 'Bob'
    }
  });

  // Create tasks for Alice
  const aliceTask1 = await prisma.task.create({
    data: {
      title: 'Write project README',
      description: 'Draft and refine documentation',
      status: 'IN_PROGRESS',
      userId: alice.id
    }
  });

  const aliceTask2 = await prisma.task.create({
    data: {
      title: 'Fix login form validation',
      description: 'Ensure proper error messages and zod checks',
      status: 'PENDING',
      userId: alice.id
    }
  });

  // Create tasks for Bob
  const bobTask1 = await prisma.task.create({
    data: {
      title: 'Implement time tracking stop logic',
      description: 'Compute duration and persist end time',
      status: 'COMPLETED',
      userId: bob.id
    }
  });

  const bobTask2 = await prisma.task.create({
    data: {
      title: 'Design daily summary layout',
      description: 'Svelte components for totals and logs',
      status: 'IN_PROGRESS',
      userId: bob.id
    }
  });

  // Create time logs (completed)
  const start1 = new Date(Date.now() - 60 * 60 * 1000); // 1h ago
  const end1 = new Date(Date.now() - 20 * 60 * 1000); // 20m ago
  const duration1 = Math.floor((end1 - start1) / 1000);
  await prisma.timeLog.create({
    data: {
      taskId: aliceTask1.id,
      userId: alice.id,
      startTime: start1,
      endTime: end1,
      duration: duration1
    }
  });

  const start2 = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2h ago
  const end2 = new Date(Date.now() - 90 * 60 * 1000); // 1.5h ago
  const duration2 = Math.floor((end2 - start2) / 1000);
  await prisma.timeLog.create({
    data: {
      taskId: bobTask1.id,
      userId: bob.id,
      startTime: start2,
      endTime: end2,
      duration: duration2
    }
  });

  // Create an active time log (no endTime yet)
  const activeStart = new Date(Date.now() - 10 * 60 * 1000); // 10m ago
  await prisma.timeLog.create({
    data: {
      taskId: bobTask2.id,
      userId: bob.id,
      startTime: activeStart
    }
  });

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });