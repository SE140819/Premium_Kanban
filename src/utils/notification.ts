import { ElNotification } from 'element-plus'

type NotifyType = 'success' | 'error' | 'info' | 'warning'

/**
 * Unified notification utility using Element Plus
 */
const notifyFn = (message: string, type: NotifyType = 'info', title?: string) => {
  const config = {
    success: { title: 'Success', duration: 3000 },
    error: { title: 'Error', duration: 4000 },
    info: { title: 'Info', duration: 3000 },
    warning: { title: 'Warning', duration: 3500 }
  }

  ElNotification({
    title: title || config[type].title,
    message,
    type,
    duration: config[type].duration,
    position: 'top-right'
  })
}

export const notify = Object.assign(notifyFn, {
  success: (m: string, t?: string) => notifyFn(m, 'success', t),
  error: (m: string, t?: string) => notifyFn(m, 'error', t),
  info: (m: string, t?: string) => notifyFn(m, 'info', t),
  warning: (m: string, t?: string) => notifyFn(m, 'warning', t)
})
