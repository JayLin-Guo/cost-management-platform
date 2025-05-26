import type { AxiosRequestConfig } from 'axios'
import type { ExtendAxiosRequestConfig } from './types'

/**
 * 请求取消管理类
 */
export class AxiosCanceler {
  // 存储每个请求的标识和取消函数
  private pendingMap = new Map<string, AbortController>()

  /**
   * 添加请求到pending队列
   * @param config 请求配置
   */
  addPending(config: AxiosRequestConfig): void {
    // 如果配置了忽略取消则跳过
    if (this.checkIgnoreCancelToken(config)) {
      return
    }
    
    // 生成请求标识
    const requestKey = this.generateRequestKey(config)
    
    // 如果存在相同标识的请求，先取消前一个
    if (this.pendingMap.has(requestKey)) {
      const controller = this.pendingMap.get(requestKey)
      controller && controller.abort()
      this.pendingMap.delete(requestKey)
    }
    
    // 创建新的AbortController，添加到Map中
    const controller = new AbortController()
    config.signal = controller.signal
    this.pendingMap.set(requestKey, controller)
  }

  /**
   * 移除请求从pending队列
   * @param config 请求配置
   */
  removePending(config: AxiosRequestConfig): void {
    // 如果配置了忽略取消则跳过
    if (this.checkIgnoreCancelToken(config)) {
      return
    }
    
    // 生成请求标识
    const requestKey = this.generateRequestKey(config)
    
    // 从Map中移除
    if (this.pendingMap.has(requestKey)) {
      this.pendingMap.delete(requestKey)
    }
  }

  /**
   * 清除所有pending中的请求
   */
  clearPending(): void {
    this.pendingMap.forEach(controller => {
      controller && controller.abort()
    })
    this.pendingMap.clear()
  }

  /**
   * 重置
   */
  reset(): void {
    this.pendingMap.clear()
  }

  /**
   * 生成请求唯一标识
   * @param config 请求配置
   */
  private generateRequestKey(config: AxiosRequestConfig): string {
    const { url, method, params, data } = config
    return [url, method, JSON.stringify(params), JSON.stringify(data)].join('&')
  }

  /**
   * 检查是否配置了忽略取消请求
   * @param config 请求配置
   */
  private checkIgnoreCancelToken(config: AxiosRequestConfig): boolean {
    // 转换为扩展的请求配置类型
    const extendConfig = config as ExtendAxiosRequestConfig
    const ignoreCancelToken = extendConfig?.requestOptions?.ignoreCancelToken
    
    return !!(
      ignoreCancelToken || 
      (config.headers && config.headers['ignoreCancelToken'])
    )
  }
}

// 导出单例
export const axiosCanceler = new AxiosCanceler() 