// 场景配置接口
export interface SceneConfig {
  container: HTMLElement
  cssContainer: HTMLElement
}

// 节点渲染配置
export interface NodeRenderConfig {
  width: number
  height: number
  depth: number
  y: number
  opacity: number
  metalness: number
  roughness: number
  labelOffsetY: number
}

// 连接线渲染配置
export interface ConnectionRenderConfig {
  lineWidth: number
  dashSize?: number
  gapSize?: number
  arrowSize: number
  arrowLength: number
  labelOffsetY: number
}

// 节点渲染器场景配置
export interface NodeRendererConfig {
  cellWidth: number
  reviewRowHeight: number
  leftOffset: number
  nodeSpacing?: number
  reviewerColumnWidth?: number
  fileUploadColumnWidth?: number
  timelineDepth?: number
}

// 时间间隔接口
export interface TimeInterval {
  date: string
  label: string
  isInterval: boolean
  id?: string
}

// 动画颜色配置接口
export interface AnimationColorConfig {
  teleportNode: number // 瞬移节点颜色
  teleportEdge: number // 瞬移节点边缘颜色
  teleportEmissive: number // 瞬移节点发光颜色
  electricArc: number // 电弧颜色
  electricParticle: number // 电弧粒子颜色
  highlightRing: number // 高亮环颜色
  highlightSphere: number // 高亮球颜色
}

// 瞬移动画配置接口
export interface TeleportAnimationConfig {
  interval: number // 瞬移间隔(秒)
  nodeHeight: number // 瞬移节点悬浮高度
  distance: number // 每次瞬移的步长
  floatSpeed: number // 悬浮效果速度
  floatAmount: number // 悬浮效果幅度
  pulseSpeed: number // 脉冲效果速度
  pulseAmount: number // 脉冲效果幅度
  nodeWidthScale: number // 瞬移节点宽度比例
  nodeHeightScale: number // 瞬移节点高度比例
  nodeDepthScale: number // 瞬移节点深度比例
  matchThreshold: number // 节点位置匹配阈值
  slowdownFactor: number // 节点位置减速系数
  normalInterval: number // 正常移动间隔
  speedFactor: number // 动画速度因子，值越大越慢，1.0为正常速度
  nodeStayRatio: number // 节点位置停留时间比例
  labelStayRatio: number // 标签位置停留时间比例
  positionThreshold: number // 位置接近的阈值
  renderOrder: {
    teleportNode: number // 瞬移节点的渲染顺序
    teleportEdge: number // 瞬移节点边缘的渲染顺序
    label: number // 标签的渲染顺序
  }
  sizeScale: {
    width: number // 瞬移节点宽度放大比例
    height: number // 瞬移节点高度放大比例
    depth: number // 瞬移节点深度放大比例
  }
  animation: {
    floatSpeedMultiplier: number // 浮动速度倍数
    floatAmountMultiplier: number // 浮动幅度倍数
    pulseSpeedMultiplier: number // 脉冲速度倍数
    pulseAmountMultiplier: number // 脉冲幅度倍数
  }
}

// 高亮动画配置接口
export interface HighlightAnimationConfig {
  interval: number // 高亮间隔(秒)
  nodeHeight: number // 高亮节点悬浮高度
  ringInner: number // 环内径
  ringOuter: number // 环外径
  sphereSize: number // 球体大小
  pulseSpeed: number // 脉冲效果速度
  pulseAmount: number // 脉冲效果幅度
  scaleAmount: number // 缩放效果幅度
}

// 电弧效果配置接口
export interface ElectricArcConfig {
  particleCount: number // 粒子数量
  particleSize: number // 粒子大小
  arcCount: number // 电弧点数量
  baseSpeed: number // 基础速度
  speedVariation: number // 速度变化范围
  baseOpacity: number // 基础不透明度
  opacityVariation: number // 不透明度变化范围
  pulseSpeed: number // 脉冲速度
  pulseSpeedVariation: number // 脉冲速度变化范围
  pulseIntensity: number // 脉冲强度
  pulseIntensityVariation: number // 脉冲强度变化范围
  arcPulseSpeed: number // 电弧脉冲速度
  arcPulseAmount: number // 电弧脉冲幅度
}

