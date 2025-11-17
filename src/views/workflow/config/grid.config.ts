/**
 * 工作流网格配置
 * 定义棋盘的基准单位和布局参数
 */

/**
 * 网格基础配置
 */
export const GRID_CONFIG = {
  // ========== 基准单位 ==========
  DAY_BASE_UNIT: 100, // 每天的基准宽度（当 maxFlowCount = 1 时）
  NODE_GAP: 12, // 同一天内节点之间的水平间隙

  // ========== 行高 ==========
  MONTH_ROW_HEIGHT: 50, // 月份行高度
  DATE_ROW_HEIGHT: 80, // 日期行高度
  SWIMLANE_HEIGHT: 120, // 泳道高度
  SWIMLANE_LABEL_WIDTH: 120, // 泳道标签宽度

  // ========== 节点 ==========
  NODE_HEIGHT: 75, // 节点高度（减小，为连接线留空间）
  NODE_MIN_WIDTH: 120, // 节点最小宽度
  NODE_PADDING: 10, // 节点内边距
  NODE_WIDTH_RATIO: 0.8, // 节点宽度占日期格子的比例（留20%给连接线）

  // ========== 连线 ==========
  CONNECTION_WIDTH: 2, // 连线宽度
  ARROW_SIZE: 8, // 箭头大小

  // ========== 间距 ==========
  GRID_PADDING: 24, // 网格整体内边距
} as const

export type GridConfig = typeof GRID_CONFIG

/**
 * 计算某一天的实际宽度
 * @param maxFlowCount 该天水平方向最多并排几个节点
 */
export function getDayWidth(maxFlowCount: number): number {
  if (maxFlowCount <= 1) {
    return GRID_CONFIG.DAY_BASE_UNIT
  }
  // 宽度 = 基准宽度 * 节点数量 + 节点间隙 * (节点数量 - 1)
  return GRID_CONFIG.DAY_BASE_UNIT * maxFlowCount + GRID_CONFIG.NODE_GAP * (maxFlowCount - 1)
}

/**
 * 计算节点的实际宽度
 * @param dayCount 节点跨越的天数
 * @param maxFlowCount 节点所在天最大并排节点数
 */
export function getNodeWidth(dayCount: number, maxFlowCount: number): number {
  if (dayCount <= 0) return GRID_CONFIG.NODE_MIN_WIDTH

  // 单天节点：(总天宽度 - 总间隙) / maxFlowCount * 缩放比例
  if (dayCount === 1) {
    const totalDayWidth = getDayWidth(maxFlowCount)
    const totalGap = GRID_CONFIG.NODE_GAP * (maxFlowCount - 1)
    const fullWidth = (totalDayWidth - totalGap) / maxFlowCount
    return fullWidth * GRID_CONFIG.NODE_WIDTH_RATIO // 节点只占80%宽度
  }

  // 跨多天节点：简化处理
  return GRID_CONFIG.DAY_BASE_UNIT * dayCount * GRID_CONFIG.NODE_WIDTH_RATIO
}
