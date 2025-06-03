import request from '@/utils/request'

// 获取项目列表
export const getProjectList = () => request.get('/projects/list')