// 动画配置接口
export interface AnimationConfig {
  teleport: TeleportAnimationConfig
  highlight: HighlightAnimationConfig
  electricArc: ElectricArcConfig
}

// 颜色配置接口
export interface ColorConfig {
  background: number
  timelineBar: number
  timelineText: string // 时间轴文字颜色
  timelineShadow: string // 时间轴文字阴影颜色
  timelineBorder: string // 时间轴边框颜色
  timelineHeaderBg: string // 时间轴标题背景色
  timelineCellBg: {
    interval: string // 间隔单元格背景色
    even: string // 偶数单元格背景色
    odd: string // 奇数单元格背景色
  }
  nodeColors: {
    main: {
      pass: number
      reject: number
      pending: number
    }
    retry: {
      pass: number
      reject: number
      pending: number
    }
  }
  animation: AnimationColorConfig // 动画颜色配置
}

// 节点状态
export type NodeStatus = 'pending' | 'pass' | 'reject' | 'end'

// 节点类型
export type NodeType = 'reviewNode' | 'reviewStatus' | 'document' | 'milestone'

/**
 * 工作流节点数据结构
 * 用于表示工作流中的各个节点及其关系
 */
export interface WorkflowNode {
  /**
   * 节点唯一标识符
   * 用于在系统中唯一标识一个节点，通常格式为"nodeX"，其中X为数字
   */
  id: string

  /**
   * 节点类型
   * reviewNode: 审核节点 - 可以进行审核操作
   * reviewStatus: 审核状态 - 显示审核结果和状态信息
   * document: 文档节点 - 表示文档或文件
   * milestone: 里程碑节点 - 表示重要的时间节点
   */
  type: NodeType

  /**
   * 审核人ID
   * 关联到审核人数据，用于确定节点在Z轴上的位置
   * 对应reviewer数组中的某个审核人
   */
  reviewerId: string

  /**
   * 时间点ID
   * 关联到时间轴上的时间点，用于确定节点在X轴上的位置
   * 对应timePoints数组中的某个时间点
   */
  timePointId: string

  /**
   * 节点标题
   * 显示在节点上的主要文本信息
   * 通常包含文档名称和阶段信息
   */
  title: string

  /**
   * 节点状态
   * pass: 已通过审核的节点
   * pending: 待审核的节点
   * reject: 被驳回的节点
   * end: 结束状态的节点
   */
  status: NodeStatus

  /**
   * 状态信息文本
   * 显示在连接线上的文本，用于描述节点之间的关系或状态
   * 例如："提交一审"、"已通过"、"驳回"、"历时35天"等
   */
  stateInfo: string

  /**
   * 连接起始节点ID
   * 表示当前节点的连接从哪个节点开始
   * 通常是节点自身的ID，用于构建连接关系
   */
  from?: string

  /**
   * 连接目标节点ID
   * 表示当前节点连接到哪个节点
   * 用于构建节点之间的连接关系和流程走向
   */
  to?: string

  /**
   * 审核相关数据（仅当type为reviewNode时有效）
   */
  reviewData?: {
    files?: Array<{
      name: string
      url: string
      size?: string
      uploadTime?: string
      type?: string
    }>
    comments?: Array<{
      author: string
      content: string
      time: string
      type?: 'approve' | 'reject' | 'comment'
    }>
    deadline?: string // 审核截止时间
    priority?: 'low' | 'medium' | 'high' // 优先级
  }

  /**
   * 状态详情数据（仅当type为reviewStatus时有效）
   */
  statusData?: {
    duration?: string // 耗时
    result?: string // 审核结果
    reason?: string // 原因或备注
    timestamp?: string // 时间戳
  }
}
