/**
 * 工作流网格布局计算器
 * 根据后端数据计算棋盘的精确布局
 */

import type { TaskWorkflowData, Month, Day, WorkflowNode } from '@/api/workflow'
import type { GridConfig } from '../config/grid.config'
import { getDayWidth, getNodeWidth } from '../config/grid.config'

// ========== 计算结果类型 ==========

/**
 * 计算后的月份
 */
export interface CalculatedMonth extends Month {
  position: {
    x: number // X 坐标
    width: number // 宽度
  }
}

/**
 * 计算后的日期
 */
export interface CalculatedDay extends Day {
  position: {
    x: number // X 坐标
    width: number // 宽度
  }
}

/**
 * 计算后的泳道
 */
export interface CalculatedSwimlane {
  id: string
  userName: string
  role: string
  position: {
    y: number // Y 坐标
    height: number // 高度
  }
}

/**
 * 计算后的节点
 */
export interface CalculatedNode extends WorkflowNode {
  position: {
    x: number // X 坐标
    y: number // Y 坐标（相对于泳道）
    width: number // 宽度
    height: number // 高度
    columnIndex: number // 在当天的第几列（从 0 开始）
  }
  style: {
    backgroundColor: string
    borderColor: string
    textColor: string
    icon: string
  }
}

/**
 * 网格计算结果
 */
export interface GridLayoutData {
  months: CalculatedMonth[]
  days: CalculatedDay[]
  swimlanes: CalculatedSwimlane[]
  nodes: CalculatedNode[]
  totalWidth: number
  totalHeight: number
}

/**
 * 网格布局计算器
 * @param data 后端返回的原始数据
 * @param config 网格配置
 */
export function useGridCalculator(data: TaskWorkflowData, config: GridConfig): GridLayoutData {
  // ========== 1. 计算日期列 ==========
  const calculatedDays: CalculatedDay[] = []
  let currentX = 0

  data.months.forEach((month) => {
    month.days.forEach((day) => {
      const width = getDayWidth(day.maxFlowCount)

      calculatedDays.push({
        ...day,
        position: {
          x: currentX,
          width: width,
        },
      })

      currentX += width
    })
  })

  // ========== 2. 计算月份块 ==========
  const calculatedMonths: CalculatedMonth[] = []

  data.months.forEach((month) => {
    // 找到该月第一天和最后一天在 calculatedDays 中的位置
    const firstDay = calculatedDays.find((d) => d.date === month.days[0].date)
    const lastDay = calculatedDays.find((d) => d.date === month.days[month.days.length - 1].date)

    if (firstDay && lastDay) {
      const x = firstDay.position.x
      const width = lastDay.position.x + lastDay.position.width - x

      calculatedMonths.push({
        ...month,
        position: { x, width },
      })
    }
  })

  // ========== 3. 计算泳道 ==========
  const headerHeight = config.MONTH_ROW_HEIGHT + config.DATE_ROW_HEIGHT

  const calculatedSwimlanes: CalculatedSwimlane[] = data.users.map((user, index) => ({
    id: user.id,
    userName: user.name,
    role: user.role,
    position: {
      y: headerHeight + index * config.SWIMLANE_HEIGHT,
      height: config.SWIMLANE_HEIGHT,
    },
  }))

  // ========== 4. 计算节点 ==========
  const calculatedNodes: CalculatedNode[] = []

  // 辅助函数：根据日期获取日期索引
  const getDayIndex = (date: string): number => {
    return calculatedDays.findIndex((d) => d.date === date)
  }

  // 按泳道分组节点
  const nodesBySwimlane = new Map<string, WorkflowNode[]>()
  data.nodes.forEach((node) => {
    if (!nodesBySwimlane.has(node.swimlaneId)) {
      nodesBySwimlane.set(node.swimlaneId, [])
    }
    nodesBySwimlane.get(node.swimlaneId)!.push(node)
  })

  // 遍历每个泳道的节点
  nodesBySwimlane.forEach((nodes) => {
    // 按 sortOrder 排序
    const sortedNodes = [...nodes].sort((a, b) => a.sortOrder - b.sortOrder)

    sortedNodes.forEach((node) => {
      const startDayIndex = getDayIndex(node.startDate)
      const endDayIndex = getDayIndex(node.endDate)

      if (startDayIndex === -1 || endDayIndex === -1) {
        console.warn(`节点 ${node.id} 的日期超出范围`)
        return
      }

      // 获取节点跨越的所有日期
      const coveredDays = calculatedDays.slice(startDayIndex, endDayIndex + 1)
      const startX = coveredDays[0].position.x

      // 计算该节点所在位置的 maxFlowCount（取最大值）
      const maxFlowCount = Math.max(...coveredDays.map((d) => d.maxFlowCount))
      const dayCount = coveredDays.length

      // 计算节点宽度（已经乘以了 NODE_WIDTH_RATIO）
      const nodeWidth = getNodeWidth(dayCount, maxFlowCount)

      // 找出与当前节点在同一泳道且时间重叠的其他节点
      const overlappingNodes = sortedNodes.filter((other) => {
        if (other.id === node.id) return false
        const otherStart = getDayIndex(other.startDate)
        const otherEnd = getDayIndex(other.endDate)
        return !(endDayIndex < otherStart || startDayIndex > otherEnd)
      })

      // 所有重叠节点（包括当前节点）按 sortOrder 排序
      const allNodesInRange = [node, ...overlappingNodes].sort((a, b) => a.sortOrder - b.sortOrder)
      const columnIndex = allNodesInRange.findIndex((n) => n.id === node.id)

      // 计算完整格子宽度（用于居中偏移）
      const fullCellWidth =
        dayCount === 1
          ? (getDayWidth(maxFlowCount) - config.NODE_GAP * (maxFlowCount - 1)) / maxFlowCount
          : config.DAY_BASE_UNIT * dayCount

      // 计算居中偏移（让节点在格子内水平居中）
      const centerOffset = (fullCellWidth - nodeWidth) / 2

      // 计算节点的 X 坐标（考虑列索引、间隙和居中偏移）
      const nodeX = startX + columnIndex * (fullCellWidth + config.NODE_GAP) + centerOffset

      // 计算节点的 Y 坐标（靠上显示，为底部连接线留空间）
      const nodeY = (config.SWIMLANE_HEIGHT - config.NODE_HEIGHT) / 3

      // 获取节点样式
      const style = getNodeStyle(node.status, node.type, node.revisionLevel)

      calculatedNodes.push({
        ...node,
        position: {
          x: nodeX,
          y: nodeY,
          width: nodeWidth,
          height: config.NODE_HEIGHT,
          columnIndex,
        },
        style,
      })
    })
  })

  // ========== 5. 计算总尺寸 ==========
  const totalWidth = currentX
  const totalHeight = headerHeight + data.users.length * config.SWIMLANE_HEIGHT

  return {
    months: calculatedMonths,
    days: calculatedDays,
    swimlanes: calculatedSwimlanes,
    nodes: calculatedNodes,
    totalWidth,
    totalHeight,
  }
}

