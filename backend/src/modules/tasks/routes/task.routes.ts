import { Router, Request, Response } from 'express';
import { prisma } from '../../../lib/prisma.js';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
} from '../models/task.model.js';
import { io, userSockets } from '../../../server.js';
import { verifyToken } from "../../auth/utils/jwt"

const router = Router();

/* ---------- CREATE ---------- */
router.post('/', async (req: Request, res: Response) => {
  const data = CreateTaskSchema.parse(req.body);

  const creator = await prisma.user.findUnique({
    where: { id: data.creatorId },
  });
  const assignee = await prisma.user.findUnique({
    where: { id: data.assignedToId },
  });

  if (!creator || !assignee) {
    return res.status(400).json({ message: 'Invalid user reference' });
  }

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
      priority: data.priority,
      status: data.status ?? 'TODO',
      creatorId: data.creatorId,
      assignedToId: data.assignedToId,
    },
  });

  res.status(201).json(task);
});

/* ---------- LIST ---------- */
router.get('/', async (req: Request, res: Response) => {
  const {
    createdBy,
    assignedTo,
    status,
    priority,
    overdue,
    sort,
  } = req.query;

  const tasks = await prisma.task.findMany({
    where: {
      ...(createdBy && { creatorId: createdBy as string }),
      ...(assignedTo && { assignedToId: assignedTo as string }),
      ...(status && { status: status as any }),
      ...(priority && { priority: priority as any }),
      ...(overdue === 'true' && {
        dueDate: { lt: new Date() },
        status: { not: 'COMPLETED' },
      }),
    },
    orderBy: {
      dueDate: sort === 'desc' ? 'desc' : 'asc',
    },
  });

  res.json(tasks);
});

/* ---------- UPDATE ---------- */
router.patch('/:id', async (req: Request, res: Response) => {
  const data = UpdateTaskSchema.parse(req.body);

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      ...data,
      ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
    },
  });

  res.json(task);
});

/* ---------- DELETE ---------- */
router.delete('/:id', async (req: Request, res: Response) => {
  await prisma.task.delete({
    where: { id: req.params.id },
  });

  res.status(204).send();
});

export default router;

/* ---------- REAL-TIME ---------- */

router.patch('/:id', async (req: Request, res: Response) => {
  const data = UpdateTaskSchema.parse(req.body);

  // 1️⃣ Check task exists
  const existing = await prisma.task.findUnique({
    where: { id: req.params.id },
  });

  if (!existing) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // 2️⃣ Update task
  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      ...data,
      ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
    },
  });

  // 3️⃣ Emit live update to all clients
  io.emit('task:updated', {
    id: task.id,
    status: task.status,
    priority: task.priority,
    assignedToId: task.assignedToId,
    updatedAt: task.updatedAt,
  });

  // 4️⃣ Assignment notification (ONLY if assignee changed)
  if (existing.assignedToId !== task.assignedToId) {
    const notification = await prisma.notification.create({
      data: {
        userId: task.assignedToId,
        message: `You have been assigned a new task: ${task.title}`,
      },
    });

    const socketId = userSockets.get(task.assignedToId);
    if (socketId) {
      io.to(socketId).emit('notification:new', notification);
    }
  }

  res.json(task);
});


router.get('/notifications/:userId', async (req: Request, res: Response) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.params.userId },
    orderBy: { createdAt: 'desc' },
  });

  res.json(notifications);
});


router.get("/auth/me", async (req: Request, res: Response) => {
  const token = req.cookies.auth
  if (!token) return res.status(401).end()

  try {
    const payload = verifyToken(token) as { userId: string }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true },
    })

    if (!user) return res.status(401).end()
    res.json(user)
  } catch {
    res.status(401).end()
  }
})
