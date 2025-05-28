import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import type { WorkflowNode, WorkflowConnection, NodeType, FlowType } from './useMockData'
import { NODE_CONFIGS, CONNECTION_CONFIGS, COLORS, FIXED_NODE_WIDTH, FIXED_NODE_HEIGHT, FIXED_NODE_DEPTH } from './config'
import type { NodeRenderConfig, ConnectionRenderConfig, NodeRendererConfig, TimeInterval } from './types'

/**
 * 工作流节点渲染器
 * 负责将节点和连接线数据转换为Three.js对象
 */
export default class WorkflowNodeRenderer {
  private scene: THREE.Scene
  private nodeGroup: THREE.Group
  private config: NodeRendererConfig
  private timeIntervals: TimeInterval[]
  private nodesMap: Map<string, WorkflowNode> = new Map() // 存储节点ID到节点对象的映射

  // 节点配置
  private nodeConfigs: Record<NodeType, NodeRenderConfig> = NODE_CONFIGS

  // 连接线配置
  private connectionConfigs: Record<'solid' | 'dashed', ConnectionRenderConfig> = CONNECTION_CONFIGS

  // 颜色配置
  private colorConfigs = COLORS.nodeColors

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
    config: NodeRendererConfig,
    timeIntervals: TimeInterval[],
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
    timeInterval: TimeInterval,
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
    // 使用timelineDepth替代reviewRowHeight作为基准点
    // 如果没有提供timelineDepth，则回退到使用reviewRowHeight
    const baseZ = this.config.timelineDepth || this.config.reviewRowHeight;
    
