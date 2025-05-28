import { ref } from 'vue'

// 审核人接口
export interface Reviewer {
  id: string // 审核人ID
  name: string // 审核人姓名
  position: number // 审核人位置（用于可视化）
  role?: string // 审核人角色
  department?: string // 部门
}

// 时间点接口
export interface TimePoint {
  id: string // 时间点ID
  date: string // 日期，格式：YYYY-MM-DD
  label: string // 显示标签，如"6月4日"
  isInterval?: boolean // 是否是间隔区间
}

// 节点类型
export type NodeType = 'start' | 'virtual' | 'actual' | 'end'

// 节点状态
export type NodeStatus = 'pending' | 'pass' | 'reject'

// 流程类型
export type FlowType = 'main' | 'retry'

// 连接线类型
export type ConnectionType = 'solid' | 'dashed'

// 工作流连接线接口
export interface WorkflowConnection {
  id: string // 连接ID，通常是 fromNodeId-toNodeId
  fromNodeId: string // 起始节点ID
  toNodeId: string // 目标节点ID
  status: NodeStatus // 连接状态
  flowType: FlowType // 流程类型
  type: ConnectionType // 连接线类型：实线或虚线
  label?: string // 连接线标签
}

// 工作流节点
export interface WorkflowNode {
  id: string // 节点唯一标识
  reviewerId: string // 审核人ID
  timePointId: string // 关联时间点ID
  title: string // 节点标题
  type: NodeType // 节点类型
  status: NodeStatus // 节点状态
  flowType: FlowType // 流程类型
  isVisible: boolean // 是否可见
  isVirtual: boolean // 是否是虚拟节点
  stateInfo: string // 状态信息（审核状态或时间信息）
  // 连接信息
  from?: string // 上游节点ID
  to?: string // 下游节点ID
  // 附加信息
  documentId?: string // 文档ID
  documentVersion?: string // 文档版本
  comments?: string // 注释
  priority?: 'low' | 'normal' | 'high' | 'urgent' // 优先级
}

