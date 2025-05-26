import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import type { WorkflowNode, WorkflowConnection, NodeType, FlowType } from './useMockData'

// 节点渲染配置
interface NodeRenderConfig {
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
interface ConnectionRenderConfig {
  lineWidth: number
  dashSize?: number
  gapSize?: number
  arrowSize: number
  arrowLength: number
  labelOffsetY: number
}

// 场景配置
interface SceneConfig {
  cellWidth: number
  reviewRowHeight: number
  leftOffset: number
  nodeSpacing?: number
  reviewerColumnWidth?: number
  fileUploadColumnWidth?: number
}

/**
 * 工作流节点渲染器
 * 负责将节点和连接线数据转换为Three.js对象
 */
export default class WorkflowNodeRenderer {
  private scene: THREE.Scene
  private nodeGroup: THREE.Group
  private config: SceneConfig
  private timeIntervals: { date: string; label: string; isInterval: boolean; id?: string }[]
  private nodesMap: Map<string, WorkflowNode> = new Map() // 存储节点ID到节点对象的映射

  // 节点配置
  private nodeConfigs: Record<NodeType, NodeRenderConfig> = {
    start: {
      width: 32,
      height: 32,
      depth: 32,
      y: 16,
      opacity: 1.0,
      metalness: 0.3,
      roughness: 0.5,
      labelOffsetY: 32,
    },
    virtual: {
      width: 32,
      height: 32,
      depth: 32,
      y: 16,
      opacity: 0.6,
      metalness: 0.5,
      roughness: 0.6,
      labelOffsetY: 32,
    },
    actual: {
      width: 32,
      height: 32,
      depth: 32,
      y: 16,
      opacity: 1.0,
      metalness: 0.3,
      roughness: 0.5,
      labelOffsetY: 32,
    },
    end: {
      width: 32,
      height: 32,
      depth: 32,
      y: 16,
      opacity: 1.0,
      metalness: 0.3,
      roughness: 0.5,
      labelOffsetY: 32,
    },
  }

