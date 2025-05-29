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
  timelineText: string  // 时间轴文字颜色
  timelineShadow: string // 时间轴文字阴影颜色
  timelineBorder: string // 时间轴边框颜色
  timelineHeaderBg: string // 时间轴标题背景色
  timelineCellBg: {
    interval: string    // 间隔单元格背景色
    even: string        // 偶数单元格背景色
    odd: string         // 奇数单元格背景色
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