export default function useMockData() {
  // 审核人数据
  const reviewers = ref<Reviewer[]>([
    { id: 'reviewer1', name: '张三', position: 0, role: '造价工程师', department: '工程部' },
    { id: 'reviewer2', name: '李四', position: 1, role: '一审审核员', department: '审核部' },
    { id: 'reviewer3', name: '王五', position: 2, role: '二审审核员', department: '审核部' },
    { id: 'reviewer4', name: '赵六', position: 3, role: '三审审核员', department: '质控部' },
  ])

  // 时间点数据
  const timePoints = ref<TimePoint[]>([
    { id: 'timePoint1', date: '2023-06-04', label: '6月4日' },
    { id: 'timeInterval1', date: 'interval_1', label: '6月5日-7月8日', isInterval: true },
    { id: 'timePoint2', date: '2023-07-09', label: '7月9日' },
  ])

  // 工作流节点数据
  const workflowNodes = ref<WorkflowNode[]>([
    // 1. 张三创建初始节点（操作节点1）- 6月4日
    {
      id: 'node1',
      reviewerId: 'reviewer1', // 张三
      timePointId: 'timePoint1', // 6月4日
      title: '控制价\n初步成果文件',
      type: 'start',
      status: 'pass',
      flowType: 'main',
      isVisible: true,
      isVirtual: false,
      stateInfo: '提交初审',
      from: 'node1', // 从自身开始
      to: 'node2', // 连接到李四节点
      // 附加信息
      documentId: 'doc-2023-001',
      documentVersion: 'v1.0',
      comments: '请进行初步审核',
      priority: 'normal',
    },
    // 2. 李四的一审接收节点 - 6月4日
    {
      id: 'node2',
      reviewerId: 'reviewer2', // 李四（一审审核员）
      timePointId: 'timePoint1', // 6月4日（同一天接收）
      title: '控制价\n接收审核',
      type: 'virtual',
      status: 'pending',
      flowType: 'main',
      isVisible: true,
      isVirtual: true,
      stateInfo: '历时35天',
      from: 'node2', // 从自己开始
      to: 'node4', // 连接到时间间隔节点
      // 附加信息
      documentId: 'doc-2023-001',
      documentVersion: 'v1.0',
    },
    // 3. 时间间隔节点 - 6月5日至7月8日
    // {
    //   id: 'node3',
    //   reviewerId: 'reviewer2', // 李四（一直在审核中）
    //   timePointId: 'timeInterval1', // 时间间隔
    //   title: '控制价\n审核中',
    //   type: 'virtual',
    //   status: 'pending',
    //   flowType: 'main',
    //   isVisible: true,
    //   isVirtual: true,
    //   stateInfo: '历时35天',
    //   from: 'node3', // 从自己开始
    //   to: 'node4', // 连接到李四的审核完成节点
    //   // 附加信息
    //   documentId: 'doc-2023-001',
    //   documentVersion: 'v1.0',
    // },
    // 4. 李四的一审完成节点 - 7月9日
    {
      id: 'node4',
      reviewerId: 'reviewer2', // 李四
      timePointId: 'timePoint2', // 7月9日
      title: '控制价\n一审完成',
      type: 'actual',
      status: 'pass',
      flowType: 'main',
      isVisible: true,
      isVirtual: false,
      stateInfo: '提交二审',
      from: 'node4', // 从自己开始
      to: 'node5', // 连接到王五的接收节点
      // 附加信息
      documentId: 'doc-2023-001',
      documentVersion: 'v1.1',
      comments: '已完成一审，请进行二审',
      priority: 'normal',
    },
    // 5. 王五的接收节点 - 7月9日
    {
      id: 'node5',
      reviewerId: 'reviewer3', // 王五
      timePointId: 'timePoint2', // 7月9日（同一天接收）
      title: '控制价\n二审接收',
      type: 'virtual',
      status: 'pending',
      flowType: 'main',
      isVisible: true,
      isVirtual: true,
      stateInfo: '0天',
      from: 'node5', // 从自己开始
      to: 'node6', // 连接到王五的驳回节点
      // 附加信息
      documentId: 'doc-2023-001',
      documentVersion: 'v1.1',
    },
    // 6. 王五的驳回节点 - 7月9日
    {
      id: 'node6',
      reviewerId: 'reviewer3', // 王五
      timePointId: 'timePoint2', // 7月9日
      title: '控制价\n二审结果文件',
      type: 'actual',
      status: 'reject',
      flowType: 'main',
      isVisible: true,
      isVirtual: false,
      stateInfo: '驳回',
      from: 'node6', // 从自己开始
      to: 'node7', // 连接到张三的最终节点
      // 附加信息
      documentId: 'doc-2023-001',
      documentVersion: 'v1.1',
      comments: '存在问题，需要重新修改后提交',
      priority: 'high',
    },
    // 7. 张三的最终节点 - 7月9日
    {
      id: 'node7',
      reviewerId: 'reviewer1', // 张三
      timePointId: 'timePoint2', // 7月9日
      title: '控制价\n审核结束',
      type: 'end',
      status: 'reject',
      flowType: 'main',
      isVisible: true,
      isVirtual: false,
      stateInfo: '待修改',
      from: 'node7', // 从自己开始
      // 附加信息
      documentId: 'doc-2023-001',
      documentVersion: 'v1.1',
      comments: '收到驳回意见，准备修改',
      priority: 'high',
    },
  ])

  // 获取时间点
  const getTimePoints = () => {
    return timePoints.value.filter((tp) => !tp.isInterval)
  }

  // 获取时间点索引
  const getTimePointIndex = (timePointId: string) => {
    return timePoints.value.findIndex((tp) => tp.id === timePointId)
  }

  // 获取时间点日期
  const getTimePointDate = (timePointId: string) => {
    const timePoint = timePoints.value.find((tp) => tp.id === timePointId)
    return timePoint ? timePoint.date : ''
  }

  // 获取审核人索引
  const getReviewerIndex = (reviewerId: string) => {
    return reviewers.value.findIndex((r) => r.id === reviewerId)
  }

  // 获取审核人信息
  const getReviewer = (reviewerId: string) => {
    return reviewers.value.find((r) => r.id === reviewerId)
  }

  // 获取节点
  const getNodeById = (nodeId: string) => {
    return workflowNodes.value.find((node) => node.id === nodeId)
  }

  // 获取节点序列
  const getNodesSequence = () => {
    // 节点已经按照顺序排列，直接返回
    return workflowNodes.value
  }

  // 获取所有数据
  const getAllData = () => {
    return {
      reviewers: reviewers.value,
      timePoints: timePoints.value,
      workflowNodes: workflowNodes.value,
    }
  }

  return {
    reviewers,
    timePoints,
    workflowNodes,
    getTimePoints,
    getTimePointIndex,
    getTimePointDate,
    getReviewerIndex,
    getReviewer,
    getNodeById,
    getNodesSequence,
    getAllData,
  }
}
