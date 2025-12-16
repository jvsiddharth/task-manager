import { TaskPriority } from "@/types"

export default function TaskForm() {
  return (
    <form className="space-y-4">
      <input className="border p-2 w-full rounded" placeholder="Title" />
      <textarea className="border p-2 w-full rounded" placeholder="Description" />
      <select className="border p-2 w-full rounded">
        {Object.values(TaskPriority).map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>
      <button className="bg-black text-white px-4 py-2 rounded">
        Create Task
      </button>
    </form>
  )
}
