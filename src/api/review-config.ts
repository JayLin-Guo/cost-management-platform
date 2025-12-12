/**
 * 审核配置管理相关 API
 */

import request from '@/utils/request'

/**
 * 审核状态枚举
 */
export enum ReviewStatus {
  /** 待审核 */
  PENDING = 'PENDING',
  /** 审核中 */
  IN_REVIEW = 'IN_REVIEW',
  /** 已通过 */
  APPROVED = 'APPROVED',
  /** 已拒绝 */
  REJECTED = 'REJECTED',
  /** 已撤回 */
  WITHDRAWN = 'WITHDRAWN',
}

/**
 * 审核状态标签映射
 */
export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  [ReviewStatus.PENDING]: '待审核',
  [ReviewStatus.IN_REVIEW]: '审核中',
  [ReviewStatus.APPROVED]: '已通过',
  [ReviewStatus.REJECTED]: '已拒绝',
  [ReviewStatus.WITHDRAWN]: '已撤回',
}

/**
 * 创建审核配置 DTO
 */
export interface CreateReviewConfigDto {
  name: string
  code: string
  description?: string
  isActive?: boolean
  taskCategoryIds?: string[]
}

/**
 * 更新审核配置 DTO
 */
export interface UpdateReviewConfigDto {
  name?: string
  code?: string
  description?: string
  isActive?: boolean
  taskCategoryIds?: string[]
}

/**
 * 审核配置分页查询 DTO
 */
export interface ReviewConfigPaginationDto {
  pageNum?: number
  pageSize?: number
  keyword?: string
  isActive?: boolean
}

/**
 * 审核配置实体
 */
export interface ReviewConfigEntity {
  id: string
  name: string
  code: string
  description?: string
  isActive: boolean
  taskCategoryIds?: string[]
  taskCategories?: {
    id: string
    name: string
    code: string
  }[]
  createdAt: string
  updatedAt: string
}

/**
 * 创建审核配置
 */
export function createReviewConfig(data: CreateReviewConfigDto) {
  return request.post('/review-config/create', data)
}

/**
 * 获取审核配置列表（支持分页和不分页）
 */
export function getReviewConfigList(params?: ReviewConfigPaginationDto) {
  return request.get('/review-config/list', params)
}

/**
 * 获取审核配置详情
 */
export function getReviewConfigDetail(id: string) {
  return request.get(`/review-config/detail/${id}`)
}

/**
 * 更新审核配置
 */
export function updateReviewConfig(id: string, data: UpdateReviewConfigDto) {
  return request.post(`/review-config/update/${id}`, data)
}

/**
 * 审核步骤配置项
 */
export interface ReviewStepConfigItem {
  reviewStepTemplateId: string
  stepOrder: number
  isRequired?: boolean
}

/**
 * 配置审核步骤 DTO
 */
export interface ConfigureReviewStepsDto {
  steps: ReviewStepConfigItem[]
}

/**
 * 审核步骤配置实体
 */
export interface ReviewStepConfigEntity {
  id: string
  reviewConfigId: string
  reviewStepTemplateId: string
  stepOrder: number
  createdAt: string
  updatedAt: string
  reviewStepTemplate: {
    id: string
    name: string
    code: string
    stepType: string
  }
}

/**
 * 配置审核步骤（覆盖模式）
 */
export function configureReviewSteps(id: string, data: ConfigureReviewStepsDto) {
  return request.post(`/review-config/configure-steps/${id}`, data)
}

/**
 * 获取审核步骤配置
 */
export function getReviewStepsConfig(id: string) {
  return request.get(`/review-config/steps/${id}`)
}
