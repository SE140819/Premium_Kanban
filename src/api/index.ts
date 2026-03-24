import type { Task, ApiResponse } from '@/types/task'
import { taskStorage } from '@/storage/taskStorage'

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const api = {
  get: async <T>(url: string): Promise<ApiResponse<T>> => {
    await delay(300)
    if (url.endsWith('/tasks')) {
      return { data: taskStorage.getTasks() as unknown as T, error: null }
    }
    return { data: null, error: { status: 404, message: 'Not found' } }
  },

  post: async <T>(url: string, data: any): Promise<ApiResponse<T>> => {
    await delay(300)
    if (url.endsWith('/tasks')) {
      const tasks = taskStorage.getTasks()
      const newTask: Task = { 
        ...data, 
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      }
      taskStorage.saveTasks([...tasks, newTask])
      return { data: newTask as unknown as T, error: null }
    }
    return { data: null, error: { status: 404, message: 'Not found' } }
  },

  put: async <T>(url: string, data: any): Promise<ApiResponse<T>> => {
    await delay(300)
    if (url.includes('/tasks/')) {
      const id = url.split('/').pop()
      const tasks = taskStorage.getTasks()
      const index = tasks.findIndex(t => t.id === id || t._id === id)
      
      if (index !== -1) {
        const updatedTask = { ...tasks[index], ...data, updatedAt: new Date().toISOString() }
        const newTasks = tasks.map((t, i) => i === index ? updatedTask : t)
        taskStorage.saveTasks(newTasks)
        return { data: updatedTask as unknown as T, error: null }
      }
      return { data: null, error: { status: 404, message: 'Task not found' } }
    }
    return { data: null, error: { status: 404, message: 'Not found' } }
  },

  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    await delay(200)
    if (url.includes('/tasks/')) {
      const id = url.split('/').pop()
      const tasks = taskStorage.getTasks()
      const filteredTasks = tasks.filter(t => t.id !== id && t._id !== id)
      
      if (filteredTasks.length < tasks.length) {
        taskStorage.saveTasks(filteredTasks)
        return { data: { success: true } as unknown as T, error: null }
      }
      return { data: null, error: { status: 404, message: 'Task not found' } }
    }
    return { data: null, error: { status: 404, message: 'Not found' } }
  }
}

export default api
