import { z } from 'zod';
import { $Enums } from '../../../generated/prisma/client.js';

/* ---------- Create ---------- */
export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1),
  dueDate: z.string().datetime(),
  priority: z.enum(Object.values($Enums.TaskPriority) as [
    $Enums.TaskPriority,
    ...$Enums.TaskPriority[]
  ]),
  status: z.enum(Object.values($Enums.TaskStatus) as [
    $Enums.TaskStatus,
    ...$Enums.TaskStatus[]
  ]).optional(),
  creatorId: z.string().uuid(),
  assignedToId: z.string().uuid(),
});

/* ---------- Update ---------- */
export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(Object.values($Enums.TaskPriority) as [
    $Enums.TaskPriority,
    ...$Enums.TaskPriority[]
  ]).optional(),
  status: z.enum(Object.values($Enums.TaskStatus) as [
    $Enums.TaskStatus,
    ...$Enums.TaskStatus[]
  ]).optional(),
  assignedToId: z.string().uuid().optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
