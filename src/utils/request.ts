/**
 * HTTP请求工具
 * 
 * 企业级HTTP请求封装，支持：
 * - 自动处理token认证
 * - 请求/响应拦截
 * - 统一的错误处理
 * - 取消请求
 * - Loading控制
 * - 文件上传下载
 * - 请求重试
 * - 类型安全
 */

import { httpService, clearPendingRequests } from './http'
import type { ApiResponse, RequestOptions } from './http'

// 导出全部HTTP方法
export * from './http'

// 设置开发环境下的超时时间
if (import.meta.env.MODE === 'development') {
  // 开发环境配置
  httpService.getAxios().defaults.timeout = 60000 // 开发环境超时时间更长
} else if (import.meta.env.MODE === 'production') {
  // 生产环境配置
  httpService.getAxios().defaults.timeout = 30000
}

// 全局请求拦截器 - 可添加项目特定的逻辑
httpService.getAxios().interceptors.request.use(
  (config) => {
    // 在这里可以添加项目特定的请求处理逻辑
    // 例如：特定的Header处理，日志记录等
    
    // 记录API请求（仅在开发环境）
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config)
    }
    
    return config
  },
  undefined // 使用默认的错误处理
)

// 全局响应拦截器 - 可添加项目特定的逻辑
httpService.getAxios().interceptors.response.use(
  (response) => {
    // 在这里可以添加项目特定的响应处理逻辑
    // 例如：特定的业务状态码处理，数据转换等
    
    // 记录API响应（仅在开发环境）
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
    }
    
    return response
  },
  undefined // 使用默认的错误处理
)

// 导出清除所有请求的方法（使用更直观的名称）
export const cancelAllRequests = clearPendingRequests



/**
 * 创建特定模块的API请求器实例
 * @param baseURL 基础URL，用于特定模块的API
 * @param defaultOptions 默认请求选项
 */
export function createApiClient(baseURL: string, defaultOptions: Partial<RequestOptions> = {}) {
  return {
    get<T = any>(url: string, params?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
      const fullUrl = `${baseURL}${url}`
      return httpService.get(fullUrl, params, { ...defaultOptions, ...options })
    },
    
    post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
      const fullUrl = `${baseURL}${url}`
      return httpService.post(fullUrl, data, { ...defaultOptions, ...options })
    },
    
    put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
      const fullUrl = `${baseURL}${url}`
      return httpService.put(fullUrl, data, { ...defaultOptions, ...options })
    },
    
    delete<T = any>(url: string, params?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
      const fullUrl = `${baseURL}${url}`
      return httpService.delete(fullUrl, params, { ...defaultOptions, ...options })
    },
    
    upload<T = any>(url: string, file: File | FormData, options?: RequestOptions): Promise<ApiResponse<T>> {
      const fullUrl = `${baseURL}${url}`
      return httpService.upload(fullUrl, file, { ...defaultOptions, ...options })
    },
    
    download(url: string, params?: any, fileName?: string, options?: RequestOptions): Promise<void> {
      const fullUrl = `${baseURL}${url}`
      return httpService.download(fullUrl, params, fileName, { ...defaultOptions, ...options })
    }
  }
}



// 默认导出
export default httpService 