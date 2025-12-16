import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../lib/prisma.js';
import {
  RegisterSchema,
  LoginSchema,
} from '../models/auth.models.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET!;

/* ---------------- REGISTER ---------------- */

router.post('/register', async (req: Request, res: Response) => {
  const data = RegisterSchema.parse(req.body);

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
    },
  });

  res.status(201).json({
    id: user.id,
    email: user.email,
    name: user.name,
  });
});

/* ---------------- LOGIN ---------------- */

router.post('/login', async (req: Request, res: Response) => {
  const data = LoginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(data.password, user.password);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
  });

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
  });
});

export default router;



