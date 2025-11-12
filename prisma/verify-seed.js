import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.count();
  const tasks = await prisma.task.count();
  const logs = await prisma.timeLog.count();
  console.log(JSON.stringify({ users, tasks, logs }, null, 2));
}

run()
  .catch((e) => {
    console.error('Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });