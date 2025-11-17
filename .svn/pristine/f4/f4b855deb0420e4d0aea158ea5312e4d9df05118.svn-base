// 全局类型定义

// 通用接口响应格式
declare interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
  success: boolean
}

// 分页参数
declare interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

// 分页响应
declare interface PaginationResult<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 通用列表查询参数
declare interface ListParams extends Partial<PaginationParams> {
  [key: string]: any
}

// 通用选项类型
declare interface Option {
  label: string
  value: any
  disabled?: boolean
  children?: Option[]
  [key: string]: any
}

// 通用键值对
declare type Dictionary<T = any> = Record<string, T>

// 通用树结构
declare interface TreeNode {
  id: string | number
  label: string
  children?: TreeNode[]
  parentId?: string | number
  [key: string]: any
}

// 通用时间范围
declare interface TimeRange {
  startTime: string | Date
  endTime: string | Date
}

// 金额相关
declare interface MoneyAmount {
  amount: number
  currency: string
  formatted?: string
}

// 文件上传相关
declare interface UploadFile {
  uid: string
  name: string
  url?: string
  status: 'uploading' | 'done' | 'error' | 'removed'
  size: number
  type: string
  percent?: number
  response?: any
  [key: string]: any
}

// 成本管理平台特有类型

// 成本项目
declare interface CostItem {
  id: number | string
  name: string
  amount: number
  category: string
  date: string
  description?: string
  department?: string
  creator?: string
  status?: 'approved' | 'pending' | 'rejected'
  [key: string]: any
}

// 预算项目
declare interface BudgetItem {
  id: number | string
  name: string
  amount: number
  usedAmount: number
  remainAmount: number
  startDate: string
  endDate: string
  category: string
  description?: string
  department?: string
  status?: 'active' | 'completed' | 'exceeded'
  [key: string]: any
}

// 成本类别
declare interface CostCategory {
  id: number | string
  name: string
  code: string
  description?: string
  parentId?: number | string
  children?: CostCategory[]
  [key: string]: any
}
