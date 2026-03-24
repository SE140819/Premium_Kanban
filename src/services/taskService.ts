import { taskApi } from '@/api/taskApi'
import type { Task, TaskCreateInput, TaskUpdateInput } from '@/types/task'

export const taskService = {
  /** Validate and fetch all tasks */
  async getAllTasks(): Promise<Task[]> {
    const { data, error } = await taskApi.getTasks()
    if (error || !data) {
      throw new Error(error?.message || 'Failed to fetch tasks')
    }
    return data
  },

  /** Validate and create a new task */
  async createNewTask(input: TaskCreateInput): Promise<Task> {
    if (!input.title?.trim()) {
      throw new Error('Task title cannot be empty')
    }

    const { data, error } = await taskApi.createTask(input)
    if (error || !data) {
      throw new Error(error?.message || 'Failed to create task')
    }
    return data
  },

  /** Validate and update a task */
  async updateExistingTask(id: string, input: TaskUpdateInput): Promise<Task> {
    if (input.title !== undefined && !input.title.trim()) {
      throw new Error('Task title cannot be empty')
    }

    const { data, error } = await taskApi.updateTask(id, input)
    if (error || !data) {
      throw new Error(error?.message || 'Failed to update task')
    }
    return data
  },

  /** Validate and delete a task */
  async deleteExistingTask(id: string): Promise<void> {
    const { error } = await taskApi.deleteTask(id)
    if (error) {
      throw new Error(error.message || 'Failed to delete task')
    }
  }
}
