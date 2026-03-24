import type { Task } from './task'

export type SyncEventType =
  | 'TASK_ADDED'
  | 'TASK_UPDATED'
  | 'TASK_DELETED'
  | 'TASK_MOVED'
  | 'PING'
  | 'PONG'

export type SyncEventPayload = 
  | { columnId: string; task: Task }
  | { taskId: string; updateData: Partial<Task> }
  | { taskId: string }
  | { fromColId: string; toColId: string; taskId: string; newIndex: number }
  | any // Fallback for other types

export interface SyncEvent {
  type: SyncEventType
  payload?: SyncEventPayload
  tabId: string
  timestamp: number
}
