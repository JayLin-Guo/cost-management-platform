import request from '@/utils/request'
import type {
  ReviewerConfig,
  CreateReviewerConfigDto,
  UpdateReviewerConfigDto,
  ReviewerConfigQuery,
  ReviewerLevel,
  TaskCategory,
} from '@/types/reviewer'

// Mock数据
const mockReviewerConfigs: ReviewerConfig[] = [
  {
    id: '1',
    userId: 'user1',
    user: {
      id: 'user1',
      name: '张工程师',
      username: 'zhang_engineer',
      email: 'zhang@example.com',
      phone: '13800138001',
      isActive: true,
    },
    departmentId: '2',
    department: {
      id: '2',
      name: '工程部',
      code: 'ENG',
    },
    reviewerLevel: 'LEVEL_1' as ReviewerLevel,
    taskCategories: ['DRAFTING_CONTROL_PRICE', 'COUNTERSIGN'] as TaskCategory[],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    userId: 'user2',
    user: {
      id: 'user2',
      name: '李主管',
      username: 'li_supervisor',
      email: 'li@example.com',
      phone: '13800138002',
      isActive: true,
    },
    departmentId: '2',
    department: {
      id: '2',
      name: '工程部',
      code: 'ENG',
    },
    reviewerLevel: 'LEVEL_2' as ReviewerLevel,
    taskCategories: ['DRAFTING_CONTROL_PRICE', 'DRAFTING_PLAN', 'COUNTERSIGN'] as TaskCategory[],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    userId: 'user3',
    user: {
      id: 'user3',
      name: '王经理',
      username: 'wang_manager',
      email: 'wang@example.com',
      phone: '13800138003',
      isActive: true,
    },
    departmentId: '1',
    department: {
      id: '1',
      name: '总公司',
      code: 'HQ',
    },
    reviewerLevel: 'LEVEL_3' as ReviewerLevel,
    taskCategories: [
      'DRAFTING_CONTROL_PRICE',
      'DRAFTING_PLAN',
      'COUNTERSIGN',
      'OTHER',
    ] as TaskCategory[],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

// 使用真实API接口，不使用Mock数据
const useMock = false

// 生成新ID
const generateId = () => Math.random().toString(36).substr(2, 9)

// 审核人员API接口
export const reviewerApi = {
  // 获取审核人员配置列表
  getReviewerConfigs: async (params?: ReviewerConfigQuery & { page?: number; size?: number }) => {
    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500))

      let filteredConfigs = [...mockReviewerConfigs]

      // 应用筛选条件
      if (params?.departmentId) {
        filteredConfigs = filteredConfigs.filter(
          (config) => config.departmentId === params.departmentId,
        )
      }
      if (params?.reviewerLevel) {
        filteredConfigs = filteredConfigs.filter(
          (config) => config.reviewerLevel === params.reviewerLevel,
        )
      }
      if (params?.taskCategory) {
        filteredConfigs = filteredConfigs.filter((config) =>
          config.taskCategories.includes(params.taskCategory!),
        )
      }
      if (params?.keyword) {
        filteredConfigs = filteredConfigs.filter(
          (config) =>
            config.user.name.includes(params.keyword!) ||
            config.user.username.includes(params.keyword!),
        )
      }
      if (params?.isActive !== undefined) {
        filteredConfigs = filteredConfigs.filter((config) => config.isActive === params.isActive)
      }

      // 分页
      const page = params?.page || 1
      const size = params?.size || 20
      const start = (page - 1) * size
      const end = start + size

      return {
        data: filteredConfigs.slice(start, end),
        total: filteredConfigs.length,
        page,
        size,
      }
    }

    const response = await request.get('/reviewer-configs', params)
    return response.data
  },

  // 获取审核人员配置详情
  getReviewerConfigById: async (id: string): Promise<ReviewerConfig> => {
    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      const config = mockReviewerConfigs.find((c) => c.id === id)
      if (!config) {
        throw new Error('审核人员配置不存在')
      }
      return config
    }

    const response = await request.get(`/reviewer-configs/${id}`)
    return response.data
  },

  // 创建审核人员配置
  createReviewerConfig: async (data: CreateReviewerConfigDto): Promise<ReviewerConfig> => {
    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 800))

      // 检查是否已存在相同配置
      const exists = mockReviewerConfigs.some(
        (config) =>
          config.userId === data.userId &&
          config.departmentId === data.departmentId &&
          config.reviewerLevel === data.reviewerLevel,
      )

      if (exists) {
        throw new Error('该用户在此部门的此审核级别配置已存在')
      }

      const newConfig: ReviewerConfig = {
        id: generateId(),
        userId: data.userId,
        user: {
          id: data.userId,
          name: '新用户',
          username: 'new_user',
          isActive: true,
        },
        departmentId: data.departmentId,
        department: {
          id: data.departmentId,
          name: '部门名称',
          code: 'DEPT',
        },
        reviewerLevel: data.reviewerLevel,
        taskCategories: data.taskCategories,
        isActive: data.isActive !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      return newConfig
    }

    const response = await request.post('/reviewer-configs', data)
    return response.data
  },

  // 更新审核人员配置
  updateReviewerConfig: async (
    id: string,
    data: UpdateReviewerConfigDto,
  ): Promise<ReviewerConfig> => {
    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 600))
      const config = mockReviewerConfigs.find((c) => c.id === id)
      if (!config) {
        throw new Error('审核人员配置不存在')
      }

      const updatedConfig: ReviewerConfig = {
        ...config,
        ...data,
        updatedAt: new Date().toISOString(),
      }

      return updatedConfig
    }

    const response = await request.put(`/reviewer-configs/${id}`, data)
    return response.data
  },

  // 删除审核人员配置
  deleteReviewerConfig: async (id: string): Promise<void> => {
    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 400))
      const config = mockReviewerConfigs.find((c) => c.id === id)
      if (!config) {
        throw new Error('审核人员配置不存在')
      }
      return
    }

    await request.delete(`/reviewer-configs/${id}`)
  },

  // 获取可用审核人员
  getAvailableReviewers: async (params: {
    departmentId: string
    reviewerLevel: ReviewerLevel
    taskCategory: TaskCategory
  }): Promise<ReviewerConfig[]> => {
    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return mockReviewerConfigs.filter(
        (config) =>
          config.departmentId === params.departmentId &&
          config.reviewerLevel === params.reviewerLevel &&
          config.taskCategories.includes(params.taskCategory) &&
          config.isActive,
      )
    }

    const response = await request.get('/reviewer-configs/available', params)
    return response.data || []
  },
}
