import { ref } from 'vue'

// 工作流记录接口
export interface WorkflowRecord {
  id: string
  fromReviewer: {
    id: string
    name: string
    position: number // 垂直位置
  }
  toReviewer: {
    id: string
    name: string
    position: number // 垂直位置
  }
  startTime: string // 开始时间 YYYY-MM-DD
  endTime: string // 结束时间 YYYY-MM-DD
  title: string // 文件标题
  status: 'pass' | 'reject' // 通过或驳回
  flowType: 'main' | 'retry' // 主流程或重试流程
}

export default function useMockData() {
  // 审核人数据 - 用于参考和显示
  const reviewers = ref([
    { id: 'reviewer1', name: '张三', position: 0 },
    { id: 'reviewer2', name: '李四', position: 1 },
    { id: 'reviewer3', name: '王五', position: 2 },
    { id: 'reviewer4', name: '赵六', position: 3 }
  ])

  // 工作流记录 - 核心数据
  const workflowRecords = ref<WorkflowRecord[]>([
    // 主流程
    {
      id: 'record1',
      fromReviewer: { id: 'reviewer1', name: '张三', position: 0 },
      toReviewer: { id: 'reviewer2', name: '李四', position: 1 },
      startTime: '2023-06-04',
      endTime: '2023-06-04',
      title: '控制价\n初步成果文件',
      status: 'pass',
      flowType: 'main'
    },
    {
      id: 'record2',
      fromReviewer: { id: 'reviewer2', name: '李四', position: 1 },
      toReviewer: { id: 'reviewer3', name: '王五', position: 2 },
      startTime: '2023-06-04',
      endTime: '2023-07-09',
      title: '控制价\n一审送审文件',
      status: 'pass',
      flowType: 'main'
    },
    {
      id: 'record3',
      fromReviewer: { id: 'reviewer3', name: '王五', position: 2 },
      toReviewer: { id: 'reviewer1', name: '张三', position: 0 },
      startTime: '2023-07-09',
      endTime: '2023-07-09',
      title: '控制价\n二审结果文件',
      status: 'reject',
      flowType: 'main'
    },

    // 重试流程（驳回后）
    {
      id: 'record4',
      fromReviewer: { id: 'reviewer1', name: '张三', position: 0 },
      toReviewer: { id: 'reviewer2', name: '李四', position: 1 },
      startTime: '2023-07-15',
      endTime: '2023-07-15',
      title: '控制价\n初步成果文件',
      status: 'pass',
      flowType: 'retry'
    },
    {
      id: 'record5',
      fromReviewer: { id: 'reviewer2', name: '李四', position: 1 },
      toReviewer: { id: 'reviewer3', name: '王五', position: 2 },
      startTime: '2023-07-15',
      endTime: '2023-07-20',
      title: '控制价\n一审送审文件',
      status: 'pass',
      flowType: 'retry'
    },
    {
      id: 'record6',
      fromReviewer: { id: 'reviewer3', name: '王五', position: 2 },
      toReviewer: { id: 'reviewer4', name: '赵六', position: 3 },
      startTime: '2023-07-20',
      endTime: '2023-07-20',
      title: '控制价\n二审结果文件',
      status: 'pass',
      flowType: 'retry'
    }
  ])

  // 获取所有不重复的时间点
  const getTimePoints = () => {
    const timeSet = new Set<string>()

    workflowRecords.value.forEach(record => {
      timeSet.add(record.startTime)
      timeSet.add(record.endTime)
    })

    return Array.from(timeSet)
      .sort()
      .map(date => {
        // 将日期格式化为更友好的显示
        const dateObj = new Date(date)
        const month = dateObj.getMonth() + 1
        const day = dateObj.getDate()
        return {
          date,
          label: `${month}月${day}日`
        }
      })
  }

  // 获取时间点索引
  const getTimePointIndex = (date: string) => {
    const timePoints = getTimePoints()
    return timePoints.findIndex(tp => tp.date === date)
  }

  // 获取审核人索引
  const getReviewerIndex = (reviewerId: string) => {
    return reviewers.value.findIndex(r => r.id === reviewerId)
  }

  // 获取所有数据
  const getAllData = () => {
    return {
      reviewers: reviewers.value,
      timePoints: getTimePoints(),
      workflowRecords: workflowRecords.value
    }
  }

  return {
    reviewers,
    workflowRecords,
    getTimePoints,
    getTimePointIndex,
    getReviewerIndex,
    getAllData
  }
}
