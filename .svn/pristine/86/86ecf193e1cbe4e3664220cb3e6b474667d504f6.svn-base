/**
 * 任务相关 API
 */

import { httpService } from '@/utils/request'
import type { ApiResponse } from '@/utils/http'

// 任务相关类型定义
export interface TaskItem {
  id: string
  taskName: string
  projectId: string
  taskCategoryId: string
  taskLeaderId: string
  participantIds?: string[]
  isReviewRequired: boolean
  reviewStageAssignments?: ReviewStageAssignmentDto[]
  description?: string
  attachments?: any
  status: 'pending' | 'in_progress' | 'completed'
  createTime: string
  updateTime: string
}

// 审核步骤分配DTO
export interface ReviewStageAssignmentDto {
  stepConfigId: string
  stepName: string
  reviewerId: string
}

export interface CreateTaskDto {
  taskName: string
  projectId: string
  isReviewRequired?: boolean
  taskCategoryId: string
  taskLeaderId: string
  participantIds?: string[]
  reviewStageAssignments?: ReviewStageAssignmentDto[]
  description?: string
  attachments?: any
}

export interface UpdateTaskDto {
  id: string
  taskName?: string
  description?: string
  attachments?: any
}

export interface TaskPaginationDto {
  pageNum?: string
  pageSize?: string
  keyword?: string
  projectId?: string
}

/**
 * 创建任务
 */
export function createTask(data: CreateTaskDto): Promise<ApiResponse<TaskItem>> {
  return httpService.post('/task/createTask', data)
}

/**
 * 更新任务
 */
export function updateTask(id: string, data: UpdateTaskDto): Promise<ApiResponse<TaskItem>> {
  return httpService.post(`/task/updateTask/${id}`, data)
}

/**
 * 获取任务列表（支持分页和筛选）
 */
export function getTaskList(params?: TaskPaginationDto): Promise<
  ApiResponse<{
    list: TaskItem[]
    total: number
    pageNum: number
    pageSize: number
  }>
> {
  return httpService.get('/task/getTaskList', params)
}

/**
 * 获取任务详情
 */
export function getTaskDetail(id: string): Promise<ApiResponse<TaskItem>> {
  return httpService.get(`/task/detail/${id}`)
}

/**
 * 删除任务
 */
export function deleteTask(id: string): Promise<ApiResponse<boolean>> {
  return httpService.delete(`/task/deleteTask/${id}`)
}

/**
 * 获取项目任务列表
 */
export function getProjectTaskList(
  projectId: string,
  params?: Omit<TaskPaginationDto, 'projectId'>,
): Promise<
  ApiResponse<{
    list: TaskItem[]
    total: number
    pageNum: number
    pageSize: number
  }>
> {
  return httpService.get(`/task/getProjectTaskList/${projectId}`, params)
}

/**
 * 获取项目任务简单列表（用于下拉选择）
 */
export function getProjectTaskSimpleList(projectId: string): Promise<ApiResponse<TaskItem[]>> {
  return httpService.get(`/task/getProjectTaskSimpleList/${projectId}`)
}
