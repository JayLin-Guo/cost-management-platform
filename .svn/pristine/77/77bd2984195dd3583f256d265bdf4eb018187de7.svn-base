// 部门相关类型定义

export interface Department {
  id: string
  name: string
  code: string
  parentId: string | null
  parent?: Department | null
  children?: Department[]
  level?: number
  path?: string
  sort?: number
  isActive: boolean
  description?: string
  userCount?: number
  createdAt: string
  updatedAt: string
}

export interface CreateDepartmentDto {
  name: string
  code: string
  parentId?: string | null
  sort?: number
  isActive?: boolean
  description?: string
}

export interface UpdateDepartmentDto {
  name?: string
  code?: string
  parentId?: string | null
  sort?: number
  isActive?: boolean
  description?: string
}

export interface DepartmentQuery {
  keyword?: string
  isActive?: boolean
  parentId?: string
}

export interface DepartmentTreeNode extends Department {
  children: DepartmentTreeNode[]
  disabled?: boolean
}
