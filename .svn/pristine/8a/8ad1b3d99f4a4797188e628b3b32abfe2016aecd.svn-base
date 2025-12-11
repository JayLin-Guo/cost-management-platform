// 审核人员相关类型定义

export interface ReviewerConfig {
  id: string
  userId: string
  user: {
    id: string
    name: string
    username: string
    email?: string
    phone?: string
    avatar?: string
    isActive: boolean
  }
  departmentId: string
  department: {
    id: string
    name: string
    code: string
  }
  reviewerLevel: ReviewerLevel
  taskCategories: TaskCategory[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateReviewerConfigDto {
  userId: string
  departmentId: string
  reviewerLevel: ReviewerLevel
  taskCategories: TaskCategory[]
  isActive?: boolean
}

export interface UpdateReviewerConfigDto {
  userId?: string
  departmentId?: string
  reviewerLevel?: ReviewerLevel
  taskCategories?: TaskCategory[]
  isActive?: boolean
}

export interface ReviewerConfigQuery {
  departmentId?: string
  reviewerLevel?: ReviewerLevel
  taskCategory?: TaskCategory
  isActive?: boolean
  keyword?: string
}

export enum ReviewerLevel {
  LEVEL_1 = 'LEVEL_1', // 一审
  LEVEL_2 = 'LEVEL_2', // 二审
  LEVEL_3 = 'LEVEL_3', // 三审
}

export enum TaskCategory {
  DRAFTING_CONTROL_PRICE = 'DRAFTING_CONTROL_PRICE', // 拟定控制价
  DRAFTING_PLAN = 'DRAFTING_PLAN', // 拟案
  COUNTERSIGN = 'COUNTERSIGN', // 会签
  OTHER = 'OTHER', // 其他
}

// 审核级别选项
export const REVIEWER_LEVEL_OPTIONS = [
  { label: '一审', value: ReviewerLevel.LEVEL_1, color: 'success' as const },
  { label: '二审', value: ReviewerLevel.LEVEL_2, color: 'warning' as const },
  { label: '三审', value: ReviewerLevel.LEVEL_3, color: 'danger' as const },
] as const

// 任务类型选项
export const TASK_CATEGORY_OPTIONS = [
  { label: '拟定控制价', value: TaskCategory.DRAFTING_CONTROL_PRICE },
  { label: '拟案', value: TaskCategory.DRAFTING_PLAN },
  { label: '会签', value: TaskCategory.COUNTERSIGN },
  { label: '其他', value: TaskCategory.OTHER },
]
