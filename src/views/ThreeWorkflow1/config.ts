import type { NodeRenderConfig, ConnectionRenderConfig, ColorConfig } from './types'

// 固定尺寸常量
export const FIXED_COLUMN_WIDTH = 140 // 固定列宽度（审核人员和文件状态列）
export const FIXED_ROW_HEIGHT = 180 // 固定行高度（审核区域行高）
export const FIXED_NODE_WIDTH = 100 // 固定节点宽度，增大尺寸以便显示更多文字
export const FIXED_NODE_HEIGHT = 50 // 固定节点高度，增加高度以便更好地显示内容
export const FIXED_NODE_DEPTH = 50 // 固定节点深度，保证足够空间显示文字
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
  }
}

// 默认场景配置
export const DEFAULT_CONFIG = {
  backgroundColor: COLORS.background,
  fixedColumnWidth: FIXED_COLUMN_WIDTH,
  fixedRowHeight: FIXED_ROW_HEIGHT,
  fixedNodeSize: FIXED_NODE_WIDTH,
  cellWidth: 340, // 每个时间单元格的水平宽度
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
    y: FIXED_NODE_WIDTH / 2,
    opacity: 1.0,
    metalness: 0.3,
    roughness: 0.5,
    labelOffsetY: FIXED_NODE_WIDTH,
  },
  virtual: {
    width: FIXED_NODE_WIDTH,
    height: FIXED_NODE_HEIGHT,
    depth: FIXED_NODE_DEPTH,
    y: FIXED_NODE_WIDTH / 2,
    opacity: 0.6,
    metalness: 0.5,
    roughness: 0.6,
    labelOffsetY: FIXED_NODE_WIDTH,
  },
  actual: {
    width: FIXED_NODE_WIDTH,
    height: FIXED_NODE_HEIGHT,
    depth: FIXED_NODE_DEPTH,
    y: FIXED_NODE_WIDTH / 2,
    opacity: 1.0,
    metalness: 0.3,
    roughness: 0.5,
    labelOffsetY: FIXED_NODE_WIDTH,
  },
  end: {
    width: FIXED_NODE_WIDTH,
    height: FIXED_NODE_HEIGHT,
    depth: FIXED_NODE_DEPTH,
    y: FIXED_NODE_WIDTH / 2,
    opacity: 1.0,
    metalness: 0.3,
    roughness: 0.5,
    labelOffsetY: FIXED_NODE_WIDTH,
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