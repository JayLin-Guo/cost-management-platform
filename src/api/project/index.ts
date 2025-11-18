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
export function getProjectDetail(id: number) {
  // TODO: 后续替换为真实 API 调用
  // return get<ProjectItem>(`/project/${id}`)
  // 目前使用 Mock 数据
  // return mockGetProjectDetail(id)
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
export function updateProject(_id: number, _data: Partial<any>) {
  // TODO: 实现真实 API 调用
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, 500)
  })
}

/**
 * 删除项目
 */
export function deleteProject(_id: number) {
  // TODO: 实现真实 API 调用
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, 500)
  })
}
