import type { Task } from '@/types/task'

const STORAGE_KEY = 'kanban_tasks'
let taskCache: Task[] | null = null

export const taskStorage = {
 
  getTasks(): Task[] {
    if (taskCache) return taskCache
    const stored = localStorage.getItem(STORAGE_KEY)
    taskCache = stored ? JSON.parse(stored) : []
    return taskCache || []
  },

  saveTasks(tasks: Task[]): void {
    taskCache = [...tasks]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(taskCache))
  },
  
  clearCache(): void {
    taskCache = null
  },

  getTaskById(id: string): Task | undefined {
    return this.getTasks().find(t => t.id === id || t._id === id)
  }
}
