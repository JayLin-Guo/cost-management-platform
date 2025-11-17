// 全局类型定义

// 路由元数据类型
export interface RouteMeta {
  title: string
  keepAlive: boolean
  requireAuth: boolean
}

// 用户信息类型
export interface UserInfo {
  id?: number
  username?: string
  nickname?: string
  avatar?: string
  role?: string
  permissions?: string[]
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

// 分页参数类型
export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

// 分页响应类型
export interface PaginationResponse<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