/**
 * 获取节点样式
 * @param status 节点状态
 * @param type 节点类型
 * @param revisionLevel 修订级别（0=原始, 1=一次修订, 2=二次修订, 3+=多次修订）
 */
function getNodeStyle(
  status: string,
  type: string,
  revisionLevel: number,
): {
  backgroundColor: string
  borderColor: string
  textColor: string
  icon: string
} {
  // 颜色配置（完全根据修订级别，与节点类型无关）
  const colorsByRevisionLevel = [
    // revisionLevel 0: 原始版本 - 浅蓝色
    {
      backgroundColor: 'rgba(64, 158, 255, 0.1)',
      borderColor: '#409eff',
      textColor: '#409eff',
    },
    // revisionLevel 1: 一次修订 - 浅橙色
    {
      backgroundColor: 'rgba(230, 162, 60, 0.12)',
      borderColor: '#e6a23c',
      textColor: '#e6a23c',
    },
    // revisionLevel 2: 二次修订 - 浅紫色
    {
      backgroundColor: 'rgba(155, 89, 182, 0.15)',
      borderColor: '#9b59b6',
      textColor: '#9b59b6',
    },
    // revisionLevel 3+: 多次修订 - 浅红色
    {
      backgroundColor: 'rgba(245, 108, 108, 0.18)',
      borderColor: '#f56c6c',
      textColor: '#f56c6c',
    },
  ]

  // 获取节点图标（根据节点类型）
  const iconMap: Record<string, string> = {
    initial_file: 'DocumentAdd',
    submit_review: 'Position',
    reject: 'Close',
    rework: 'Edit',
    approved: 'CircleCheck',
    placeholder: 'Document',
  }

  // 获取颜色配置（根据修订级别）
  const level = Math.min(revisionLevel, colorsByRevisionLevel.length - 1)
  const colorConfig = colorsByRevisionLevel[level]

  // 根据状态调整透明度
  let backgroundColor = colorConfig.backgroundColor
  if (status === 'pending') {
    // pending 状态：降低透明度
    backgroundColor = backgroundColor.replace(/0\.\d+/, '0.05')
  } else if (status === 'in_progress') {
    // in_progress 状态：提高透明度
    const currentOpacity = parseFloat(backgroundColor.match(/0\.\d+/)?.[0] || '0.1')
    backgroundColor = backgroundColor.replace(/0\.\d+/, String(currentOpacity + 0.05))
  }

  return {
    ...colorConfig,
    backgroundColor,
    icon: iconMap[type] || 'Document',
  }
}
