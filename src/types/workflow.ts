/**
 * 工作流相关类型定义
 */

// 连接类型
export interface Connection {
  id: string
  from: string
  to: string
  targetId?: string
  type: 'data' | 'control' | 'dependency'
  status: 'active' | 'inactive' | 'error'
  style?: ConnectionStyle
  label: string
  actionSequence: number
  actionTime: string
  isModified: boolean
  lastModifiedTime: string
  modificationCount: number
  hasBeenVisited: boolean
  currentVisualState: 'default' | 'active' | 'completed' | 'rejected'
  
  // 可选字段
  canContinueAfterReject?: boolean
  isWorkflowEnd?: boolean
  endType?: 'success' | 'cancelled' | 'failed'
  finalResult?: string
}

// 右侧操作按钮
export interface RightAction {
  label: string
  action: string
}

// 工作流节点
export interface WorkflowNode {
  id: string
  title: string
  status: 'pending' | 'completed' | 'approved' | 'rejected'
  type?: string
  reviewerId: string
  timePointId: string
  createdAt: string
  fileId: string
  stateInfo: string
  connections: Connection[]
  rightAction: RightAction[]
  nodeType: 'start' | 'normal' | 'milestone' | 'end'
  timeSequence: number
  positionInDay: number
  timeDetail: string
  isModified: boolean
  lastModifiedTime: string
  modificationCount: number
  hasBeenVisited: boolean
  currentVisualState: 'default' | 'active' | 'completed' | 'rejected'
  position?: NodePosition
  data?: any
  
  // 可选字段
  canContinueAfterReject?: boolean
  isWorkflowEnd?: boolean
  endType?: 'success' | 'cancelled' | 'failed'
  finalResult?: string
}

// 时间点
export interface TimePoint {
  id: string
  date: string
  label: string
  isInterval: boolean
  displayWidth: number
  hasNodes: boolean
  nodeCount: number
  isEndPoint: boolean
}

// 审核人员
export interface Reviewer {
  id: string
  name: string
  role: string
  department: string
  status?: 'online' | 'busy' | 'offline'
  phone?: string
  email?: string
  avatar?: string
  position: number
}

// 文件信息
export interface FileInfo {
  id: string
  name: string
  size: number
  type: string
  createdAt: string
  updatedAt?: string
  url?: string
  path?: string
  uploadTime: string
  version: string
  description: string
  contents?: string[]
}

// 连接线样式配置
export interface ConnectionStyle {
  type: 'vertical' | 'horizontal' | 'mixed'
  style: 'solid' | 'dashed' | 'dotted'
  color: string
}

// 连接线样式集合
export interface ConnectionStyles {
  sameDay: ConnectionStyle
  crossDay: ConnectionStyle
  reject: ConnectionStyle
  reprocess: ConnectionStyle
}

// 跨日连接路径
export interface CrossDayPath {
  from: string
  to: string
  path: string[]
}

// 路径验证结果
export interface PathValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// 工作流完整数据
export interface WorkflowData {
  timePoints: TimePoint[]
  workflowNodes: WorkflowNode[]
  reviewers: Reviewer[]
  files: FileInfo[]
}

// 动画控制器配置
export interface AnimationConfig {
  duration: number
  delay: number
  easing: string
  autoPlay: boolean
  loop: boolean
}

// 节点位置信息
export interface NodePosition {
  x: number
  y: number
  z: number
}

// 3D场景配置
export interface SceneConfig {
  camera: {
    position: { x: number; y: number; z: number }
    target: { x: number; y: number; z: number }
  }
  lighting: {
    ambient: { color: string; intensity: number }
    directional: { color: string; intensity: number; position: { x: number; y: number; z: number } }
  }
  background: string
} 