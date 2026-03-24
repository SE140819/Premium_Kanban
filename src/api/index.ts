import type { Task, ApiResponse } from '@/types/task'
import { taskStorage } from '@/storage/taskStorage'

/** Helper to simulate realistic network delay */
export const delay = (min = 200, max = 600) => {
  const ms = Math.floor(Math.random() * (max - min + 1) + min)
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** Helper to extract ID from URL like /tasks/123 */
const getIdFromUrl = (url: string): string => url.split('/').pop() || ''

const api = {
  get: async <T>(url: string): Promise<ApiResponse<T>> => {
    await delay()
    if (url.endsWith('/tasks')) {
      return { data: taskStorage.getTasks() as T, error: null }
    }
    return { data: null, error: { status: 404, message: 'Endpoint not found' } }
  },

  post: async <T>(url: string, data: Partial<Task>): Promise<ApiResponse<T>> => {
    await delay()
    if (url.endsWith('/tasks')) {
      // Basic validation
      if (!data.title?.trim()) {
        return { data: null, error: { status: 400, message: 'Title is required' } }
      }

      const tasks = taskStorage.getTasks()
      const newTask: Task = { 
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description || '',
        columnId: data.columnId || 'backlog',
        priority: data.priority || 'low',
        deadline: data.deadline || null,
        createdAt: new Date().toISOString()
      }
      
      taskStorage.saveTasks([...tasks, newTask])
      return { data: newTask as T, error: null }
    }
    return { data: null, error: { status: 404, message: 'Endpoint not found' } }
  },

  put: async <T>(url: string, data: Partial<Task>): Promise<ApiResponse<T>> => {
    await delay()
    if (url.includes('/tasks/')) {
      const id = getIdFromUrl(url)
      const tasks = taskStorage.getTasks()
      const index = tasks.findIndex(t => t.id === id || t._id === id)
      
      if (index !== -1) {
        const updatedTask = { 
          ...tasks[index], 
          ...data, 
          updatedAt: new Date().toISOString() 
        } as Task
        
        const newTasks = tasks.map((t, i) => i === index ? updatedTask : t)
        taskStorage.saveTasks(newTasks)
        return { data: updatedTask as T, error: null }
      }
      return { data: null, error: { status: 404, message: 'Task not found' } }
    }
    return { data: null, error: { status: 404, message: 'Endpoint not found' } }
  },

  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    await delay(150, 400)
    if (url.includes('/tasks/')) {
      const id = getIdFromUrl(url)
      const tasks = taskStorage.getTasks()
      const exists = tasks.some(t => t.id === id || t._id === id)
      
      if (exists) {
        const filteredTasks = tasks.filter(t => t.id !== id && t._id !== id)
        taskStorage.saveTasks(filteredTasks)
        return { data: { success: true } as T, error: null }
      }
      return { data: null, error: { status: 404, message: 'Task not found' } }
    }
    return { data: null, error: { status: 404, message: 'Endpoint not found' } }
  }
}

export default api
