import { ElNotification } from 'element-plus'

type NotifyType = 'success' | 'error' | 'info' | 'warning'

interface NotifyConfig {
  title: string
  duration: number
}

const NOTIFY_CONFIG: Record<NotifyType, NotifyConfig> = {
  success: { title: 'Success', duration: 3000 },
  error: { title: 'Error', duration: 4500 },
  info: { title: 'Info', duration: 3000 },
  warning: { title: 'Warning', duration: 3500 }
}

const show = (message: string, type: NotifyType = 'info', title?: string) => {
  const { title: defaultTitle, duration } = NOTIFY_CONFIG[type]

  ElNotification({
    title: title || defaultTitle,
    message,
    type,
    duration,
    position: 'top-right'
  })
}

export const notify = {
  success: (message: string, title?: string) => show(message, 'success', title),
  error: (message: string, title?: string) => show(message, 'error', title),
  info: (message: string, title?: string) => show(message, 'info', title),
  warning: (message: string, title?: string) => show(message, 'warning', title)
}
