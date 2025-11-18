/**
 * 项目相关 Mock 数据
 */

// 分页查询结果类型
export interface PageResult<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
}
