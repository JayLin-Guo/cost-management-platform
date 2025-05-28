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
} 