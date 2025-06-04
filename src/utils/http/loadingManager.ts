import { ElLoading } from 'element-plus'
import type { LoadingInstance } from 'element-plus/lib/components/loading/src/loading'

/**
 * 全局Loading管理类
 */
export class LoadingManager {
  // Loading实例
  private instance: LoadingInstance | null = null

  // Loading计数器，用于处理并发请求
  private counter = 0

  // 默认配置
  private readonly defaultOptions = {
    fullscreen: true,
    lock: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.3)',
  }

  /**
   * 显示Loading
   * @param options Loading配置选项
   */
  show(options?: Record<string, any>): void {
    // 计数器增加
    this.counter++

    // 如果已经存在Loading实例，则不再创建新的
    if (this.counter > 1 && this.instance) {
      return
    }

    // 合并默认配置
    const opt = {
      ...this.defaultOptions,
      ...options,
    }

    // 创建Loading实例
    this.instance = ElLoading.service(opt)
  }

  /**
   * 隐藏Loading
   */
  hide(): void {
    // 计数器减少
    this.counter--

    // 只有当计数器为0时，才真正关闭Loading
    if (this.counter === 0 && this.instance) {
      this.instance.close()
      this.instance = null
    }
  }

  /**
   * 强制关闭所有Loading
   */
  forceClose(): void {
    if (this.instance) {
      this.instance.close()
      this.instance = null
    }
    // 重置计数器
    this.counter = 0
  }
}

// 导出单例
export const loadingManager = new LoadingManager()
