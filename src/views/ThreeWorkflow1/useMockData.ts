import { ref } from 'vue'
import type { WorkflowNode, NodeStatus } from './types'

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
    { id: 'timePoint3', date: '2023-07-10', label: '7月10日' },
    { id: 'timePoint4', date: '2023-07-11', label: '7月11日' },
    { id: 'timePoint5', date: '2023-07-12', label: '7月12日' },
    { id: 'timePoint6', date: '2023-07-13', label: '7月13日' },
    // { id: 'timePoint7', date: '2023-07-14', label: '7月14日' },
    // { id: 'timePoint8', date: '2023-07-15', label: '7月15日' },
  ])

  // 工作流节点数据
  const workflowNodes = ref<WorkflowNode[]>([
    // 1. 张三创建初始节点（操作节点1）- 6月4日
    {
      id: 'node1',
      reviewerId: 'reviewer1', // 张三
      timePointId: 'timePoint1', // 6月4日
      title: '控制价\n初步成果文件',
      status: 'pass',
      stateInfo: '提交一审',
      from: 'node1', // 从自身开始
      to: 'node2', // 连接到李四节点
    },
    // 2. 李四的一审接收节点 - 6月4日
    {
      id: 'node2',
      reviewerId: 'reviewer2', // 李四（一审审核员）
      timePointId: 'timePoint1', // 6月4日（同一天接收）
      title: '控制价\n一审送审文件',
      status: 'pending',
      stateInfo: '历时35天',
      from: 'node2', // 从自己开始
      to: 'node4', // 连接到时间间隔节点
    },
    // 4. 李四的一审完成节点 - 7月9日
    {
      id: 'node4',
      reviewerId: 'reviewer2', // 李四
      timePointId: 'timePoint2', // 7月9日
      title: '控制价\n一审结果文件',
      status: 'pass',
      stateInfo: '提交二审',
      from: 'node4', // 从自己开始
      to: 'node5', // 连接到王五的接收节点
    },
    // 5. 王五的接收节点 - 7月9日
    {
      id: 'node5',
      reviewerId: 'reviewer3', // 王五
      timePointId: 'timePoint2', // 7月9日（同一天接收）
      title: '控制价\n二审送审文件',
      status: 'pending',
      stateInfo: '0天',
      from: 'node5', // 从自己开始
      to: 'node6', // 连接到王五的驳回节点
    },
    // 6. 王五的驳回节点 - 7月9日
    {
      id: 'node6',
      reviewerId: 'reviewer3', // 王五
      timePointId: 'timePoint2', // 7月9日
      title: '控制价\n二审送审文件',
      status: 'reject',
      stateInfo: '驳回',
      from: 'node6', // 从自己开始
      to: 'node7', // 连接到张三的最终节点
    },
    // 7. 张三的最终节点 - 7月9日
    {
      id: 'node7',
      reviewerId: 'reviewer2', // 张三
      timePointId: 'timePoint2', // 7月9日
      title: '控制价\n二审送审文件',
      status: 'end',
      stateInfo: '待修改',
      from: 'node7', // 从自己开始
      to: '',
    },
    {
      id: 'node8',
      reviewerId: 'reviewer2', // 张三
      timePointId: 'timePoint3', // 6月10日
      title: '控制价\n二审送审文件',
      status: 'pass',
      stateInfo: '提交二审',
      from: 'node1', // 从自身开始
      to: 'node9', // 连接到李四节点
    },
    {
      id: 'node9',
      reviewerId: 'reviewer3', // 张三
      timePointId: 'timePoint3', // 6月10日
      title: '控制价\n二审送审文件',
      status: 'pending',
      stateInfo: '历时1天',
      from: 'node9', // 从自身开始
      to: 'node10', // 连接到李四节点
    },
    {
      id: 'node10',
      reviewerId: 'reviewer3', // 张三
      timePointId: 'timePoint4', // 6月10日
      title: '控制价\n二审结果文件',
      status: 'pass',
      stateInfo: '提交三审',
      from: 'node10', // 从自身开始
      to: 'node11', // 连接到李四节点
    },
    {
      id: 'node11',
      reviewerId: 'reviewer4', // 张三
      timePointId: 'timePoint4', // 6月10日
      title: '控制价\n二审结果文件',
      status: 'pending',
      stateInfo: '历时1天',
      from: 'node11', // 从自身开始
      to: 'node12', // 连接到李四节点
    },
    {
      id: 'node12',
      reviewerId: 'reviewer4', // 张三
      timePointId: 'timePoint5', // 6月10日
      title: '控制价\n三审结果文件\n（最终成果文件）',
      status: 'end',
      stateInfo: '提交三审',
      from: 'node12', // 从自身开始
      to: '', // 连接到李四节点
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
