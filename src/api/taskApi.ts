import api from './index'
import { API_ENDPOINTS } from './endpoints'
import type { Task, TaskCreateInput, TaskUpdateInput } from '@/types/task'
import type { ApiResponse } from '@/types/api'

export const taskApi = {
  getTasks: async (): Promise<ApiResponse<Task[]>> => {
    return api.get<Task[]>(API_ENDPOINTS.tasks.list)
  },

  createTask: async (task: TaskCreateInput): Promise<ApiResponse<Task>> => {
    return api.post<Task>(API_ENDPOINTS.tasks.create, task)
  },

  updateTask: async (id: string, task: TaskUpdateInput): Promise<ApiResponse<Task>> => {
    return api.put<Task>(API_ENDPOINTS.tasks.update(id), task)
  },

  deleteTask: async (id: string): Promise<ApiResponse<any>> => {
    return api.delete<any>(API_ENDPOINTS.tasks.delete(id))
  }
}
