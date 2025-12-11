/**
 * 任务分类管理相关 API
 */

import request from '@/utils/request'

/**
 * 创建任务分类 DTO
 */
export interface CreateTaskCategoryDto {
  code: string
  name: string
  description?: string
  sort?: number
}

/**
 * 更新任务分类 DTO
 */
export interface UpdateTaskCategoryDto {
  code?: string
  name?: string
  description?: string
  sort?: number
}

/**
 * 任务分类分页查询 DTO
 */
export interface TaskCategoryPaginationDto {
  pageNum?: number
  pageSize?: number
  code?: string
  name?: string
  description?: string
}

/**
 * 任务分类实体
 */
export interface TaskCategoryEntity {
  id: string
  code: string
  name: string
  description?: string
  sort?: number
  createdAt: string
  updatedAt: string
}

/**
 * 创建任务分类
 */
export function createTaskCategory(data: CreateTaskCategoryDto) {
  return request.post('/task-category', data)
}

/**
 * 获取任务分类列表（支持分页和不分页）
 */
export function getTaskCategoryList(params?: TaskCategoryPaginationDto) {
  return request.get('/task-category', params)
}

/**
 * 获取任务分类详情
 */
export function getTaskCategoryDetail(id: string) {
  return request.get(`/task-category/${id}`)
}

/**
 * 更新任务分类
 */
export function updateTaskCategory(id: string, data: UpdateTaskCategoryDto) {
  return request.post(`/task-category/update/${id}`, data)
}

/**
 * 删除任务分类
 */
export function deleteTaskCategory(id: string) {
  return request.delete(`/task-category/${id}`)
}
