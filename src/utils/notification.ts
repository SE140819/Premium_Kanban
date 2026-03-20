import { ElNotification } from 'element-plus'

/**
 * Reusable notification utility using Element Plus
 */
export const notify = {
  success(message: string, title: string = 'Success'): void {
    ElNotification({
      title,
      message,
      type: 'success',
      duration: 3000,
      position: 'top-right'
    })
  },

  error(message: string, title: string = 'Error'): void {
    ElNotification({
      title,
      message,
      type: 'error',
      duration: 4000,
      position: 'top-right'
    })
  },

  info(message: string, title: string = 'Info'): void {
    ElNotification({
      title,
      message,
      type: 'info',
      duration: 3000,
      position: 'top-right'
    })
  },

  warning(message: string, title: string = 'Warning'): void {
    ElNotification({
      title,
      message,
      type: 'warning',
      duration: 3500,
      position: 'top-right'
    })
  }
}
