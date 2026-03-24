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
  avatar?: string;
  labels?: string[];
  type?: string;
}

export type TaskCreateInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
export type TaskUpdateInput = Partial<Omit<Task, 'id' | 'createdAt'>>;
