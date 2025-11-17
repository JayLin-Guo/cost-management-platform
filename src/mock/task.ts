/**
 * 任务相关 Mock 数据
 */

export interface TaskItem {
  id: number
  projectId: number
  taskName: string // 任务名称
  taskCategory: string // 任务分类
  participants?: number[] // 参与人员 ID 数组
  assignee?: number // 任务负责人 ID
  reviewType: string // 是否审核：不审核、一审、二审、三审
  reviewer1?: number // 一审审核人员 ID
  reviewer2?: number // 二审审核人员 ID
  reviewer3?: number // 三审审核人员 ID
  description?: string // 任务说明
  attachments?: string[] // 附件列表
  status: 'pending' | 'in_progress' | 'completed' // 任务状态
  createTime: string
  updateTime: string
}

// 模拟任务列表数据
export const mockTaskList: TaskItem[] = [
  {
    id: 1,
    projectId: 1,
    taskName: '任丘市公路建设工程施工图预算编制',
    taskCategory: '拟定控制价',
    participants: [1, 2],
    assignee: 1,
    reviewType: '二审',
    reviewer1: 3,
    reviewer2: 5,
    description: '编制任丘市公路建设工程施工图预算',
    status: 'in_progress',
    createTime: '2025-01-15 10:30:00',
    updateTime: '2025-01-20 14:30:00',
  },
  {
    id: 2,
    projectId: 1,
    taskName: '任丘市公路建设工程预算审核',
    taskCategory: '审核',
    participants: [3, 5],
    assignee: 3,
    reviewType: '一审',
    reviewer1: 5,
    description: '审核预算文件',
    status: 'pending',
    createTime: '2025-01-15 10:30:00',
    updateTime: '2025-01-15 10:30:00',
  },
  {
    id: 3,
    projectId: 2,
    taskName: '农村公路二标段预算编制',
    taskCategory: '拟定控制价',
    participants: [2, 4],
    assignee: 2,
    reviewType: '不审核',
    description: '农村公路二标段预算编制',
    status: 'completed',
    createTime: '2025-01-14 09:20:00',
    updateTime: '2025-01-20 16:30:00',
  },
]

/**
 * 模拟获取项目的任务列表
 */
export function mockGetProjectTasks(projectId: number): Promise<TaskItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tasks = mockTaskList.filter((item) => item.projectId === projectId)
      resolve(tasks)
    }, 300)
  })
}

/**
 * 模拟获取任务详情
 */
export function mockGetTaskDetail(id: number): Promise<TaskItem | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const task = mockTaskList.find((item) => item.id === id)
      resolve(task || null)
    }, 200)
  })
}

/**
 * 模拟创建任务
 */
export function mockCreateTask(data: Partial<TaskItem>): Promise<TaskItem> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newTask: TaskItem = {
        id: Math.floor(Math.random() * 10000),
        projectId: data.projectId!,
        taskName: data.taskName!,
        taskCategory: data.taskCategory || '拟定控制价',
        participants: data.participants,
        assignee: data.assignee,
        reviewType: data.reviewType || '不审核',
        reviewer1: data.reviewer1,
        reviewer2: data.reviewer2,
        reviewer3: data.reviewer3,
        description: data.description,
        attachments: data.attachments,
        status: data.status || 'pending',
        createTime: new Date().toLocaleString('zh-CN'),
        updateTime: new Date().toLocaleString('zh-CN'),
      }
      mockTaskList.push(newTask)
      resolve(newTask)
    }, 500)
  })
}

/**
 * 模拟更新任务
 */
export function mockUpdateTask(id: number, data: Partial<TaskItem>): Promise<TaskItem | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockTaskList.findIndex((item) => item.id === id)
      if (index !== -1) {
        mockTaskList[index] = {
          ...mockTaskList[index],
          ...data,
          updateTime: new Date().toLocaleString('zh-CN'),
        }
        resolve(mockTaskList[index])
      } else {
        resolve(null)
      }
    }, 500)
  })
}

/**
 * 模拟删除任务
 */
export function mockDeleteTask(id: number): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockTaskList.findIndex((item) => item.id === id)
      if (index !== -1) {
        mockTaskList.splice(index, 1)
        resolve(true)
      } else {
        resolve(false)
      }
    }, 300)
  })
}
