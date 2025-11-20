/**
 * 用户/人员相关 API
 */

import type { UserItem } from '@/mock/user'
import { mockGetUserList, mockGetReviewerList } from '@/mock/user'
import request from '@/utils/request'

/**
 * 获取人员列表
 */
export function getUserList(params?: any) {
  return request.get('/user/getUserList', params)
}

/**
 * 获取审核人员列表
 */
export function getReviewerList() {
  // TODO: 后续替换为真实 API 调用
  // return get<UserItem[]>('/users/reviewers')

  // 目前使用 Mock 数据
  return mockGetReviewerList()
}

// 导出类型
export type { UserItem }
