import request from '@/utils/request'

// 获取任务分类列表
export const getTaskCategories = () =>
  request.get<{ id: string; name: string }[]>('/task/categories')

// 获取参与人员列表
export const getParticipants = () =>
  request.get<{ id: string; name: string }[]>('/task/participants')

// 获取任务负责人列表
export const getResponsibles = () =>
  request.get<{ id: string; name: string }[]>('/task/responsibles')

// 获取审核级别列表
export const getReviewLevels = () =>
  request.get<{ id: string; name: string }[]>('/task/review-levels')

// 获取审核人员列表
export const getReviewers = () =>
  request.get<{ id: string; name: string }[]>('/task/reviewers')

// 创建任务
export const createTask = (taskData: any) => request.post('/task/add', taskData)

// 更新任务
export const updateTask = (taskId: string, taskData: any) =>
  request.put(`/task/update/${taskId}`, taskData)

// 删除任务
export const deleteTask = (taskId: string) => request.post(`/task/remove/${taskId}`)

// 查看任务
export const getTaskDetail = (taskId: string) =>
  request.get(`/task/detail/${taskId}`)
