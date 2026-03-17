import axios from 'axios'
import { notify } from './utils/notification'

const BASE_URL = 'https://crudcrud.com/api/daffc345732d4efd82dfa4394c54aecd'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})
api.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred'
    notify.error(message, 'API Error')
    return Promise.reject(error)
  }
)

export default api
