export type User = {
  id: string
  email: string
  name: string
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  REVIEW = "REVIEW",
  COMPLETED = "COMPLETED",
}

export type Task = {
  id: string
  title: string
  description: string
  dueDate: string
  priority: TaskPriority
  status: TaskStatus
  creator: User
  assignedTo: User
}

export type Notification = {
  id: string
  message: string
  read: boolean
  createdAt: string
}
