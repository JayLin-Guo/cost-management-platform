// 动画配置
export const ANIMATION_CONFIG = {
  SPEED: 2,                    // 动画速度
  SMOOTH_STEPS: 15,           // 平滑步数
  FRAME_THRESHOLD: 0.5,       // 帧阈值
  MAX_DEPTH: 30,              // 最大递归深度
  PULSE_DURATION: '2s'        // 脉冲动画持续时间
} as const;

// 连接线配置
export const CONNECTION_CONFIG = {
  DEFAULT_COLOR: '#3aa0ff',   // 默认颜色
  DEFAULT_WIDTH: 1.5,         // 默认宽度
  OFFSET_AMOUNT: 20,          // 偏移量
  GLOW_OFFSET: 2,             // 发光偏移
  DASH_PATTERN: '5,3'         // 虚线模式
} as const;

// 节点配置
export const NODE_CONFIG = {
  MIN_WIDTH: 120,             // 最小宽度
  MIN_HEIGHT: 60,             // 最小高度
  CORNER_SIZE: 6,             // 角标大小
  BORDER_WIDTH: 2,            // 边框宽度
  ANIMATION_SCALE: 1.1        // 动画缩放比例
} as const;

// 颜色主题
export const THEME_COLORS = {
  PRIMARY: '#3aa0ff',         // 主色调
  SECONDARY: '#ff3aff',       // 次要色调
  ACCENT: '#ff8c16',          // 强调色（橙色）
  SUCCESS: '#22c55e',         // 成功色（绿色）
  WARNING: '#f59e0b',         // 警告色（黄色）
  ERROR: '#ef4444',           // 错误色（红色）
  BACKGROUND: '#061525',      // 背景色
  SURFACE: 'rgba(12, 30, 56, 0.7)',  // 表面色
  SURFACE_LIGHT: 'rgba(12, 30, 56, 0.9)',  // 浅表面色
  TEXT_PRIMARY: '#fff',       // 主要文字色
  TEXT_SECONDARY: 'rgba(224, 240, 255, 0.7)',  // 次要文字色
  TEXT_MUTED: 'rgba(255, 255, 255, 0.6)',     // 静音文字色
  BORDER: 'rgba(58, 160, 255, 0.3)',  // 边框色
  BORDER_LIGHT: 'rgba(58, 160, 255, 0.2)',  // 浅边框色
  GLOW: 'rgba(58, 160, 255, 0.2)',     // 发光色
  GLOW_STRONG: 'rgba(58, 160, 255, 0.5)'  // 强发光色
} as const;

// 头部配置
export const HEADER_CONFIG = {
  HEIGHT: 80,                 // 头部高度
  HEIGHT_MOBILE: 120,         // 移动端头部高度
  ICON_SIZE: 48,              // 图标大小
  ICON_SIZE_MOBILE: 40,       // 移动端图标大小
  TITLE_SIZE: 24,             // 标题字体大小
  TITLE_SIZE_MOBILE: 18,      // 移动端标题字体大小
  SUBTITLE_SIZE: 14,          // 副标题字体大小
  SUBTITLE_SIZE_MOBILE: 12,   // 移动端副标题字体大小
  PADDING: 24,                // 内边距
  PADDING_MOBILE: 16          // 移动端内边距
} as const;

// 布局配置
export const LAYOUT_CONFIG = {
  CELL_MIN_WIDTH: 140,        // 单元格最小宽度
  CELL_MIN_WIDTH_MOBILE: 100, // 移动端单元格最小宽度
  CELL_HEIGHT: 100,           // 单元格高度
  CELL_HEIGHT_MOBILE: 80,     // 移动端单元格高度
  HEADER_CELL_HEIGHT: 70,     // 表头单元格高度
  HEADER_CELL_HEIGHT_MOBILE: 60, // 移动端表头单元格高度
  USER_CELL_WIDTH: 160,       // 用户单元格宽度
  USER_CELL_WIDTH_MOBILE: 120, // 移动端用户单元格宽度
  BORDER_SPACING: 12,         // 边框间距
  BORDER_SPACING_MOBILE: 8,   // 移动端边框间距
  GRID_SIZE: 20,              // 网格大小
  CORNER_SIZE: 10,            // 角标大小
  CORNER_SIZE_MOBILE: 8       // 移动端角标大小
} as const;

// Z-Index 层级
export const Z_INDEX = {
  BACKGROUND: 0,              // 背景层
  CONNECTIONS: 1,             // 连接线层
  TABLE: 1,                   // 表格层
  NODES: 2,                   // 节点层
  CORNERS: 3,                 // 角标层
  ANIMATION: 5,               // 动画层
  CONTROLS: 5,                // 控制层
  HEADER: 10,                 // 头部层
  LOADING: 15                 // 加载层
} as const;

// 事件配置
export const EVENT_CONFIG = {
  RESIZE_DEBOUNCE: 300,       // 窗口调整防抖时间
  SCROLL_THROTTLE: 100,       // 滚动节流时间
  ANIMATION_FRAME_RATE: 60,   // 动画帧率
  HOVER_DELAY: 200,           // 悬停延迟
  TRANSITION_DURATION: 300    // 过渡动画持续时间
} as const;

// 响应式断点
export const BREAKPOINTS = {
  MOBILE: 768,                // 移动端断点
  TABLET: 1024,               // 平板断点
  DESKTOP: 1200,              // 桌面端断点
  LARGE_DESKTOP: 1440         // 大屏桌面端断点
} as const;

// 动画缓动函数
export const EASING = {
  EASE_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
  EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
} as const; 