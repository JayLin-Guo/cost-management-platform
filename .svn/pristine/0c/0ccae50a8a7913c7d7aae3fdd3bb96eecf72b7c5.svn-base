/**
 * 用户/人员相关 Mock 数据
 */

export interface UserItem {
  id: number
  name: string
  role?: string
  department?: string
}

// 模拟人员列表数据
export const mockUserList: UserItem[] = [
  { id: 1, name: '张三', role: '项目经理', department: '工程部' },
  { id: 2, name: '李四', role: '造价工程师', department: '造价部' },
  { id: 3, name: '王五', role: '审核员', department: '审核部' },
  { id: 4, name: '赵六', role: '造价工程师', department: '造价部' },
  { id: 5, name: '张管者', role: '审核主管', department: '审核部' },
  { id: 6, name: '陈七', role: '造价工程师', department: '造价部' },
  { id: 7, name: '刘八', role: '审核员', department: '审核部' },
]

/**
 * 模拟获取人员列表
 */
export function mockGetUserList(): Promise<UserItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockUserList)
    }, 300)
  })
}

/**
 * 模拟获取审核人员列表
 */
export function mockGetReviewerList(): Promise<UserItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const reviewers = mockUserList.filter(
        (user) => user.role === '审核员' || user.role === '审核主管',
      )
      resolve(reviewers)
    }, 300)
  })
}
