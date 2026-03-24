import type { Task } from '@/types/task'

export type SyncEventType =
  | 'TASK_ADDED'
  | 'TASK_UPDATED'
  | 'TASK_DELETED'
  | 'TASK_MOVED'
  | 'PING'
  | 'PONG'

export interface SyncEvent {
  type: SyncEventType
  payload?: any
  tabId: string
  timestamp: number
}

// Unique ID for this tab instance
export const TAB_ID = Math.random().toString(36).slice(2)

const CHANNEL_NAME = 'kanban-sync'
let channel: BroadcastChannel | null = null
const listeners: Array<(event: SyncEvent) => void> = []

export function initSync(): () => void {
  channel = new BroadcastChannel(CHANNEL_NAME)

  channel.onmessage = (e: MessageEvent<SyncEvent>) => {
    // Ignore own messages
    if (e.data.tabId === TAB_ID) return
    listeners.forEach(fn => fn(e.data))
  }

  // Broadcast cleanup when this tab closes
  const cleanup = () => {
    channel?.close()
    channel = null
  }
  window.addEventListener('beforeunload', cleanup)
  return cleanup
}

export function broadcast(type: SyncEventType, payload?: any): void {
  if (!channel) return
  const event: SyncEvent = { type, payload, tabId: TAB_ID, timestamp: Date.now() }
  channel.postMessage(event)
}

export function onSync(handler: (event: SyncEvent) => void): () => void {
  listeners.push(handler)
  return () => {
    const idx = listeners.indexOf(handler)
    if (idx !== -1) listeners.splice(idx, 1)
  }
}

/** Ping other tabs and collect how many reply — returns count within timeout */
export function getActiveTabs(timeoutMs = 300): Promise<number> {
  return new Promise(resolve => {
    if (!channel) return resolve(0)
    let count = 0
    const pongHandler = (e: MessageEvent<SyncEvent>) => {
      if (e.data.type === 'PONG' && e.data.tabId !== TAB_ID) count++
    }
    channel.addEventListener('message', pongHandler)
    broadcast('PING')
    setTimeout(() => {
      channel?.removeEventListener('message', pongHandler)
      resolve(count)
    }, timeoutMs)
  })
}

/** Reply to PING messages from other tabs */
export function setupPongReply(): () => void {
  return onSync(event => {
    if (event.type === 'PING') broadcast('PONG')
  })
}
