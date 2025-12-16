import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma';
import authRoutes from './modules/auth/routes/auth.routes'
import taskRoutes from './modules/tasks/routes/task.routes'

export const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

app.use('/auth', authRoutes)
app.use('/tasks', taskRoutes)

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/health/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ db: 'connected' });
  } catch {
    res.status(500).json({ db: 'disconnected' });
  }
});


