// 工具函数和事件相关的类型定义

// 防抖函数类型
declare type Debounced<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): ReturnType<T> | undefined
  cancel: () => void
}

// 节流函数类型
declare type Throttled<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): ReturnType<T> | undefined
  cancel: () => void
}

// 深层部分类型
declare type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// 可为空类型
declare type Nullable<T> = T | null | undefined

// 可能为Promise的类型
declare type MaybePromise<T> = T | Promise<T>

// 函数类型
declare type Fn<T = any, R = any> = (...args: T[]) => R

// 异步函数类型
declare type AsyncFn<T = any, R = any> = (...args: T[]) => Promise<R>

// 事件类型
declare type EventHandler<E = Event> = (event: E) => void

// 表单验证规则
declare type FormRule = {
  required?: boolean
  message?: string
  trigger?: 'blur' | 'change' | ['blur', 'change']
  min?: number
  max?: number
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url' | 'date'
  pattern?: RegExp
  validator?: (rule: any, value: any, callback: (error?: Error) => void) => void
}

// 表单验证规则数组
declare type FormRules = Record<string, FormRule | FormRule[]>
