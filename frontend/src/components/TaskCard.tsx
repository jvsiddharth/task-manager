import { Task } from "@/types"

export default function TaskCard({ task }: { task: Task }) {
  return (
    <div className="border rounded-xl p-4">
      <h2 className="font-semibold">{task.title}</h2>
      <p className="text-sm text-gray-600">{task.description}</p>
      <div className="flex justify-between text-sm mt-2">
        <span>{task.priority}</span>
        <span>{task.status}</span>
      </div>
    </div>
  )
}
