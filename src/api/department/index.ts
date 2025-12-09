import request from '@/utils/request'
import type {
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentQuery,
} from '@/types/department'
import { mockDepartments, flatDepartments } from '@/mock/department'

// 使用真实API接口，不使用Mock数据
const useMock = false

// 生成新ID
const generateId = () => Math.random().toString(36).substr(2, 9)

// 部门API接口
export const departmentApi = {
  // 获取部门树
  getDepartmentTree: async (params?: DepartmentQuery): Promise<Department[]> => {
    if (useMock) {
      // 模拟延迟
      await new Promise((resolve) => setTimeout(resolve, 500))
      return mockDepartments
    }
    const response = await request.get('/departments/tree', params)
    return response.data || []
  },

  // 获取部门列表
  getDepartmentList: async (params?: DepartmentQuery): Promise<Department[]> => {
    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return flatDepartments
    }
    const response = await request.get('/departments', params)
    return response.data || []
  },

  // 获取部门详情
  getDepartmentById: async (id: string): Promise<Department> => {
    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      const department = flatDepartments.find((d) => d.id === id)
      if (!department) {
        throw new Error('部门不存在')
      }
      return department
    }
    const response = await request.get(`/departments/${id}`)
    return response.data
  },

  // 创建部门
  createDepartment: async (data: CreateDepartmentDto): Promise<Department> => {
    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      const newDepartment: Department = {
        id: generateId(),
        name: data.name,
        code: data.code,
        parentId: data.parentId || null,
        sort: data.sort || 0,
        isActive: data.isActive !== false,
        description: data.description,
        userCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return newDepartment
    }
    const response = await request.post('/departments', data)
    return response.data
  },

  // 更新部门
  updateDepartment: async (id: string, data: UpdateDepartmentDto): Promise<Department> => {
    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 600))
      const department = flatDepartments.find((d) => d.id === id)
      if (!department) {
        throw new Error('部门不存在')
      }
      const updatedDepartment: Department = {
        ...department,
        ...data,
        updatedAt: new Date().toISOString(),
      }
      return updatedDepartment
    }
    const response = await request.put(`/departments/${id}`, data)
    return response.data
  },

  // 删除部门
  deleteDepartment: async (id: string): Promise<void> => {
    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 400))
      const department = flatDepartments.find((d) => d.id === id)
      if (!department) {
        throw new Error('部门不存在')
      }
      // 检查是否有子部门
      const hasChildren = flatDepartments.some((d) => d.parentId === id)
      if (hasChildren) {
        throw new Error('该部门下还有子部门，无法删除')
      }
      // 检查是否有用户
      if (department.userCount && department.userCount > 0) {
        throw new Error('该部门下还有用户，无法删除')
      }
      return
    }
    await request.delete(`/departments/${id}`)
  },

  // 移动部门
  moveDepartment: async (id: string, parentId: string | null): Promise<void> => {
    await request.put(`/departments/${id}/move`, { parentId })
  },

  // 获取部门路径
  getDepartmentPath: async (id: string): Promise<Department[]> => {
    const response = await request.get(`/departments/${id}/path`)
    return response.data || []
  },

  // 获取子部门
  getChildDepartments: async (parentId: string): Promise<Department[]> => {
    const response = await request.get(`/departments/${parentId}/children`)
    return response.data || []
  },
}
