import { ElNotification } from 'element-plus'

const createNotify = (type: 'success' | 'error' | 'info' | 'warning', title: string, duration: number) => 
  (message: string, customTitle?: string) => ElNotification({
    title: customTitle || title,
    message,
    type,
    duration,
    position: 'top-right'
  })

export const notify = {
  success: createNotify('success', 'Success', 3000),
  error:   createNotify('error',   'Error',   4500),
  info:    createNotify('info',    'Info',    3000),
  warning: createNotify('warning', 'Warning', 3500)
}
