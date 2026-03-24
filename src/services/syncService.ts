import type { SyncEvent, SyncEventType } from '@/types/sync'

export const TAB_ID = Math.random().toString(36).slice(2)
const CHANNEL_NAME = 'kanban-sync'

let channel: BroadcastChannel | null = null
const listeners: ((event: SyncEvent) => void)[] = []

/**
 * Optimized Synchronization Service
 */
export const syncService = {
  init(): () => void {
    channel = new BroadcastChannel(CHANNEL_NAME)
    channel.onmessage = (e: MessageEvent<SyncEvent>) => {
      if (e.data.tabId !== TAB_ID) listeners.forEach(fn => fn(e.data))
    }
    
    const cleanup = () => { channel?.close(); channel = null }
    window.addEventListener('beforeunload', cleanup)
    this.setupPongReply()
    return cleanup
  },

  broadcast(type: SyncEventType, payload?: any): void {
    channel?.postMessage({ type, payload, tabId: TAB_ID, timestamp: Date.now() })
  },

  onSync(handler: (event: SyncEvent) => void): () => void {
    listeners.push(handler)
    return () => {
      const idx = listeners.indexOf(handler)
      if (idx !== -1) listeners.splice(idx, 1)
    }
  },

  async getActiveTabs(timeout = 300): Promise<number> {
    if (!channel) return 0
    let count = 0
    const handler = (e: MessageEvent<SyncEvent>) => {
      if (e.data.type === 'PONG' && e.data.tabId !== TAB_ID) count++
    }
    channel.addEventListener('message', handler)
    this.broadcast('PING')
    return new Promise(resolve => {
      setTimeout(() => {
        channel?.removeEventListener('message', handler)
        resolve(count)
      }, timeout)
    })
  },

  setupPongReply() {
    this.onSync(e => e.type === 'PING' && this.broadcast('PONG'))
  }
}
