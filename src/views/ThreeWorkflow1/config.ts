import type { NodeRenderConfig, ConnectionRenderConfig, ColorConfig, AnimationConfig } from './types'

// 固定尺寸常量
export const FIXED_COLUMN_WIDTH = 140 // 固定列宽度（审核人员和文件状态列）
export const FIXED_ROW_HEIGHT = 180 // 固定行高度（审核区域行高）
export const FIXED_NODE_WIDTH = 100 // 固定节点宽度，从120减小到100
export const FIXED_NODE_HEIGHT = 15 // 固定节点高度，显著减小高度使节点更矮
export const FIXED_NODE_DEPTH = 50 // 固定节点深度，从60减小到50
export const FIXED_TIMELINE_HEIGHT = 30 // 时间轴3D长方体的物理高度（Y轴方向厚度）
export const FIXED_TIMELINE_DEPTH = 45 // 时间轴3D长方体的Z轴宽度（深度）
export const FIXED_CELL_HEIGHT = 40 // 时间轴贴图单元格的视觉高度（控制文字和背景显示区域）

// 字体常量
export const FONT_HEADER = 'bold 18px Microsoft YaHei' // 标题字体
export const FONT_CELL = 'bold 16px Microsoft YaHei' // 单元格字体

// 颜色配置
export const COLORS: ColorConfig = {
  background: 0x14204e, // 深蓝色背景
  timelineBar: 0x1e2a5c, // 稍微亮一点的深蓝色，增强时间轴的可见度
  timelineText: '#ffffff', // 时间轴文字颜色 - 纯白色
  timelineShadow: 'rgba(0, 0, 0, 0.5)', // 时间轴文字阴影颜色
  timelineBorder: '#4a5a8a', // 时间轴边框颜色
  timelineHeaderBg: 'rgba(50, 50, 80, 0.9)', // 时间轴标题背景色
  timelineCellBg: {
    interval: 'rgba(60, 70, 100, 0.5)', // 间隔单元格背景色
    even: 'rgba(45, 55, 85, 0.5)',      // 偶数单元格背景色
    odd: 'rgba(35, 45, 75, 0.5)',       // 奇数单元格背景色
  },
  nodeColors: {
    main: {
      pass: 0x4caf50, // 绿色
      reject: 0xf44336, // 红色
      pending: 0x9e9e9e, // 灰色
    },
    retry: {
      pass: 0xffc107, // 黄色
      reject: 0xf44336, // 红色
      pending: 0x9e9e9e, // 灰色
    },
  },
  // 动画颜色
  animation: {
    teleportNode: 0x9c27b0, // 紫色瞬移节点
    teleportEdge: 0xff00ff, // 亮紫色边缘
    teleportEmissive: 0xd500f9, // 亮紫色发光
    electricArc: 0x00aaff, // 电弧颜色
    electricParticle: 0x00ffff, // 电弧粒子颜色
    highlightRing: 0x9c27b0, // 高亮环颜色
    highlightSphere: 0x9c27b0, // 高亮球颜色
  }
}

// 默认场景配置
export const DEFAULT_CONFIG = {
  backgroundColor: COLORS.background,
  fixedColumnWidth: FIXED_COLUMN_WIDTH,
  fixedRowHeight: FIXED_ROW_HEIGHT,
  fixedNodeSize: FIXED_NODE_WIDTH,
  cellWidth: 450, // 每个时间单元格的水平宽度，从380增加到450
  cellHeight: FIXED_CELL_HEIGHT, // 时间轴贴图的高度（Canvas高度，控制文字显示区域）
  timelineHeight: FIXED_TIMELINE_HEIGHT, // 时间轴3D长方体的物理高度（Y轴厚度）
  timelineDepth: FIXED_TIMELINE_DEPTH, // 时间轴3D长方体的Z轴宽度（深度）
  reviewerColumnWidth: FIXED_COLUMN_WIDTH, // 审核人员列宽度(第一列)
  fileUploadColumnWidth: FIXED_COLUMN_WIDTH, // 未上传文件列宽度(第二列)
  leftOffset: FIXED_COLUMN_WIDTH * 2, // 左侧偏移固定值，等于两个固定列的宽度和
  reviewAreaDepth: 400, // 审核区域深度
  timelineBarColor: COLORS.timelineBar,
  reviewRowHeight: FIXED_ROW_HEIGHT, // 审核区域行高
  nodeSpacing: 80, // 同一单元格内节点之间的间距
}

