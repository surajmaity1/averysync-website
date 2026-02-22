import { applicationConfig } from '@/config/app-config'
import axios from 'axios'

const backendAppURL = applicationConfig.backendApplicationURL

export const axiosAPIClient = axios.create({
  baseURL: backendAppURL,
  withCredentials: true,
  timeout: 30000,
})

axiosAPIClient.interceptors.request.use(
  async (config) => {
    config.headers.set('Content-Type', 'application/json')
    return config
  },
  (error) =>
    Promise.reject(error instanceof Error ? error : new Error(String(error))),
)

axiosAPIClient.interceptors.response.use(
  (respone) => respone,
  async (error) => {
    const pathName = window.location.pathname
    if (error.response && error.response.status === 401 && pathName !== '/') {
      window.location.href = '/'
    }
    return Promise.reject(
      error instanceof Error ? error : new Error(String(error)),
    )
  },
)
