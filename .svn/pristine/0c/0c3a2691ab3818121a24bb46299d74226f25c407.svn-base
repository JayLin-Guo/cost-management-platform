import request from '@/utils/request'

// API 接口类型定义
export interface GetProjectListParams {
  pageNum: number
  pageSize: number
  keyword?: string
}

/**
 * 获取项目列表（分页）
 */
export function getProjectList(params: GetProjectListParams) {
  return request.get('/projects/list', params)
}

/**
 * 获取项目详情
 */
export function getProjectDetail(id: string) {
  return request.get(`/projects/detail/${id}`)
}

/**
 * 创建项目
 */
export function createProject(data: Partial<any>) {
  return request.post('/projects/addProject', data)
}

/**
 * 更新项目
 */
export function updateProject(data: Partial<any>) {
  return request.post(`/projects/update`, data)
}

/**
 * 删除项目
 */
export function deleteProject(id: string) {
  return request.delete(`/projects/delete/${id}`)
}
