import { ElNotification } from 'element-plus'

/**
 * Reusable notification utility using Element Plus
 */
export const notify = {
  success(message, title = 'Success') {
    ElNotification({
      title,
      message,
      type: 'success',
      duration: 3000,
      position: 'top-right'
    })
  },

  error(message, title = 'Error') {
    ElNotification({
      title,
      message,
      type: 'error',
      duration: 4000,
      position: 'top-right'
    })
  },

  info(message, title = 'Info') {
    ElNotification({
      title,
      message,
      type: 'info',
      duration: 3000,
      position: 'top-right'
    })
  },

  warning(message, title = 'Warning') {
    ElNotification({
      title,
      message,
      type: 'warning',
      duration: 3500,
      position: 'top-right'
    })
  }
}
