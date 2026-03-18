import { notify } from './utils/notification'

// Simulating a backend API using LocalStorage to fix CrudCrud expiration issues
const getStoredTasks = () => JSON.parse(localStorage.getItem('kanban_tasks') || '[]')
const saveTasks = (tasks) => localStorage.setItem('kanban_tasks', JSON.stringify(tasks))

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const api = {
  get: async (url) => {
    await delay(300) // Simulate network latency
    if (url === '/tasks') {
      return { data: getStoredTasks() }
    }
    return { data: null }
  },
  post: async (url, data) => {
    await delay(300)
    if (url === '/tasks') {
      const tasks = getStoredTasks()
      const newTask = { ...data, _id: Date.now().toString() } // Mock MongoDB _id
      tasks.push(newTask)
      saveTasks(tasks)
      return { data: newTask }
    }
  },
  put: async (url, data) => {
    await delay(300)
    if (url.startsWith('/tasks/')) {
      const id = url.split('/').pop()
      const tasks = getStoredTasks()
      const index = tasks.findIndex(t => (t._id || t.id) === id)
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...data }
        saveTasks(tasks)
        return { data: tasks[index] }
      }
      const error = new Error('Task not found')
      error.response = { data: { message: 'Task not found' } }
      throw error
    }
  },
  delete: async (url) => {
    await delay(300)
    if (url.startsWith('/tasks/')) {
      const id = url.split('/').pop()
      let tasks = getStoredTasks()
      tasks = tasks.filter(t => (t._id || t.id) !== id)
      saveTasks(tasks)
      return { data: { success: true } }
    }
  }
}

// Provide generic interceptor stubs to prevent store from crashing
api.interceptors = {
  response: {
    use: () => {}
  }
}

export default api
