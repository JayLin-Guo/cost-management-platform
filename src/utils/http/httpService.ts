import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { loadingManager } from './loadingManager'
import { axiosCanceler } from './requestCancel'
import type { ApiResponse, CreateAxiosOptions, ExtendAxiosRequestConfig, RequestOptions } from './types'
import router from '../../router'
import { useUserStore } from '../../stores/user'
import { HttpStatusMessages } from './types'

/**
 * HTTP 服务类
 */
export class HttpService {
  // axios实例
  private instance: AxiosInstance
  
  // 默认配置
  private readonly options: CreateAxiosOptions

  constructor(options: CreateAxiosOptions) {
    this.options = options
    this.instance = axios.create(options)
    this.setupInterceptors()
  }

  /**
   * 获取axios实例
   */
  getAxios(): AxiosInstance {
    return this.instance
  }

  /**
   * 获取请求选项
   */
  getOptions(): CreateAxiosOptions {
    return this.options
  }

  /**
   * 设置拦截器
   */
  private setupInterceptors() {
    // 获取默认配置
    const { requestOptions } = this.options
    
    // 创建实例
    const axiosInstance = this.instance
    
    // 请求拦截器
    axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 确保requestOptions字段存在
        (config as any).requestOptions = Object.assign({}, requestOptions, (config as any).requestOptions)
        
        // 添加取消令牌
        axiosCanceler.addPending(config)
        
        // 处理token
        // this.handleToken(config as ExtendAxiosRequestConfig)
        
        // 处理Loading
        if ((config as any).requestOptions.showLoading) {
          loadingManager.show()
        }
        
        // 确保headers存在
        config.headers = config.headers || {}
        
        // 添加时间戳
        config.headers['X-Timestamp'] = Date.now()
        
        // 附加环境信息
        config.headers['X-Client-Version'] = import.meta.env.VITE_APP_VERSION || '1.0.0'
        
        return config
      },
      (error) => {
        loadingManager.hide()
        return Promise.reject(error)
      }
    )
    
    // 响应拦截器
    axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
       
        // 处理响应数据
        return this.handleResponse(response)
      },
      (error) => {
        // 处理错误
        return this.handleError(error)
      }
    )
  }

  /**
   * 处理认证token
   */
  private handleToken(config: ExtendAxiosRequestConfig) {
    const { withToken = true } = config.requestOptions || {}
    
    if (withToken) {
      const userStore = useUserStore()
      const token = userStore.token
      
      if (token) {
        // 确保headers存在
        config.headers = config.headers || {}
        
        // 设置认证头
        const tokenPrefix = this.options.authScheme ? `${this.options.authScheme} ` : 'Bearer '
        config.headers.Authorization = `${tokenPrefix}${token}`
      }
    }
  }

  /**
   * 处理响应
   */
  private handleResponse(response: AxiosResponse): any {
    // 从请求队列中移除
    axiosCanceler.removePending(response.config)
    
    // 处理loading
    const { requestOptions } = response.config as any
    if (requestOptions?.showLoading) {
      loadingManager.hide()
    }
    
    // 如果是文件下载
    if (response.request.responseType === 'blob') {
      return response
    }
    
    // 获取响应数据
    const res = response.data as ApiResponse
    
    // 业务成功判断
    if (res.code === 200 || res.success) {
      if (requestOptions?.showSuccessMsg && requestOptions?.successMsg) {
        ElMessage.success(requestOptions.successMsg || res.message || '操作成功')
      }
      return res
    }
    
    // 业务失败处理
    if (requestOptions?.showErrorMsg) {
      ElMessage.error(requestOptions.errorMsg || res.message || '操作失败')
    }
    
    // 特殊错误码处理
    this.handleErrorCode(res.code)
    
    return Promise.reject(res)
  }

  /**
   * 处理错误
   */
  private handleError(error: any) {
    // 取消请求的处理
    if (axios.isCancel(error)) {
      console.warn('请求被取消：', error.message)
      return Promise.reject(error)
    }
    
    // 关闭loading
    loadingManager.hide()
    
    // 从请求队列中移除
    const config = error.config
    if (config) {
      axiosCanceler.removePending(config)
    }
    
    // 错误处理
    const { requestOptions } = config || {} as any
    
    // 获取错误消息
    let message = '网络连接异常，请检查网络设置'
    
    if (error.response) {
      message = this.getErrorMessage(error.response.status)
      
      // 处理401未授权状态
      if (error.response.status === 401) {
        this.handleUnauthorized()
      }
    } else if (error.message.includes('timeout')) {
      message = '请求超时，请稍后再试'
    } else if (error.message.includes('Network Error')) {
      message = '网络异常，请检查您的网络连接'
    }
    
    // 显示错误消息
    if (requestOptions?.showErrorMsg) {
      ElMessage.error(message)
    }
    
    return Promise.reject(error)
  }

  /**
   * 处理特定错误码
   */
  private handleErrorCode(code: number): void {
    switch (code) {
      // 未授权
      case 401:
        this.handleUnauthorized()
        break
      // 禁止访问
      case 403:
        router.push('/403')
        break
      // 找不到资源
      case 404:
        router.push('/404')
        break
    }
  }

  /**
   * 处理未授权状态
   */
  private handleUnauthorized(): void {
    const userStore = useUserStore()
    
    ElMessageBox.confirm(
      '您的登录状态已过期，请重新登录',
      '登录过期',
      {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      userStore.logout()
      axiosCanceler.clearPending() // 清除所有请求
      router.push({
        path: '/login',
        query: { redirect: router.currentRoute.value.fullPath }
      })
    }).catch(() => {
      // 用户取消操作
    })
  }

  /**
   * 获取HTTP错误信息
   */
  private getErrorMessage(status: number): string {
    return HttpStatusMessages[status] || `HTTP错误(${status})`
  }

  /**
   * 发送GET请求
   */
  get<T = any>(
    url: string, 
    params?: any, 
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
      requestOptions: options
    })
  }

  /**
   * 发送POST请求
   */
  post<T = any>(
    url: string, 
    data?: any, 
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      requestOptions: options
    })
  }

  /**
   * 发送PUT请求
   */
  put<T = any>(
    url: string, 
    data?: any, 
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      requestOptions: options
    })
  }

  /**
   * 发送DELETE请求
   */
  delete<T = any>(
    url: string, 
    params?: any, 
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      params,
      requestOptions: options
    })
  }

  /**
   * 上传文件
   */
  upload<T = any>(
    url: string,
    file: File | FormData,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    
    if (file instanceof File) {
      formData.append('file', file)
    } else {
      // 已经是FormData，直接使用
      return this.post<T>(url, file, options)
    }
    
    return this.post<T>(url, formData, {
      ...options,
      showLoading: options?.showLoading ?? true
    })
  }

  /**
   * 下载文件
   */
  download(
    url: string,
    params?: any,
    fileName?: string,
    options?: RequestOptions
  ): Promise<void> {
    return this.request({
      method: 'GET',
      url,
      params,
      responseType: 'blob',
      requestOptions: {
        showLoading: true,
        ...options
      }
    }).then((res: any) => {
      // 创建临时链接
      const blob = new Blob([res.data])
      const downloadUrl = URL.createObjectURL(blob)
      
      // 创建临时a标签并设置下载属性
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName || this.getFileNameFromHeaders(res.headers) || 'download'
      link.click()
      
      // 清理临时对象URL
      URL.revokeObjectURL(downloadUrl)
    })
  }

  /**
   * 从响应头中获取文件名
   */
  private getFileNameFromHeaders(headers: any): string | null {
    // 尝试从Content-Disposition头中获取文件名
    const contentDisposition = headers?.['content-disposition']
    if (contentDisposition) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      const matches = filenameRegex.exec(contentDisposition)
      if (matches && matches[1]) {
        return matches[1].replace(/['"]/g, '')
      }
    }
    return null
  }

  /**
   * 通用请求方法
   */
  request<T = any>(config: ExtendAxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.request(config) as Promise<ApiResponse<T>>
  }
} 