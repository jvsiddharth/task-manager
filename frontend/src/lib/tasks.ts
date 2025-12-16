import { api } from "./api"
import { Task } from "@/types"

export async function fetchTasks(): Promise<Task[]> {
  const { data } = await api.get("/tasks")
  return data
}
