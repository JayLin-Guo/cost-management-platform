import type { AxiosRequestConfig, AxiosResponse } from 'axios'

/**
 * 接口响应格式
 */
export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
  success: boolean
}

/**
 * 自定义请求配置
 */
export interface RequestOptions {
  // 是否显示loading
  showLoading?: boolean
  // 是否展示错误信息
  showErrorMsg?: boolean
  // 是否展示成功信息
  showSuccessMsg?: boolean
  // 错误信息
  errorMsg?: string
  // 成功信息
  successMsg?: string
  // 是否需要token
  withToken?: boolean
  // 重试次数
  retryCount?: number
  // 重试延迟(ms)
  retryDelay?: number
  // 是否忽略取消请求检查
  ignoreCancelToken?: boolean
  // 是否将请求参数拼接到url
  joinParamsToUrl?: boolean
}

/**
 * 扩展的请求配置
 */
export interface CreateAxiosOptions extends AxiosRequestConfig {
  // 认证方案，例如 Bearer
  authScheme?: string
  // 接口基础路径
  apiUrl?: string
  // 接口超时时间
  timeout?: number
  // 默认请求选项
  requestOptions?: RequestOptions
}

/**
 * 扩展的请求配置
 */
export interface ExtendAxiosRequestConfig extends AxiosRequestConfig {
  // 自定义选项
  requestOptions?: RequestOptions
}

/**
 * 扩展的响应类型
 */
export type ApiResponseData<T = any> = ApiResponse<T> | AxiosResponse<ApiResponse<T>>

/**
 * HTTP错误码与消息映射
 */
export const HttpStatusMessages: Record<number, string> = {
  400: '请求参数错误',
  401: '未授权，请重新登录',
  403: '您没有权限访问此资源',
  404: '请求的资源不存在',
  405: '请求方法不允许',
  408: '请求超时',
  500: '服务器内部错误',
  501: '服务未实现',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
  505: 'HTTP版本不支持',
}