    return (
      this.config.reviewRowHeight / 2 +
      reviewerPosition * this.config.reviewRowHeight +
      baseZ
    )
  }

  /**
   * 在节点上创建文本标签
   * @param node 节点数据
   * @param nodeMesh 节点网格对象
   * @returns CSS2D对象
   */
  private createNodeLabel(node: WorkflowNode, nodeMesh: THREE.Mesh): CSS2DObject[] {
    const labels: CSS2DObject[] = []
    
    // 创建主标签容器（显示在节点顶面）
    const mainLabelDiv = document.createElement('div')
    mainLabelDiv.className = 'node-main-label'
    
    // 设置主标签样式 - 直接在节点上显示文本，不使用背景色
    mainLabelDiv.style.cssText = `
      width: ${FIXED_NODE_WIDTH - 10}px;
      padding: 4px;
      color: white;
      font-family: 'Microsoft YaHei', sans-serif;
      font-size: 14px;
      font-weight: bold;
      text-align: center;
      pointer-events: none;
      user-select: none;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
    `
    
    // 设置主标签文本内容
    mainLabelDiv.textContent = node.title || `节点${node.id}`
    
    // 创建主标签CSS2D对象
    const mainLabel = new CSS2DObject(mainLabelDiv)
    
    // 调整主标签位置，放在节点中心
    mainLabel.position.set(0, 0, 0)
    
    // 将主标签添加为节点的子对象
    nodeMesh.add(mainLabel)
    labels.push(mainLabel)
    
    // 如果节点有状态信息，在节点底部添加状态标签
    if (node.stateInfo || node.status) {
      const statusLabelDiv = document.createElement('div')
      statusLabelDiv.className = 'node-status-label'
      
      // 设置状态标签样式
      let textColor = 'white'
      
      // 根据节点状态设置不同的颜色
      if (node.status === 'pass') {
        textColor = '#4caf50' // 绿色文字
      } else if (node.status === 'reject') {
        textColor = '#f44336' // 红色文字
      } else if (node.status === 'pending') {
        textColor = '#ffc107' // 黄色文字
      }
      
      statusLabelDiv.style.cssText = `
        width: ${FIXED_NODE_WIDTH - 10}px;
        padding: 2px;
        color: ${textColor};
        font-family: 'Microsoft YaHei', sans-serif;
        font-size: 12px;
        font-weight: normal;
        text-align: center;
        pointer-events: none;
        user-select: none;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
      `
      
      // 设置状态标签文本内容
      statusLabelDiv.textContent = node.stateInfo || this.getStatusText(node.status)
      
      // 创建状态标签CSS2D对象
      const statusLabel = new CSS2DObject(statusLabelDiv)
      
      // 调整状态标签位置，放在节点底部
      statusLabel.position.set(0, -FIXED_NODE_HEIGHT / 3, 0)
      
      // 将状态标签添加为节点的子对象
      nodeMesh.add(statusLabel)
      labels.push(statusLabel)
    }
    
    return labels
  }
  
  /**
   * 获取状态文本
   * @param status 状态代码
   * @returns 状态文本
   */
  private getStatusText(status: string): string {
    switch (status) {
      case 'pass':
        return '已通过'
      case 'reject':
        return '已驳回'
      case 'pending':
        return '审核中'
      default:
        return status
    }
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

    // 使用固定节点尺寸常量
    const width = FIXED_NODE_WIDTH
    const height = FIXED_NODE_HEIGHT
    const depth = FIXED_NODE_DEPTH
    console.log(`节点尺寸: 宽=${width}, 高=${height}, 深=${depth}`)

    // 计算节点的Z位置（对应审核人）
    const z = this.getNodeZ(reviewerPosition)
    console.log(`节点 Z 坐标=${z} (基于审核人位置=${reviewerPosition})`)

    // 创建节点几何体
    const nodeGeometry = new THREE.BoxGeometry(width, height, depth)
    console.log(`创建节点几何体 - 尺寸: ${width}x${height}x${depth}`)

    // 获取节点颜色
    const nodeColor = this.getColor(node.flowType, node.status)
    console.log(
      `节点颜色=0x${nodeColor.toString(16)} (基于流程类型=${node.flowType}, 状态=${node.status})`,
    )

    // 创建节点材质 - 使用更加简洁的单一材质
    const material = new THREE.MeshStandardMaterial({
      color: nodeColor,
      metalness: 0.1, // 降低金属度，减少反光
      roughness: 0.7, // 增加粗糙度，使表面更加哑光
      transparent: true,
      opacity: node.isVirtual ? 0.6 : 1.0,
      flatShading: true, // 平面着色，使表面更平整
    })

    // 创建节点网格
    const nodeMesh = new THREE.Mesh(nodeGeometry, material)

    // 设置节点位置
    nodeMesh.position.set(
      startX,
      height / 2, // Y轴高度为高度的一半
      z,
    )
    console.log(`最终节点位置: X=${startX}, Y=${height / 2}, Z=${z}`)

    // 设置节点的用户数据（用于点击交互）
    nodeMesh.userData = {
      type: 'workflowNode',
      nodeId: node.id,
      nodeData: node,
    }
    
    // 添加节点文本标签
    if (node.title) {
      this.createNodeLabel(node, nodeMesh)
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
   * @param sourceNodeData 源节点数据，用于获取状态信息
   */
  private createConnection(
    fromNode: THREE.Mesh,
    toNode: THREE.Mesh,
    status: string,
    flowType: FlowType,
    sourceNodeData: WorkflowNode,
  ): void {
    // 获取节点位置
    const startPosition = new THREE.Vector3().copy(fromNode.position)
    const endPosition = new THREE.Vector3().copy(toNode.position)

    // 调整起点和终点，使线从节点边缘开始和结束，而不是从中心
    const direction = new THREE.Vector3().subVectors(endPosition, startPosition).normalize()
    
    // 根据连接方向选择合适的节点尺寸
    // 计算主要移动方向（X、Y或Z）
    const absX = Math.abs(direction.x)
    const absY = Math.abs(direction.y)
    const absZ = Math.abs(direction.z)
    
    let offsetDistance
    // 如果主要是X方向的移动
    if (absX > absZ && absX > absY) {
      offsetDistance = FIXED_NODE_WIDTH / 2
    }
    // 如果主要是Z方向的移动
    else if (absZ > absX && absZ > absY) {
      offsetDistance = FIXED_NODE_DEPTH / 2
    }
    // 如果主要是Y方向的移动或者是混合方向
    else {
      // 使用宽度和深度的平均值作为对角线移动的偏移量
      offsetDistance = Math.min(FIXED_NODE_WIDTH, FIXED_NODE_DEPTH) / 2
    }
    
    // 增加一点额外的偏移，确保连接线从节点边缘开始和结束
    offsetDistance += 5
    
    startPosition.add(direction.clone().multiplyScalar(offsetDistance))
    endPosition.sub(direction.clone().multiplyScalar(offsetDistance))

    // 创建连接线几何体
    const points: THREE.Vector3[] = []
    points.push(startPosition)

    // 如果两个节点在同一行且不太远，直接连接
    const isShortConnection =
      Math.abs(endPosition.x - startPosition.x) < this.config.cellWidth * 1.5

    // 计算线条中点位置，用于放置标签
    let midPoint: THREE.Vector3

    if (isShortConnection) {
      points.push(endPosition)
      midPoint = new THREE.Vector3().lerpVectors(startPosition, endPosition, 0.5)
    } else {
      // 对于较长的连接，添加中间点创建曲线
      // 计算中间点，使线条有弧度
      const midX = (startPosition.x + endPosition.x) / 2
      const midY = Math.max(startPosition.y, endPosition.y) + 60 // 增加弧度高度，适应更高的节点
      const midZ = (startPosition.z + endPosition.z) / 2

      const midControlPoint = new THREE.Vector3(midX, midY, midZ)
      points.push(midControlPoint)
      points.push(endPosition)

      // 中点位置调整为曲线上的点，稍微靠近控制点
      midPoint = new THREE.Vector3().lerpVectors(
        new THREE.Vector3().lerpVectors(startPosition, midControlPoint, 0.5),
        midControlPoint,
        0.3,
      )
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
      linewidth: 3, // 增加线宽，使连接线更明显
      transparent: true,
      opacity: 0.8,
    })

    // 创建线对象
    const line = new THREE.Line(geometry, material)

    // 添加到场景
    this.nodeGroup.add(line)

    // 创建箭头指示方向
    this.createArrow(endPosition, direction, color)

    // 添加连接线标签
    this.createConnectionLabel(midPoint, sourceNodeData, status)
  }

  /**
   * 创建连接线标签
   * @param position 标签位置
   * @param nodeData 节点数据
   * @param status 连接状态
   */
  private createConnectionLabel(
    position: THREE.Vector3,
    nodeData: WorkflowNode,
    status: string,
  ): void {
    // 决定显示什么内容
    let labelText = ''

    // 尝试从节点属性中获取可能的标签信息
    // 优先使用状态信息
    if (nodeData.stateInfo) {
      // 检查是否是时间间隔相关的状态信息
      if (nodeData.stateInfo.includes('历时') || nodeData.stateInfo.includes('天')) {
        // 突出显示时间间隔，使用完整的状态信息
        labelText = nodeData.stateInfo
      }
      // 一般状态信息
      else {
        labelText = nodeData.stateInfo
      }
    }
    // 否则显示状态信息
    else {
      switch (status) {
        case 'pass':
          labelText = '通过'
          break
        case 'reject':
          labelText = '驳回'
          break
        case 'pending':
          labelText = '审核中'
          break
      }
    }

    // 如果有标签文本，创建CSS2D标签
    if (labelText) {
      const labelDiv = document.createElement('div')
      labelDiv.className = 'connection-label'

      // 根据标签内容设置不同的样式
      let backgroundColor = 'rgba(0, 0, 0, 0.7)' // 默认黑色背景
      let textColor = 'white' // 默认白色文字

      // 根据状态信息设置不同的颜色
      if (labelText === '通过' || labelText.includes('提交')) {
        backgroundColor = 'rgba(76, 175, 80, 0.8)' // 绿色背景
      } else if (labelText === '驳回' || labelText.includes('待修改')) {
        backgroundColor = 'rgba(244, 67, 54, 0.8)' // 红色背景
      } else if (labelText.includes('历时') || labelText.includes('天')) {
        backgroundColor = 'rgba(255, 152, 0, 0.8)' // 橙色背景
        textColor = 'rgba(0, 0, 0, 0.9)' // 黑色文字
      } else if (labelText.includes('接收') || labelText.includes('审核中')) {
        backgroundColor = 'rgba(158, 158, 158, 0.8)' // 灰色背景
      }

      labelDiv.style.cssText = `
        background: ${backgroundColor};
        color: ${textColor};
        padding: 4px 8px;
        border-radius: 4px;
        font-family: 'Microsoft YaHei', sans-serif;
        font-size: 12px;
        font-weight: ${labelText.includes('历时') ? 'bold' : 'normal'};
        text-align: center;
        white-space: nowrap;
        pointer-events: none;
        user-select: none;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      `
      labelDiv.textContent = labelText

      const label = new CSS2DObject(labelDiv)

      // 设置标签位置，稍微上移一点
      const labelPosition = position.clone()
      labelPosition.y += 10 // 向上偏移，避免与线重叠
      label.position.copy(labelPosition)

      // 添加到场景
      this.nodeGroup.add(label)
    }
  }

  /**
   * 创建箭头指示方向
   * @param position 箭头位置
   * @param direction 方向向量
   * @param color 颜色
   */
  private createArrow(position: THREE.Vector3, direction: THREE.Vector3, color: number): void {
    // 创建一个圆锥作为箭头，增大尺寸
    const arrowGeometry = new THREE.ConeGeometry(8, 16, 8)
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
   * 处理节点点击事件
   * @param event 鼠标事件
   * @param nodeId 节点ID
   * @param nodeData 节点数据
   */
  public handleNodeClick(event: MouseEvent, nodeId: string, nodeData: WorkflowNode): void {
    console.log(`节点被点击: ID=${nodeId}, 标题=${nodeData.title}`, nodeData)
    
    // 触发自定义事件，通知外部组件节点被点击
    const clickEvent = new CustomEvent('workflow-node-click', {
      detail: {
        nodeId,
        nodeData,
        originalEvent: event,
      },
    })
    document.dispatchEvent(clickEvent)
    
    // 这里可以添加其他点击效果，例如高亮显示节点
    // 可以在将来实现
  }

  /**
   * 创建所有节点和连接
   * @param nodes 节点数据数组
   */
  public createNodesAndConnections(nodes: WorkflowNode[]): void {
    console.log(`开始创建${nodes.length}个节点和连接`)

    // 清除之前的节点和连接
    this.nodeGroup.clear()
    this.nodesMap.clear()

    // 记录已渲染的节点ID
    const renderedNodeIds = new Set<string>()

    // 第一步：创建所有节点
    for (const node of nodes) {
      // 检查节点是否在时间间隔中，如果是则跳过
      if (this.isTimeInterval(node.timePointId)) {
        console.log(`跳过节点 ${node.id}：位于时间间隔 ${node.timePointId} 中`)
        continue
      }
      
      // 查找审核人位置
      const reviewer = this.getReviewer(node.reviewerId)
      if (!reviewer) {
        console.warn(`未找到审核人: ID=${node.reviewerId}, 节点=${node.id}`)
        continue
      }

      const reviewerPosition = reviewer.position
      console.log(
        `为节点${node.id}找到审核人${node.reviewerId}，位置=${reviewerPosition}`,
      )

      // 创建节点网格
      const nodeMesh = this.createNodeMesh(node, reviewerPosition)

      // 添加到场景
      this.nodeGroup.add(nodeMesh)

      // 存储节点引用
      this.nodesMap.set(node.id, node)
      renderedNodeIds.add(node.id)
      
      // 为节点添加点击事件监听器
      nodeMesh.userData.onClick = (event: MouseEvent) => {
        this.handleNodeClick(event, node.id, node)
      }
    }

    console.log(`已创建${renderedNodeIds.size}个节点`)

    // 第二步：构建连接映射
    const connectionMap = this.buildConnectionMap(nodes, renderedNodeIds)

    // 第三步：创建连接线
    for (const [fromNodeId, toNodeId] of connectionMap.entries()) {
      // 获取源节点和目标节点
      const fromNode = this.nodesMap.get(fromNodeId)
      const toNode = this.nodesMap.get(toNodeId)

      if (!fromNode || !toNode) {
        console.warn(`无法创建连接: 找不到节点 ${fromNodeId} -> ${toNodeId}`)
        continue
      }

      // 查找场景中的节点网格
      const fromMesh = this.nodeGroup.children.find(
        (child) => child.userData?.nodeId === fromNodeId,
      ) as THREE.Mesh
      const toMesh = this.nodeGroup.children.find(
        (child) => child.userData?.nodeId === toNodeId,
      ) as THREE.Mesh

      if (!fromMesh || !toMesh) {
        console.warn(`无法创建连接: 找不到节点网格 ${fromNodeId} -> ${toNodeId}`)
        continue
      }

      // 获取源节点的状态和流程类型
      const sourceNodeData = this.nodesMap.get(fromNodeId)
      if (!sourceNodeData) {
        console.warn(`无法创建连接: 找不到源节点数据 ${fromNodeId}`)
        continue
      }

      // 创建连接线
      this.createConnection(
        fromMesh,
        toMesh,
        sourceNodeData.status,
        sourceNodeData.flowType,
        sourceNodeData,
      )
    }

    console.log('节点和连接创建完成')
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
