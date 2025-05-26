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
   * 创建连接线
   * @param fromNode 起始节点
   * @param toNode 目标节点
   * @param status 连接状态
   * @param flowType 流程类型
   */
  private createConnection(
    fromNode: THREE.Mesh,
    toNode: THREE.Mesh,
    status: string,
    flowType: FlowType,
  ): void {
    // 获取节点位置
    const startPosition = new THREE.Vector3().copy(fromNode.position)
    const endPosition = new THREE.Vector3().copy(toNode.position)

    // 调整起点和终点，使线从节点边缘开始和结束，而不是从中心
    const direction = new THREE.Vector3().subVectors(endPosition, startPosition).normalize()
    startPosition.add(direction.clone().multiplyScalar(16)) // 16是节点半径
    endPosition.sub(direction.clone().multiplyScalar(16))

    // 创建连接线几何体
    const points: THREE.Vector3[] = []
    points.push(startPosition)

    // 如果两个节点在同一行且不太远，直接连接
    const isShortConnection =
      Math.abs(endPosition.x - startPosition.x) < this.config.cellWidth * 1.5
    if (isShortConnection) {
      points.push(endPosition)
    } else {
      // 对于较长的连接，添加中间点创建曲线
      // 计算中间点，使线条有弧度
      const midX = (startPosition.x + endPosition.x) / 2
      const midY = Math.max(startPosition.y, endPosition.y) + 40 // 向上弯曲
      const midZ = (startPosition.z + endPosition.z) / 2

      points.push(new THREE.Vector3(midX, midY, midZ))
      points.push(endPosition)
    }

    // 创建曲线
    const curve = new THREE.CatmullRomCurve3(points)
    const curvePoints = curve.getPoints(50) // 获取50个点来绘制平滑曲线

    // 创建线几何体
    const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints)

    // 根据状态和流程类型选择颜色
    let color
    if (status === 'pass') {
      color = flowType === 'main' ? 0x4caf50 : 0xffc107 // 主流程通过为绿色，重试流程为黄色
    } else if (status === 'reject') {
      color = 0xf44336 // 驳回为红色
    } else {
      color = 0x9e9e9e // 待处理为灰色
    }

    // 创建线材质
    const material = new THREE.LineBasicMaterial({
      color: color,
      linewidth: 2,
      transparent: true,
      opacity: 0.8,
    })

    // 创建线对象
    const line = new THREE.Line(geometry, material)

    // 添加到场景
    this.nodeGroup.add(line)

    // 创建箭头指示方向
    this.createArrow(endPosition, direction, color)
  }

  /**
   * 创建箭头指示方向
   * @param position 箭头位置
   * @param direction 方向向量
   * @param color 颜色
   */
  private createArrow(position: THREE.Vector3, direction: THREE.Vector3, color: number): void {
    // 创建一个小圆锥作为箭头
    const arrowGeometry = new THREE.ConeGeometry(5, 10, 8)
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: color })
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial)

    // 设置箭头位置和旋转
    arrow.position.copy(position)

    // 计算欧拉角使箭头指向正确的方向
    const arrowDirection = direction.clone().negate() // 箭头应该指向来源方向的反方向
    arrow.lookAt(position.clone().add(arrowDirection))

    // 箭头需要额外旋转90度使尖端指向正确方向
    arrow.rotateX(Math.PI / 2)

    // 添加到场景
    this.nodeGroup.add(arrow)
  }

  /**
   * 创建工作流节点和连接线
   * @param nodes 节点数组
   */
  public createNodesAndConnections(nodes: WorkflowNode[]): void {
    // 清空节点映射
    this.nodesMap.clear()

    // 创建用于存储THREE.Mesh节点对象的映射
    const nodeMeshMap = new Map<string, THREE.Mesh>()

    // 创建实际渲染节点的ID集合
    const renderedNodeIds = new Set<string>()

    console.log('开始创建节点，总节点数量:', nodes.length)

    // 第一阶段：创建所有节点
    nodes.forEach((node) => {
      // 检查节点是否可见，以及是否在时间间隔内
      const isTimeIntervalNode = this.isTimeInterval(node.timePointId)

      // 不渲染时间间隔内的节点
      if (node.isVisible && !isTimeIntervalNode) {
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

        // 记录实际渲染的节点ID
        renderedNodeIds.add(node.id)

        // 存储节点到映射中
        this.nodesMap.set(node.id, node)
        nodeMeshMap.set(node.id, nodeMesh)
      } else {
        const reason = !node.isVisible ? '节点不可见' : '节点位于时间间隔内'
        console.log(`跳过节点 ID: ${node.id}, 原因: ${reason}`)
      }
    })

    console.log('节点创建完成，总创建节点数量:', this.nodesMap.size)

    // 第二阶段：创建连接线
    console.log('开始创建连接线...')

    // 创建连接映射，处理跨越时间间隔的连接
    const connectionMap = this.buildConnectionMap(nodes, renderedNodeIds)

    // 遍历连接映射创建连接线
    for (const [fromId, toId] of connectionMap.entries()) {
      const fromMesh = nodeMeshMap.get(fromId)
      const toMesh = nodeMeshMap.get(toId)

      if (fromMesh && toMesh) {
        // 获取源节点数据，用于确定连接线的状态和类型
        const fromNode = this.nodesMap.get(fromId)
        if (fromNode) {
          console.log(`创建连接线: ${fromId} -> ${toId}`)
          this.createConnection(fromMesh, toMesh, fromNode.status, fromNode.flowType)
        }
      }
    }

    console.log('连接线创建完成')
  }

  /**
   * 构建连接映射表，处理中间节点被跳过的情况
   * @param nodes 所有节点
   * @param renderedNodeIds 实际渲染的节点ID集合
   * @returns 连接映射表（从节点ID到目标节点ID）
   */
  private buildConnectionMap(
    nodes: WorkflowNode[],
    renderedNodeIds: Set<string>,
  ): Map<string, string> {
    // 创建连接映射表
    const connectionMap = new Map<string, string>()

    // 创建节点映射表，用于快速查找节点
    const nodeMap = new Map<string, WorkflowNode>()
    nodes.forEach((node) => nodeMap.set(node.id, node))

    // 为每个渲染的节点查找其实际连接的目标节点
    renderedNodeIds.forEach((nodeId) => {
      const node = nodeMap.get(nodeId)
      if (!node || !node.to) return

      // 如果直接目标节点已渲染，直接连接
      if (renderedNodeIds.has(node.to)) {
        connectionMap.set(nodeId, node.to)
      } else {
        // 目标节点未渲染，找到实际应该连接的节点
        let currentNodeId = node.to
        let targetFound = false

        // 沿着连接链向下查找，直到找到渲染的节点或无法继续
        while (currentNodeId) {
          const currentNode = nodeMap.get(currentNodeId)
          if (!currentNode || !currentNode.to) break

          if (renderedNodeIds.has(currentNode.to)) {
            // 找到渲染的目标节点，创建连接
            connectionMap.set(nodeId, currentNode.to)
            targetFound = true
            break
          }

          // 继续向下查找
          currentNodeId = currentNode.to
        }

        if (!targetFound) {
          console.log(`无法为节点 ${nodeId} 找到有效的连接目标`)
        }
      }
    })

    return connectionMap
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
