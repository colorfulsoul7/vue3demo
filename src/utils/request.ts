import axios from 'axios'

/**
 * 创建请求示例
 */
const request = axios.create({
  baseURL: '/*',
  headers: { 'Content-Type': 'xxx' },
  timeout: 5000,
})

/**
 * 请求拦截器
 */
request.interceptors.request.use((config) => {
  return config
})

/**
 * 响应拦截器
 */
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    return error
  },
)

export default request