  // 连接线配置
  private connectionConfigs: Record<'solid' | 'dashed', ConnectionRenderConfig> = {
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

  // 颜色配置
  private colorConfigs = {
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

  /**
   * 构造函数
   * @param scene Three.js场景
   * @param nodeGroup 节点组
   * @param config 场景配置
   * @param timeIntervals 时间间隔数据
   * @param getReviewer 获取审核人的方法
   */
  constructor(
    scene: THREE.Scene,
    nodeGroup: THREE.Group,
    config: SceneConfig,
    timeIntervals: { date: string; label: string; isInterval: boolean; id?: string }[],
    private getReviewer: (reviewerId: string) => any,
  ) {
    this.scene = scene
    this.nodeGroup = nodeGroup
    this.config = config
    this.timeIntervals = timeIntervals
  }

  /**
   * 获取颜色配置
   * @param flowType 流程类型
   * @param status 状态
   * @returns 颜色值
   */
  private getColor(flowType: FlowType, status: string): number {
    return this.colorConfigs[flowType][status as keyof typeof this.colorConfigs.main]
  }

  /**
   * 根据日期获取时间点索引
   * @param date 日期
   * @returns 索引值
   */
  private getTimeIndex(date: string): number {
    return this.timeIntervals.findIndex((t) => !t.isInterval && t.date === date)
  }

  /**
   * 获取时间间隔位置
   * @param timeInterval 时间间隔对象
   * @param index 索引
   * @returns X坐标位置
   */
  private getTimeIntervalPosition(
    timeInterval: { date: string; label: string; isInterval: boolean; id?: string },
    index: number,
  ): number {
    console.log(`计算时间间隔位置: 索引=${index}, id=${timeInterval.id}, date=${timeInterval.date}`)
    const position = this.config.leftOffset + index * this.config.cellWidth
    console.log(`  计算的位置: ${position}`)
    return position
  }

  /**
   * 获取节点X坐标
   * @param timePointId 时间点ID
   * @param nodeId 节点ID，用于在同一时间点内区分位置
   * @returns X坐标
   */
  private getNodeX(timePointId: string, nodeId: string): number {
    console.log(`查找时间点位置: ${timePointId}, 节点ID: ${nodeId}`)

    // 查找时间点在时间间隔数组中的索引
    const timePointIndex = this.timeIntervals.findIndex(
      (interval) => interval.date === timePointId || interval.id === timePointId,
    )

    console.log(`时间点索引: ${timePointIndex}`)

    // 如果找不到索引，使用左侧偏移
    if (timePointIndex === -1) {
      console.warn(`找不到时间点: ${timePointId}，使用默认位置`)
      return this.config.leftOffset
    }

    // 计算基础X坐标 - 时间点单元格的左边界位置
    const baseX = this.config.leftOffset + timePointIndex * this.config.cellWidth

    // 添加固定的左侧边距，让节点不要紧贴格子边缘
    const leftMargin = 20

    // 获取节点编号
    const match = nodeId.match(/node(\d+)/)
    if (!match) {
      return baseX + leftMargin
    }

    const nodeNumber = parseInt(match[1])

    // 对于最后一个时间点(7月9日)的节点，我们需要调整布局
    // 这里有4个节点（4、5、6、7），需要在单元格内合理分布
    if (timePointId === 'timePoint2') {
      // 单元格可用宽度（减去左右边距）
      const availableWidth = this.config.cellWidth - 2 * leftMargin

      // 根据不同的节点ID分配不同的偏移百分比
      let offsetPercent = 0.5 // 默认居中

      switch (nodeId) {
        case 'node4': // 李四的一审完成节点
          offsetPercent = 0.25 // 位于单元格25%处
          break
        case 'node5': // 王五的接收节点
          offsetPercent = 0.25 // 位于单元格25%处
          break
        case 'node6': // 王五的驳回节点
          offsetPercent = 0.75 // 位于单元格75%处
          break
        case 'node7': // 张三的最终节点
          offsetPercent = 0.75 // 位于单元格75%处
          break
      }

      // 计算精确偏移位置
      const offsetX = leftMargin + availableWidth * offsetPercent
      const finalX = baseX + offsetX

      console.log(`特殊处理时间点2节点: ${nodeId}, 偏移百分比: ${offsetPercent}, 最终X: ${finalX}`)
      return finalX
    }

    // 对于第一个时间点(6月4日)的节点，让它们垂直对齐
    if (timePointId === 'timePoint1') {
      // 单元格的中心位置
      const cellCenter = this.config.cellWidth / 2
      const finalX = baseX + cellCenter - 16 // 16是节点宽度的一半(32/2)，使节点居中

      console.log(`特殊处理时间点1节点: ${nodeId}, 居中处理, 最终X: ${finalX}`)
      return finalX
    }

    // 一般情况：使用简单的规则计算偏移
    // 1. 将节点ID的数字部分作为唯一标识
    // 2. 取模4（假设每个单元格最多4个节点），得到在单元格内的相对位置
    // 3. 根据这个相对位置计算偏移量，但确保总偏移不会超出单元格
    const maxPositions = 4 // 每个单元格最多放4个节点
    const positionInCell = (nodeNumber - 1) % maxPositions

    // 可用于节点的宽度
    const availableWidth = this.config.cellWidth - 2 * leftMargin

    // 计算每个节点位置的偏移量，确保最后一个节点不会超出单元格边界
    const stepWidth = availableWidth / (maxPositions > 1 ? maxPositions - 1 : 1)
    const offsetX = leftMargin + positionInCell * stepWidth

    // 确保偏移不超过单元格宽度
    const boundedOffset = Math.min(offsetX, this.config.cellWidth - leftMargin - 32)

    const finalX = baseX + boundedOffset

    console.log(
      `节点位置在单元格内: ${positionInCell}/${maxPositions}, 偏移量: ${boundedOffset}, 最终X: ${finalX}`,
    )
    return finalX
  }

  /**
   * 获取节点Z坐标
   * @param reviewerPosition 审核人位置
   * @returns Z坐标位置
   */
  private getNodeZ(reviewerPosition: number): number {
    return (
      this.config.reviewRowHeight / 2 +
      reviewerPosition * this.config.reviewRowHeight +
      this.config.reviewRowHeight
    )
  }

  /**
   * 创建节点网格
   * @param node 节点数据
   * @param reviewerPosition 审核人位置
   * @returns Three.js网格对象
   */
  public createNodeMesh(node: WorkflowNode, reviewerPosition: number): THREE.Mesh {
    console.log(`创建节点网格: ID=${node.id}, 标题=${node.title}, 审核人位置=${reviewerPosition}`)

    // 获取节点配置
    const nodeConfig = this.nodeConfigs[node.type]
    console.log(`节点类型=${node.type}, 配置=`, nodeConfig)

    // 计算节点的位置
    const startX = this.getNodeX(node.timePointId, node.id)
    console.log(`节点起始 X 坐标=${startX} (基于时间点ID=${node.timePointId})`)

    // 固定节点尺寸为32*32的正方体
    const size = 32
    console.log(`节点尺寸=${size}`)

    // 计算节点的Z位置（对应审核人）
    const z = this.getNodeZ(reviewerPosition)
    console.log(`节点 Z 坐标=${z} (基于审核人位置=${reviewerPosition})`)

    // 创建立方体几何体
    const nodeGeometry = new THREE.BoxGeometry(size, size, size)
    console.log(`创建立方体几何体 - 尺寸=${size}`)

    // 获取节点颜色
    const nodeColor = this.getColor(node.flowType, node.status)
    console.log(
      `节点颜色=0x${nodeColor.toString(16)} (基于流程类型=${node.flowType}, 状态=${node.status})`,
    )

    // 创建节点材质
    const nodeMaterial = new THREE.MeshStandardMaterial({
      color: nodeColor,
      metalness: nodeConfig.metalness,
      roughness: nodeConfig.roughness,
      transparent: true,
      opacity: node.isVirtual ? 0.6 : nodeConfig.opacity,
    })

    // 创建节点网格
    const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial)

    // 设置节点位置
    nodeMesh.position.set(
      startX,
      size / 2, // Y轴高度为尺寸的一半
      z,
    )
    console.log(`最终节点位置: X=${startX}, Y=${size / 2}, Z=${z}`)

    // 设置节点的用户数据（用于点击交互）
    nodeMesh.userData = {
      type: 'workflowNode',
      nodeId: node.id,
      nodeData: node,
    }

    console.log(`节点网格创建完成: ID=${node.id}`)
    return nodeMesh
  }

  /**
   * 创建工作流节点
   * @param nodes 节点数组
   */
  public createNodesAndConnections(nodes: WorkflowNode[]): void {
    // 清空节点映射
    this.nodesMap.clear()

    console.log('开始创建节点，总节点数量:', nodes.length)

    // 创建所有节点
    nodes.forEach((node) => {
      // 检查节点是否可见，以及是否应该跳过在时间间隔内的虚拟节点
      const shouldRenderNode =
        node.isVisible &&
        // 如果节点的timePointId指向时间间隔且是虚拟节点，则不渲染
        !(this.isTimeInterval(node.timePointId) && node.isVirtual)

      if (shouldRenderNode) {
        // 获取审核人
        const reviewer = this.getReviewer(node.reviewerId)
        if (!reviewer) {
          console.warn(`找不到审核人: ${node.reviewerId}，节点ID: ${node.id}`)
          return
        }

        console.log(`创建节点 ID: ${node.id}, 标题: ${node.title}`)
        console.log(`  审核人: ${reviewer.name}, 位置: ${reviewer.position}`)
        console.log(`  时间点: ${node.timePointId}, 虚拟节点: ${node.isVirtual}`)

        // 创建节点网格
        const nodeMesh = this.createNodeMesh(node, reviewer.position)
        this.nodeGroup.add(nodeMesh)

        console.log(
          `  节点位置: X=${nodeMesh.position.x}, Y=${nodeMesh.position.y}, Z=${nodeMesh.position.z}`,
        )

        // 存储节点到映射中
        this.nodesMap.set(node.id, node)
      } else {
        console.log(
          `跳过节点 ID: ${node.id}, 原因: ${node.isVisible ? '在时间间隔内的虚拟节点' : '不可见'}`,
        )
      }
    })

    console.log('节点创建完成，总创建节点数量:', this.nodesMap.size)
  }

  /**
   * 检查时间点ID是否指向时间间隔
   * @param timePointId 时间点ID
   * @returns 是否是时间间隔
   */
  private isTimeInterval(timePointId: string): boolean {
    const interval = this.timeIntervals.find((interval) => interval.id === timePointId)
    return interval ? !!interval.isInterval : false
  }
}
