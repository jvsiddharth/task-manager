"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

/* ================= TYPES ================= */

type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED"
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"

type Task = {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  creatorId: string
  assignedToId: string
  dueDate: string
}

/* ================= CONSTANTS ================= */

const STATUSES: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "COMPLETED",
]

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  LOW: "bg-gray-200 text-black",
  MEDIUM: "bg-yellow-200 text-black",
  HIGH: "bg-orange-300 text-black",
  URGENT: "bg-red-300 text-black",
}

/* ================= PAGE ================= */

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  /* ---------- FETCH TASKS ---------- */
  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get<Task[]>("/tasks")
        setTasks(data)
      } catch {
        setError("Failed to load tasks")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  /* ---------- CREATE ---------- */
  async function createTask(data: Partial<Task>) {
    const res = await api.post<Task>("/tasks", data)
    setTasks((t) => [...t, res.data])
    setShowCreate(false)
  }

  /* ---------- UPDATE STATUS ---------- */
  async function moveTask(taskId: string, status: TaskStatus) {
    setTasks((t) =>
      t.map((task) =>
        task.id === taskId ? { ...task, status } : task
      )
    )
    await api.patch(`/tasks/${taskId}`, { status })
  }

  /* ---------- STATES ---------- */

  if (loading) {
    return <div className="p-6 text-black">Loading dashboard…</div>
  }

  if (error) {
    return (
      <div className="p-6 text-black">
        {error}
      </div>
    )
  }

  /* ================= UI ================= */

  return (
    <div className="h-screen flex flex-col bg-gray-100 text-black">
      {/* ---------- TOP BAR ---------- */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-6">
        <div className="font-semibold">Task Manager</div>

        <button
          onClick={() => setShowCreate(true)}
          className="bg-black text-white px-3 py-1 rounded text-sm"
        >
          + Create Task
        </button>
      </header>

      {/* ---------- KANBAN ---------- */}
      <main className="flex-1 overflow-x-auto p-4">
        <div className="grid grid-cols-4 gap-4 h-full">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasks.filter((t) => t.status === status)}
              onMove={moveTask}
            />
          ))}
        </div>
      </main>

      {/* ---------- CREATE MODAL ---------- */}
      {showCreate && (
        <CreateTaskModal
          onClose={() => setShowCreate(false)}
          onCreate={createTask}
        />
      )}
    </div>
  )
}

/* ================= KANBAN COLUMN ================= */

function KanbanColumn({
  status,
  tasks,
  onMove,
}: {
  status: TaskStatus
  tasks: Task[]
  onMove: (id: string, status: TaskStatus) => void
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 flex flex-col text-black">
      <h2 className="font-medium mb-3">{status}</h2>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onMove={onMove} />
        ))}

        {tasks.length === 0 && (
          <div className="text-sm">No tasks</div>
        )}
      </div>
    </div>
  )
}

/* ================= TASK CARD ================= */

function TaskCard({
  task,
  onMove,
}: {
  task: Task
  onMove: (id: string, status: TaskStatus) => void
}) {
  return (
    <div className="bg-white rounded shadow-sm p-3 space-y-2 text-black">
      <div className="font-medium text-sm">{task.title}</div>

      <div className="text-xs line-clamp-2">
        {task.description}
      </div>

      <div className="flex justify-between items-center text-xs">
        <span
          className={`px-2 py-0.5 rounded ${PRIORITY_COLOR[task.priority]}`}
        >
          {task.priority}
        </span>

        <select
          value={task.status}
          onChange={(e) =>
            onMove(task.id, e.target.value as TaskStatus)
          }
          className="border rounded px-1 text-black"
        >
          {STATUSES.map((s) => (
            <option key={s} className="text-black">
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

/* ================= CREATE MODAL ================= */

function CreateTaskModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (data: Partial<Task>) => void
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    onCreate({
      title,
      description,
      priority,
      status: "TODO",
      dueDate: new Date().toISOString(),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <form
        onSubmit={submit}
        className="bg-white w-full max-w-md p-6 rounded space-y-4 text-black"
      >
        <h2 className="font-semibold text-lg">Create Task</h2>

        <input
          required
          className="border p-2 w-full rounded text-black"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="border p-2 w-full rounded text-black"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          className="border p-2 w-full rounded text-black"
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value as TaskPriority)
          }
        >
          <option>LOW</option>
          <option>MEDIUM</option>
          <option>HIGH</option>
          <option>URGENT</option>
        </select>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-sm"
          >
            Cancel
          </button>
          <button
            className="bg-black text-white px-3 py-1 rounded text-sm"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  )
}

