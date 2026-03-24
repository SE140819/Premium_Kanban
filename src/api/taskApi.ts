import api from './index'
import { API_ENDPOINTS } from './endpoints'
import type { Task, ApiResponse } from '@/types/task'

export const taskApi = {
  getTasks: async (): Promise<ApiResponse<Task[]>> => {
    return await api.get<Task[]>(API_ENDPOINTS.tasks.list)
  },
  
  createTask: async (task: Partial<Task>): Promise<ApiResponse<Task>> => {
    return await api.post<Task>(API_ENDPOINTS.tasks.create, task)
  },
  
  updateTask: async (id: string | number, task: Partial<Task>): Promise<ApiResponse<Task>> => {
    return await api.put<Task>(API_ENDPOINTS.tasks.update(id), task)
  },
  
  deleteTask: async (id: string | number): Promise<ApiResponse<{ success: boolean }>> => {
    return await api.delete<{ success: boolean }>(API_ENDPOINTS.tasks.delete(id))
  }
}
