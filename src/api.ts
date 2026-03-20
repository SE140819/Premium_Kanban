import { notify } from './utils/notification'

export interface Task {
  id?: string | number
  _id?: string | number
  title: string
  description?: string
  columnId: string
  priority?: string
  deadline?: string
  [key: string]: any
}

// Simulating a backend API using LocalStorage to fix CrudCrud expiration issues
const getStoredTasks = (): Task[] => JSON.parse(localStorage.getItem('kanban_tasks') || '[]')
const saveTasks = (tasks: Task[]): void => localStorage.setItem('kanban_tasks', JSON.stringify(tasks))

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const api = {
  get: async (url: string) => {
    await delay(300) // Simulate network latency
    if (url === '/tasks') {
      return { data: getStoredTasks() }
    }
    return { data: null }
  },
  post: async (url: string, data: Partial<Task>) => {
    await delay(300)
    if (url === '/tasks') {
      const tasks = getStoredTasks()
      const newTask: Task = { ...data, _id: Date.now().toString() } as Task // Mock MongoDB _id
      tasks.push(newTask)
      saveTasks(tasks)
      return { data: newTask }
    }
    throw new Error('Not found')
  },
  put: async (url: string, data: Partial<Task>) => {
    await delay(300)
    if (url.startsWith('/tasks/')) {
      const id = url.split('/').pop()
      const tasks = getStoredTasks()
      const index = tasks.findIndex(t => String(t._id || t.id) === String(id))
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...data } as Task
        saveTasks(tasks)
        return { data: tasks[index] }
      }
      const error: any = new Error('Task not found')
      error.response = { data: { message: 'Task not found' } }
      throw error
    }    
    throw new Error('Not found')
  },
  delete: async (url: string) => {
    await delay(300)
    if (url.startsWith('/tasks/')) {
      const id = url.split('/').pop()
      let tasks = getStoredTasks()
      tasks = tasks.filter(t => String(t._id || t.id) !== String(id))
      saveTasks(tasks)
      return { data: { success: true } }
    }
    throw new Error('Not found')
  },
  interceptors: {
    response: {
      use: () => {}
    }
  }
}

export default api
