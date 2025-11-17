import { HttpService } from './httpService'
import type { CreateAxiosOptions, ApiResponse, RequestOptions } from './types'
import { axiosCanceler } from './requestCancel'

// 创建默认配置
const defaultConfig: CreateAxiosOptions = {
  // 接口超时时间
  timeout: 30000,
  // 基础接口地址
  baseURL: import.meta.env.VITE_APP_API_BASE_URL as string,
  // HTTP头
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
  // 认证方案
  authScheme: 'Bearer',
  // 默认请求选项
  requestOptions: {
    // 是否显示loading
    showLoading: false,
    // 是否显示错误消息
    showErrorMsg: true,
    // 是否显示成功消息
    showSuccessMsg: false,
    // 是否需要带token
    withToken: true,
    // 重试次数
    retryCount: 0,
    // 重试延迟
    retryDelay: 1000,
    // 忽略取消令牌
    ignoreCancelToken: false,
  },
}

// 创建HTTP服务实例
const httpService = new HttpService(defaultConfig)

// 导出方法
export const request = httpService.getAxios()
export const clearPendingRequests = axiosCanceler.clearPending.bind(axiosCanceler)

// GET请求
export function get<T = any>(
  url: string,
  params?: any,
  options?: RequestOptions,
): Promise<ApiResponse<T>> {
  return httpService.get(url, params, options)
}

// POST请求
export function post<T = any>(
  url: string,
  data?: any,
  options?: RequestOptions,
): Promise<ApiResponse<T>> {
  return httpService.post(url, data, options)
}

// PUT请求
export function put<T = any>(
  url: string,
  data?: any,
  options?: RequestOptions,
): Promise<ApiResponse<T>> {
  return httpService.put(url, data, options)
}

// DELETE请求
export function del<T = any>(
  url: string,
  params?: any,
  options?: RequestOptions,
): Promise<ApiResponse<T>> {
  return httpService.delete(url, params, options)
}

// 上传文件
export function upload<T = any>(
  url: string,
  file: File | FormData,
  options?: RequestOptions,
): Promise<ApiResponse<T>> {
  return httpService.upload(url, file, options)
}

// 下载文件
export function download(
  url: string,
  params?: any,
  fileName?: string,
  options?: RequestOptions,
): Promise<void> {
  return httpService.download(url, params, fileName, options)
}

// 导出HTTP服务实例和类型
export { httpService, HttpService }
export type { ApiResponse, RequestOptions }

// 默认导出
export default httpService
