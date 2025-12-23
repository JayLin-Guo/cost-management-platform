/**
 * 审核步骤模板管理相关 API
 */

import request from '@/utils/request'

/**
 * 审核步骤类型枚举
 */
export enum ReviewStepType {
  /** 初审 */
  INITIAL_REVIEW = 'INITIAL_REVIEW',
  /** 复审 */
  SECONDARY_REVIEW = 'SECONDARY_REVIEW',
  /** 终审 */
  FINAL_REVIEW = 'FINAL_REVIEW',
  /** 会签 */
  COUNTERSIGN = 'COUNTERSIGN',
  /** 抄送 */
  CC = 'CC',
  /** 自定义 */
  CUSTOM = 'CUSTOM',
}

/**
 * 审核步骤类型标签映射
 */
export const REVIEW_STEP_TYPE_LABELS: Record<ReviewStepType, string> = {
  [ReviewStepType.INITIAL_REVIEW]: '初审',
  [ReviewStepType.SECONDARY_REVIEW]: '复审',
  [ReviewStepType.FINAL_REVIEW]: '终审',
  [ReviewStepType.COUNTERSIGN]: '会签',
  [ReviewStepType.CC]: '抄送',
  [ReviewStepType.CUSTOM]: '自定义',
}

/**
 * 创建审核步骤模板 DTO
 */
export interface CreateReviewStepTemplateDto {
  name: string
  code: string
  stepType: ReviewStepType
  description?: string
  estimatedHours?: number
  isActive?: boolean
  roleCategoryIds?: string[]
}

/**
 * 更新审核步骤模板 DTO
 */
export interface UpdateReviewStepTemplateDto {
  name?: string
  code?: string
  stepType?: ReviewStepType
  description?: string
  estimatedHours?: number
  isActive?: boolean
  roleCategoryIds?: string[]
}

/**
 * 审核步骤模板分页查询 DTO
 */
export interface ReviewStepTemplatePaginationDto {
  pageNum?: number
  pageSize?: number
  keyword?: string
  stepType?: ReviewStepType
  isActive?: boolean
}

/**
 * 角色分类实体（简化版本）
 */
export interface RoleCategoryEntity {
  id: string
  code: string
  name: string
}

/**
 * 步骤角色关联实体
 */
export interface StepRoleEntity {
  id: string
  reviewStepTemplateId: string
  roleCategoryId: string
  createdAt: string
  updatedAt: string
  roleCategory: RoleCategoryEntity
}

/**
 * 统计信息
 */
export interface CountInfo {
  reviewSteps: number
  stepRoles: number
}

/**
 * 审核步骤模板实体
 */
export interface ReviewStepTemplateEntity {
  id: string
  name: string
  code: string
  stepType: ReviewStepType
  description?: string
  estimatedHours?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  stepRoles: StepRoleEntity[]
  _count: CountInfo
}

/**
 * 创建审核步骤模板
 */
export function createReviewStepTemplate(data: CreateReviewStepTemplateDto) {
  return request.post('/review-step-template', data)
}

/**
 * 获取审核步骤模板列表（支持分页和不分页）
 */
export function getReviewStepTemplateList(params?: ReviewStepTemplatePaginationDto) {
  return request.get('/review-step-template', params)
}

/**
 * 获取审核步骤模板详情
 */
export function getReviewStepTemplateDetail(id: string) {
  return request.get(`/review-step-template/${id}`)
}

/**
 * 更新审核步骤模板
 */
export function updateReviewStepTemplate(id: string, data: UpdateReviewStepTemplateDto) {
  return request.post(`/review-step-template/update/${id}`, data)
}

/**
 * 删除审核步骤模板
 */
export function deleteReviewStepTemplate(id: string) {
  return request.delete(`/review-step-template/${id}`)
}