// 节点渲染配置
export const NODE_CONFIGS: Record<string, NodeRenderConfig> = {
  start: {
    width: FIXED_NODE_WIDTH,
    height: FIXED_NODE_HEIGHT,
    depth: FIXED_NODE_DEPTH,
    y: FIXED_NODE_HEIGHT / 2,
    opacity: 1.0,
    metalness: 0.3,
    roughness: 0.5,
    labelOffsetY: FIXED_NODE_HEIGHT + 5,
  },
  virtual: {
    width: FIXED_NODE_WIDTH,
    height: FIXED_NODE_HEIGHT,
    depth: FIXED_NODE_DEPTH,
    y: FIXED_NODE_HEIGHT / 2,
    opacity: 0.6,
    metalness: 0.5,
    roughness: 0.6,
    labelOffsetY: FIXED_NODE_HEIGHT + 5,
  },
  actual: {
    width: FIXED_NODE_WIDTH,
    height: FIXED_NODE_HEIGHT,
    depth: FIXED_NODE_DEPTH,
    y: FIXED_NODE_HEIGHT / 2,
    opacity: 1.0,
    metalness: 0.3,
    roughness: 0.5,
    labelOffsetY: FIXED_NODE_HEIGHT + 5,
  },
  end: {
    width: FIXED_NODE_WIDTH,
    height: FIXED_NODE_HEIGHT,
    depth: FIXED_NODE_DEPTH,
    y: FIXED_NODE_HEIGHT / 2,
    opacity: 1.0,
    metalness: 0.3,
    roughness: 0.5,
    labelOffsetY: FIXED_NODE_HEIGHT + 5,
  },
}

// 连接线配置
export const CONNECTION_CONFIGS: Record<'solid' | 'dashed', ConnectionRenderConfig> = {
  solid: {
    lineWidth: 2,
    arrowSize: 5,
    arrowLength: 10,
    labelOffsetY: 15,
  },
  dashed: {
    lineWidth: 2,
    dashSize: 3,
    gapSize: 2,
    arrowSize: 5,
    arrowLength: 10,
    labelOffsetY: 15,
  },
}

// 动画配置
export const ANIMATION_CONFIG: AnimationConfig = {
  // 瞬移节点动画
  teleport: {
    interval: 3, // 瞬移间隔(秒)
    nodeHeight: FIXED_NODE_HEIGHT + 2, // 瞬移节点悬浮高度
    distance: 5, // 每次瞬移的步长
    floatSpeed: 0.002, // 悬浮效果速度
    floatAmount: 0.5, // 悬浮效果幅度
    pulseSpeed: 0.003, // 脉冲效果速度
    pulseAmount: 0.3, // 脉冲效果幅度
    nodeWidthScale: 1.0, // 瞬移节点宽度比例
    nodeHeightScale: 0.1, // 瞬移节点高度比例
    nodeDepthScale: 1.0, // 瞬移节点深度比例
    matchThreshold: 5, // 节点位置匹配阈值
    slowdownFactor: 1.6, // 节点位置减速系数
    normalInterval: 0.3, // 正常移动间隔
    // 新增配置参数
    speedFactor: 0.5, // 动画速度因子，值越大越慢，1.0为正常速度
    nodeStayRatio: 0.5, // 节点位置停留时间比例
    labelStayRatio: 0.3, // 标签位置停留时间比例
    positionThreshold: 10, // 位置接近的阈值
    renderOrder: {
      teleportNode: 100, // 瞬移节点的渲染顺序
      teleportEdge: 101, // 瞬移节点边缘的渲染顺序
      label: 10, // 标签的渲染顺序
    },
    sizeScale: {
      width: 1.2, // 瞬移节点宽度放大比例
      height: 1.5, // 瞬移节点高度放大比例
      depth: 1.2, // 瞬移节点深度放大比例
    },
    animation: {
      floatSpeedMultiplier: 1.5, // 浮动速度倍数
      floatAmountMultiplier: 1.2, // 浮动幅度倍数
      pulseSpeedMultiplier: 1.5, // 脉冲速度倍数
      pulseAmountMultiplier: 1.2, // 脉冲幅度倍数
    }
  },
  // 高亮动画
  highlight: {
    interval: 1.0, // 高亮间隔(秒)
    nodeHeight: FIXED_NODE_HEIGHT + 1, // 高亮节点悬浮高度
    ringInner: 15, // 环内径
    ringOuter: 18, // 环外径
    sphereSize: 5, // 球体大小
    pulseSpeed: 0.003, // 脉冲效果速度
    pulseAmount: 0.2, // 脉冲效果幅度
    scaleAmount: 0.3, // 缩放效果幅度
  },
  // 电弧效果
  electricArc: {
    particleCount: 6, // 粒子数量
    particleSize: 0.6, // 粒子大小
    arcCount: 60, // 电弧点数量
    baseSpeed: 0.1, // 基础速度
    speedVariation: 0.15, // 速度变化范围
    baseOpacity: 0.6, // 基础不透明度
    opacityVariation: 0.4, // 不透明度变化范围
    pulseSpeed: 0.5, // 脉冲速度
    pulseSpeedVariation: 0.5, // 脉冲速度变化范围
    pulseIntensity: 0.2, // 脉冲强度
    pulseIntensityVariation: 0.3, // 脉冲强度变化范围
    arcPulseSpeed: 0.3, // 电弧脉冲速度
    arcPulseAmount: 0.1, // 电弧脉冲幅度
  }
} 