/**
 * 任务相关 API
 */

import type { TaskItem } from '@/mock/task'
import {
  mockGetProjectTasks,
  mockGetTaskDetail,
  mockCreateTask,
  mockUpdateTask,
  mockDeleteTask,
} from '@/mock/task'

/**
 * 获取项目的任务列表
 */
export function getProjectTasks(projectId: number): Promise<TaskItem[]> {
  // TODO: 后续替换为真实 API 调用
  // return get<TaskItem[]>(`/project/${projectId}/tasks`)

  // 目前使用 Mock 数据
  return mockGetProjectTasks(projectId)
}

/**
 * 获取任务详情
 */
export function getTaskDetail(id: number): Promise<TaskItem | null> {
  // TODO: 后续替换为真实 API 调用
  // return get<TaskItem>(`/task/${id}`)

  // 目前使用 Mock 数据
  return mockGetTaskDetail(id)
}

/**
 * 创建任务
 */
export function createTask(data: Partial<TaskItem>): Promise<TaskItem> {
  // TODO: 后续替换为真实 API 调用
  // return post<TaskItem>('/task', data)

  // 目前使用 Mock 数据
  return mockCreateTask(data)
}

/**
 * 更新任务
 */
export function updateTask(id: number, data: Partial<TaskItem>): Promise<TaskItem | null> {
  // TODO: 后续替换为真实 API 调用
  // return put<TaskItem>(`/task/${id}`, data)

  // 目前使用 Mock 数据
  return mockUpdateTask(id, data)
}

/**
 * 删除任务
 */
export function deleteTask(id: number): Promise<boolean> {
  // TODO: 后续替换为真实 API 调用
  // return del(`/task/${id}`)

  // 目前使用 Mock 数据
  return mockDeleteTask(id)
}

// 导出类型
export type { TaskItem }
