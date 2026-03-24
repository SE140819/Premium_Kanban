import type { Task } from '@/types/task'
import type { ApiResponse } from '@/types/api'
import { taskStorage } from '@/storage/taskStorage'

export const delay = (min = 200, max = 600) => {
  const ms = Math.floor(Math.random() * (max - min + 1) + min)
  return new Promise(resolve => setTimeout(resolve, ms))
}

const getIdFromUrl = (url: string): string => url.split('/').pop() || ''

const api = {
  get: async <T>(url: string): Promise<ApiResponse<T>> => {
    await delay()
    return url.endsWith('/tasks') 
      ? { data: taskStorage.getTasks() as T, error: null }
      : { data: null, error: { status: 404, message: 'Endpoint not found' } }
  },

  post: async <T>(url: string, data: Partial<Task>): Promise<ApiResponse<T>> => {
    await delay()
    if (!url.endsWith('/tasks')) return { data: null, error: { status: 404, message: 'Endpoint not found' } }
    if (!data.title?.trim()) return { data: null, error: { status: 400, message: 'Title is required' } }

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
  },

  put: async <T>(url: string, data: Partial<Task>): Promise<ApiResponse<T>> => {
    await delay()
    if (!url.includes('/tasks/')) return { data: null, error: { status: 404, message: 'Endpoint not found' } }
    
    const id = getIdFromUrl(url)
    const tasks = taskStorage.getTasks()
    const index = tasks.findIndex(t => (t.id || t._id) === id)
    
    if (index === -1) return { data: null, error: { status: 404, message: 'Task not found' } }
    
    const updatedTask = { 
      ...tasks[index], 
      ...data, 
      updatedAt: new Date().toISOString() 
    } as Task
    
    taskStorage.saveTasks(tasks.map((t, i) => i === index ? updatedTask : t))
    return { data: updatedTask as T, error: null }
  },

  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    await delay(150, 400)
    if (!url.includes('/tasks/')) return { data: null, error: { status: 404, message: 'Endpoint not found' } }
    
    const id = getIdFromUrl(url)
    const tasks = taskStorage.getTasks()
    if (!tasks.some(t => (t.id || t._id) === id)) return { data: null, error: { status: 404, message: 'Task not found' } }
    
    taskStorage.saveTasks(tasks.filter(t => (t.id || t._id) !== id))
    return { data: { success: true } as T, error: null }
  }
}

export default api
