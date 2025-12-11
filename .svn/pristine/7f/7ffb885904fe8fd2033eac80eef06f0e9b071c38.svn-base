/**
 * 角色分类管理相关 API
 */

import request from '@/utils/request'

/**
 * 创建角色分类 DTO
 */
export interface CreateRoleCategoryDto {
  code: string
  name: string
  description?: string
}

/**
 * 更新角色分类 DTO
 */
export interface UpdateRoleCategoryDto {
  code?: string
  name?: string
  description?: string
}

/**
 * 角色分类分页查询 DTO
 */
export interface RoleCategoryPaginationDto {
  pageNum?: number
  pageSize?: number
  code?: string
  name?: string
  description?: string
}

/**
 * 角色分类实体
 */
export interface RoleCategoryEntity {
  id: string
  code: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

/**
 * 创建角色分类
 */
export function createRoleCategory(data: CreateRoleCategoryDto) {
  return request.post('/role-category', data)
}

/**
 * 获取角色分类列表（支持分页和不分页）
 */
export function getRoleCategoryList(params?: RoleCategoryPaginationDto) {
  return request.get('/role-category', params)
}

/**
 * 获取角色分类详情
 */
export function getRoleCategoryDetail(id: string) {
  return request.get(`/role-category/${id}`)
}

/**
 * 更新角色分类
 */
export function updateRoleCategory(id: string, data: UpdateRoleCategoryDto) {
  return request.post(`/role-category/update/${id}`, data)
}

/**
 * 删除角色分类
 */
export function deleteRoleCategory(id: string) {
  return request.delete(`/role-category/${id}`)
}
