/**
 * 项目相关 Mock 数据
 */

export interface ProjectItem {
  id: number
  projectName: string
  clientUnit: string
  taskStatus: {
    design: boolean // 设计
    review: boolean // 审核
  }
  createTime: string
  updateTime: string
}

// 模拟项目列表数据
export const mockProjectList: ProjectItem[] = [
  {
    id: 1,
    projectName: '任丘市2025年农村公路建设工程第一标段',
    clientUnit: '任丘市交通运输局',
    taskStatus: {
      design: false,
      review: false,
    },
    createTime: '2025-01-15 10:30:00',
    updateTime: '2025-01-15 10:30:00',
  },
  {
    id: 2,
    projectName: '任丘市2025年农村公路建设工程第二标段',
    clientUnit: '任丘市交通运输局',
    taskStatus: {
      design: true,
      review: true,
    },
    createTime: '2025-01-14 09:20:00',
    updateTime: '2025-01-20 14:30:00',
  },
  {
    id: 3,
    projectName: '任丘市2025年农村公路建设工程第三标段',
    clientUnit: '任丘市交通运输局',
    taskStatus: {
      design: true,
      review: true,
    },
    createTime: '2025-01-13 11:00:00',
    updateTime: '2025-01-19 16:45:00',
  },
  {
    id: 4,
    projectName: '沧州市政府采购中心办公设备采购项目',
    clientUnit: '沧州市政府采购中心',
    taskStatus: {
      design: true,
      review: false,
    },
    createTime: '2025-01-12 14:15:00',
    updateTime: '2025-01-18 10:20:00',
  },
  {
    id: 5,
    projectName: '沧州市第一医院医疗设备采购项目',
    clientUnit: '沧州市第一医院',
    taskStatus: {
      design: false,
      review: true,
    },
    createTime: '2025-01-11 08:45:00',
    updateTime: '2025-01-17 13:30:00',
  },
  {
    id: 6,
    projectName: '沧州市图书馆智能化系统升级改造项目',
    clientUnit: '沧州市文化和旅游局',
    taskStatus: {
      design: false,
      review: true,
    },
    createTime: '2025-01-10 15:20:00',
    updateTime: '2025-01-16 09:15:00',
  },
  {
    id: 7,
    projectName: '沧州市第二中学教学楼维修改造工程',
    clientUnit: '沧州市教育局',
    taskStatus: {
      design: false,
      review: true,
    },
    createTime: '2025-01-09 10:00:00',
    updateTime: '2025-01-15 11:40:00',
  },
  {
    id: 9,
    projectName: '沧州市智慧交通系统建设项目',
    clientUnit: '沧州市公安局交通警察支队',
    taskStatus: {
      design: false,
      review: true,
    },
    createTime: '2025-01-07 13:30:00',
    updateTime: '2025-01-13 15:20:00',
  },
  {
    id: 10,
    projectName: '沧州市智慧交通系统建设项目',
    clientUnit: '沧州市公安局交通警察支队',
    taskStatus: {
      design: false,
      review: true,
    },
    createTime: '2025-01-06 09:45:00',
    updateTime: '2025-01-12 14:30:00',
  },
  {
    id: 11,
    projectName: '沧州市智慧交通系统建设项目',
    clientUnit: '沧州市公安局交通警察支队',
    taskStatus: {
      design: false,
      review: true,
    },
    createTime: '2025-01-05 16:20:00',
    updateTime: '2025-01-11 10:15:00',
  },
  {
    id: 12,
    projectName: '沧州市智慧交通系统建设项目',
    clientUnit: '沧州市公安局交通警察支队',
    taskStatus: {
      design: false,
      review: true,
    },
    createTime: '2025-01-04 11:30:00',
    updateTime: '2025-01-10 09:20:00',
  },
  {
    id: 13,
    projectName: '沧州市智慧交通系统建设项目',
    clientUnit: '沧州市公安局交通警察支队',
    taskStatus: {
      design: false,
      review: true,
    },
    createTime: '2025-01-03 14:00:00',
    updateTime: '2025-01-09 16:45:00',
  },
  {
    id: 14,
    projectName: '沧州市智慧交通系统建设项目',
    clientUnit: '沧州市公安局交通警察支队',
    taskStatus: {
      design: false,
      review: true,
    },
    createTime: '2025-01-02 10:15:00',
    updateTime: '2025-01-08 13:30:00',
  },
  {
    id: 15,
    projectName: '沧州市智慧交通系统建设项目',
    clientUnit: '沧州市公安局交通警察支队',
    taskStatus: {
      design: false,
      review: true,
    },
    createTime: '2025-01-01 08:00:00',
    updateTime: '2025-01-07 11:20:00',
  },
]

// 分页查询结果类型
export interface PageResult<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
}

/**
 * 模拟分页查询项目列表
 */
export function mockGetProjectList(params: {
  pageNum: number
  pageSize: number
  keyword?: string
}): Promise<PageResult<ProjectItem>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredList = [...mockProjectList]

      // 关键词搜索
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase()
        filteredList = filteredList.filter(
          (item) =>
            item.projectName.toLowerCase().includes(keyword) ||
            item.clientUnit.toLowerCase().includes(keyword),
        )
      }

      // 分页
      const start = (params.pageNum - 1) * params.pageSize
      const end = start + params.pageSize
      const list = filteredList.slice(start, end)

      resolve({
        list,
        total: filteredList.length,
        pageNum: params.pageNum,
        pageSize: params.pageSize,
      })
    }, 300) // 模拟网络延迟
  })
}

/**
 * 模拟获取项目详情
 */
export function mockGetProjectDetail(id: number): Promise<ProjectItem | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const project = mockProjectList.find((item) => item.id === id)
      resolve(project || null)
    }, 200)
  })
}
