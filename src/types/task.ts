export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string; // Using string globally, including for UUID
  _id?: string; // Legacy support for Mock MongoDB style
  title: string;
  description?: string;
  columnId: string;
  priority: TaskPriority | string;
  deadline?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export type TaskCreateInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
export type TaskUpdateInput = Partial<Omit<Task, 'id' | 'createdAt'>>;

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}
