import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import type { WorkflowConnection, FlowType } from './useMockData'
import {
  NODE_CONFIGS,
  CONNECTION_CONFIGS,
  COLORS,
  FIXED_NODE_WIDTH,
  FIXED_NODE_HEIGHT,
  FIXED_NODE_DEPTH,
  ANIMATION_CONFIG,
} from './config'
import type {
  NodeRenderConfig,
  ConnectionRenderConfig,
  NodeRendererConfig,
  TimeInterval,
  WorkflowNode,
} from './types'
import { TeleportAnimationController2 } from './useTeleportAnimation2'
import {
  calculateAnimationSequence,
  type AnimationSequenceItem,
  type FlowColorConfig,
} from './useAnimationSequence'

/**
 * 计算单元格宽度
 * @param nodeCount 节点数量
 * @param baseCellWidth 基础单元格宽度
 * @returns 计算后的单元格宽度
 */
export function calculateCellWidth(nodeCount: number, baseCellWidth: number): number {
  if (nodeCount > 1) {
    // 如果有多个节点，宽度 = 节点数量 * 基础宽度
    return nodeCount * baseCellWidth
  } else {
    // 单节点情况下，确保宽度足够显示一个节点
    // 节点宽度 + 两侧留白
    const minWidth = FIXED_NODE_WIDTH + 80 // 增加留白，确保单节点有足够空间
    return Math.max(baseCellWidth, minWidth)
  }
}

/**
 * 动画模式枚举
 */
export enum AnimationMode {
  DIRECT = 'direct', // 直接在节点间移动（方案2）
}
// 默认流程类型常量
const DEFAULT_FLOW_TYPE = 'main'
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
  private cellNodeCount: Map<string, { count: number; nodes: WorkflowNode[] }> = new Map() // 存储单元格内节点数量

  // 动画相关属性
  private flowMarker: THREE.Mesh | null = null // 流程标记物
  private animationPathPoints: THREE.Vector3[] = [] // 动画路径点
  private currentPathIndex: number = 0 // 当前路径点索引
  private isAnimationPlaying: boolean = false // 动画是否正在播放
  private connectionPaths: THREE.Vector3[][] = [] // 连接路径点集合
  private nodePositions: THREE.Vector3[] = [] // 存储所有节点的精确位置
  private labelPositions: { position: THREE.Vector3; labelText: string }[] = [] // 存储连接线标签位置

  // 动画控制器
  private teleportAnimationController2: TeleportAnimationController2
  private currentAnimationMode: AnimationMode = AnimationMode.DIRECT // 默认使用方案2

  // 连接线配置
  private connectionConfigs: Record<'solid' | 'dashed', ConnectionRenderConfig> = CONNECTION_CONFIGS

  // 颜色配置
  private colorConfigs = COLORS.nodeColors

  // 动画序列集合
  private animationSequenceItems: AnimationSequenceItem[] = []

  // 节点ID到序列项的映射
  private nodeIdToSequenceItem: Map<string, AnimationSequenceItem> = new Map()

  // 连接线ID到序列项的映射
  private connectionIdToSequenceItem: Map<string, AnimationSequenceItem> = new Map()

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

    // 初始化动画控制器
    this.teleportAnimationController2 = new TeleportAnimationController2(nodeGroup)
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
  private getTimeIntervalPosition(timeInterval: TimeInterval, index: number): number {
    // console.log(`计算时间间隔位置: 索引=${index}, id=${timeInterval.id}, date=${timeInterval.date}`)

    // 从左侧固定区域右边界开始
    let position = this.config.leftOffset

    // 计算前面所有时间点的宽度总和
    for (let i = 0; i < index; i++) {
      const prevInterval = this.timeIntervals[i]
      const prevTimePointId = prevInterval.id || ''

      // 计算每个审核人在该时间点的节点数量
      const nodeCountPerReviewer = new Map<string, number>()

      // 统计每个审核人的节点数量
      for (const [nodeId, node] of this.nodesMap.entries()) {
        if (node.timePointId === prevTimePointId) {
          const reviewerId = node.reviewerId
          const currentCount = nodeCountPerReviewer.get(reviewerId) || 0
          nodeCountPerReviewer.set(reviewerId, currentCount + 1)
        }
      }

      // 找出最大的节点数量
      let maxNodesPerReviewer = 0
      nodeCountPerReviewer.forEach((count) => {
        if (count > maxNodesPerReviewer) {
          maxNodesPerReviewer = count
        }
      })

      // 使用calculateCellWidth函数计算该时间点的宽度
      const cellWidth = calculateCellWidth(maxNodesPerReviewer, this.config.cellWidth)

      // 累加宽度
      position += cellWidth
    }

    // console.log(`  计算的位置: ${position}`)
    return position
  }

  /**
   * 计算每个单元格内的节点数量
   * @returns 单元格节点计数映射 {timePointId-reviewerId: count}
   */
  private calculateCellNodeCount(): Map<string, { count: number; nodes: WorkflowNode[] }> {
    const cellNodeCount = new Map<string, { count: number; nodes: WorkflowNode[] }>()

    // 遍历所有节点，统计每个单元格内的节点数量
    for (const [nodeId, node] of this.nodesMap.entries()) {
      const cellKey = `${node.timePointId}-${node.reviewerId}`
      const currentData = cellNodeCount.get(cellKey) || { count: 0, nodes: [] }
      currentData.count += 1
      currentData.nodes.push(node)
      cellNodeCount.set(cellKey, currentData)
    }

    // console.log('单元格节点计数:', Array.from(cellNodeCount.entries()))
    return cellNodeCount
  }

  /**
   * 获取节点在单元格内的索引
   * @param timePointId 时间点ID
   * @param reviewerId 审核人ID
   * @param nodeId 节点ID
   * @returns 索引值（从0开始）
   */
  private getNodeIndexInCell(timePointId: string, reviewerId: string, nodeId: string): number {
    let index = 0

    // 遍历所有节点，找出同一单元格内的节点，并确定当前节点的索引
    for (const [id, node] of this.nodesMap.entries()) {
      if (node.timePointId === timePointId && node.reviewerId === reviewerId) {
        if (id === nodeId) {
          return index
        }
        index++
      }
    }

    return 0
  }

  /**
   * 获取节点X坐标
   * @param timePointId 时间点ID
   * @param nodeId 节点ID
   * @returns X坐标
   */
  private getNodeX(timePointId: string, nodeId: string): number {
    // console.log(`查找时间点位置: ${timePointId}, 节点ID: ${nodeId}`)

    // 查找时间点在时间间隔数组中的索引
    const timePointIndex = this.timeIntervals.findIndex(
      (interval) => interval.date === timePointId || interval.id === timePointId,
    )

    // console.log(`时间点索引: ${timePointIndex}`)

    // 如果找不到索引，使用左侧偏移
    if (timePointIndex === -1) {
      // console.warn(`找不到时间点: ${timePointId}，使用默认位置`)
      return this.config.leftOffset
    }

    // 获取时间间隔
    const timeInterval = this.timeIntervals[timePointIndex]

    // 使用getTimeIntervalPosition获取时间点的X坐标
    const baseX = this.getTimeIntervalPosition(timeInterval, timePointIndex)

    // 获取当前节点信息
    const currentNode = this.nodesMap.get(nodeId)
    if (!currentNode) {
      return baseX + this.config.cellWidth / 2 // 默认居中
    }

    // 计算单元格内节点数量和索引
    const cellKey = `${timePointId}-${currentNode.reviewerId}`
    const cellData = this.cellNodeCount.get(cellKey)
    const nodeCount = cellData ? cellData.count : 1
    const nodeIndex = this.getNodeIndexInCell(timePointId, currentNode.reviewerId, nodeId)

    // console.log(`单元格 ${cellKey} 内有 ${nodeCount} 个节点，当前节点索引: ${nodeIndex}`)

    // 计算单元格宽度 - 使用calculateCellWidth函数
    const cellWidth = calculateCellWidth(nodeCount, this.config.cellWidth)

    if (nodeCount === 1) {
      // 单元格内只有一个节点，居中放置
      const finalX = baseX + cellWidth / 2
      // console.log(`单节点居中: ${finalX}`)
      return finalX
    } else {
      // 单元格内有多个节点，水平排列
      // 节点间距为节点宽度的1.5倍，确保有足够的间距
      let nodeSpacing = FIXED_NODE_WIDTH * 1.8

      // 计算所有节点占用的总宽度
      let totalWidth = nodeCount * FIXED_NODE_WIDTH + (nodeCount - 1) * nodeSpacing

      // 检查是否超出单元格宽度
      if (totalWidth > cellWidth) {
        // console.log(`警告: 节点总宽度(${totalWidth})超过单元格宽度(${cellWidth})，自动调整间距`)

        // 计算可用于间距的空间
        const availableSpaceForGaps = cellWidth - nodeCount * FIXED_NODE_WIDTH

        // 计算每个间隙的宽度，但保持最小间距为节点宽度的0.8倍
        const minSpacing = FIXED_NODE_WIDTH * 0.8
        nodeSpacing = Math.max(availableSpaceForGaps / (nodeCount - 1), minSpacing)

        // 重新计算总宽度
        totalWidth = nodeCount * FIXED_NODE_WIDTH + (nodeCount - 1) * nodeSpacing
      }

      // 计算起始X坐标（使节点组居中）
      const startX = baseX + (cellWidth - totalWidth) / 2

      // 计算当前节点X坐标
      // 每个节点的位置 = 起始位置 + 节点索引 * (节点宽度 + 节点间距) + 节点宽度/2
      const finalX = startX + nodeIndex * (FIXED_NODE_WIDTH + nodeSpacing) + FIXED_NODE_WIDTH / 2

      // console.log(`多节点排列: 总宽度=${totalWidth}, 起始位置=${startX}, 节点位置=${finalX}, 间距=${nodeSpacing}`)
      return finalX
    }
  }

  /**
   * 获取节点Z坐标
   * @param reviewerPosition 审核人位置
   * @returns Z坐标位置
   */
  private getNodeZ(reviewerPosition: number): number {
    // 使用timelineDepth替代reviewRowHeight作为基准点
    // 如果没有提供timelineDepth，则回退到使用reviewRowHeight
    const baseZ = this.config.timelineDepth || this.config.reviewRowHeight

    return this.config.reviewRowHeight / 2 + reviewerPosition * this.config.reviewRowHeight + baseZ
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
    // console.log(`创建节点网格: ID=${node.id}, 标题=${node.title}, 审核人位置=${reviewerPosition}`)

    // 计算节点的位置
    const startX = this.getNodeX(node.timePointId, node.id)
    // console.log(`节点起始 X 坐标=${startX} (基于时间点ID=${node.timePointId})`)

    // 使用固定节点尺寸常量
    const width = FIXED_NODE_WIDTH
    const height = FIXED_NODE_HEIGHT
    const depth = FIXED_NODE_DEPTH
    // console.log(`节点尺寸: 宽=${width}, 高=${height}, 深=${depth}`)

    // 计算节点的Z位置（对应审核人）
    const z = this.getNodeZ(reviewerPosition)
    // console.log(`节点 Z 坐标=${z} (基于审核人位置=${reviewerPosition})`)

    // 创建节点几何体
    const nodeGeometry = new THREE.BoxGeometry(width, height, depth)
    // console.log(`创建节点几何体 - 尺寸: ${width}x${height}x${depth}`)

    // 获取节点颜色 - 根据流程类型，不再考虑状态
    const nodeColor = 0x4caf50

    // 创建顶面的文本贴图
    const topTexture = this.createTextTexture(
      node.title || `节点${node.id}`,
      width,
      depth,
      nodeColor,
    )

    // 创建基础材质 - 使用稍亮的颜色，不要太黑
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(nodeColor).lerp(new THREE.Color(0x333366), 0.3), // 混合一些蓝色调
      metalness: 0.2,
      roughness: 0.6,
      transparent: true,
      opacity: 1.0,
      flatShading: true,
    })

    // 创建顶面材质 - 专门用于显示文本贴图
    const topMaterial = new THREE.MeshBasicMaterial({
      map: topTexture,
      transparent: true,
      alphaTest: 0.1,
    })

    // 创建节点材质数组 - 顶面使用文本贴图，其他面使用纯色
    const materials = [
      baseMaterial.clone(), // 右面
      baseMaterial.clone(), // 左面
      topMaterial, // 顶面 - 使用文本贴图
      baseMaterial.clone(), // 底面
      baseMaterial.clone(), // 前面
      baseMaterial.clone(), // 后面
    ]

    // 创建节点网格
    const nodeMesh = new THREE.Mesh(nodeGeometry, materials)

    // 设置节点位置 - 由于高度减小，调整Y轴位置使节点底部正确放置
    nodeMesh.position.set(
      startX,
      height / 2, // Y轴高度为高度的一半，使节点底部贴合平面
      z,
    )
    // console.log(`最终节点位置: X=${startX}, Y=${height / 2}, Z=${z}`)

    // 设置节点的用户数据（用于点击交互）
    nodeMesh.userData = {
      nodeId: node.id,
      nodeData: node,
      flowType: DEFAULT_FLOW_TYPE, // 记录流程类型
    }

    // 添加电弧效果
    this.addElectricArcEffect(nodeMesh, width, depth)

    // console.log(`节点网格创建完成: ID=${node.id}`)
    return nodeMesh
  }

  /**
   * 为节点添加电弧效果
   * @param nodeMesh 节点网格
   * @param width 节点宽度
   * @param depth 节点深度
   */
  private addElectricArcEffect(nodeMesh: THREE.Mesh, width: number, depth: number): void {
    // 创建电弧效果组
    const arcGroup = new THREE.Group()
    // 获取节点高度，使用固定高度常量代替geometry.parameters
    arcGroup.position.y = FIXED_NODE_HEIGHT / 2 + 0.1 // 位于节点顶面上方一点点

    // 创建电弧点
    const arcCount = 60 // 增加点数量，使路径更平滑
    const arcPoints: THREE.Vector3[] = []

    // 计算电弧点的位置 - 沿着节点顶面边缘
    for (let i = 0; i <= arcCount; i++) {
      // 计算参数t，范围从0到1，表示在矩形周长上的位置
      const t = i / arcCount
      let x, z

      // 矩形边缘的参数化方程
      const halfWidth = width / 2
      const halfDepth = depth / 2

      // 根据t的值确定在矩形哪条边上
      if (t < 0.25) {
        // 前边
        x = -halfWidth + t * 4 * width
        z = halfDepth
      } else if (t < 0.5) {
        // 右边
        x = halfWidth
        z = halfDepth - (t - 0.25) * 4 * depth
      } else if (t < 0.75) {
        // 后边
        x = halfWidth - (t - 0.5) * 4 * width
        z = -halfDepth
      } else {
        // 左边
        x = -halfWidth
        z = -halfDepth + (t - 0.75) * 4 * depth
      }

      arcPoints.push(new THREE.Vector3(x, 0, z))
    }

    // 创建电弧几何体
    const arcGeometry = new THREE.BufferGeometry().setFromPoints(arcPoints)

    // 创建电弧材质
    const arcMaterial = new THREE.LineBasicMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.7,
    })

    // 创建电弧线
    const arcLine = new THREE.Line(arcGeometry, arcMaterial)
    arcGroup.add(arcLine)

    // 创建电弧粒子
    const particleCount = 6 // 增加粒子数量
    for (let i = 0; i < particleCount; i++) {
      // 创建粒子几何体
      const particleGeometry = new THREE.SphereGeometry(0.6, 12, 12) // 减小粒子尺寸，从0.8减小到0.6

      // 创建粒子材质
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8,
      })

      // 创建粒子网格
      const particle = new THREE.Mesh(particleGeometry, particleMaterial)

      // 设置粒子初始位置 - 均匀分布在路径上
      const startPosition = (i / particleCount) * arcPoints.length
      particle.userData = {
        speed: 0.1 + Math.random() * 0.15, // 大幅降低速度范围，使动画更平滑
        position: startPosition, // 初始位置
        baseOpacity: 0.6 + Math.random() * 0.4, // 基础不透明度
        pulseSpeed: 0.5 + Math.random() * 0.5, // 脉冲速度
        pulseIntensity: 0.2 + Math.random() * 0.3, // 脉冲强度
      }

      // 将粒子添加到电弧组
      arcGroup.add(particle)
    }

    // 将电弧组添加到节点
    nodeMesh.add(arcGroup)

    // 启动电弧动画
    this.animateElectricArc(arcGroup, arcPoints)
  }

  /**
   * 电弧动画
   * @param arcGroup 电弧组
   * @param arcPoints 电弧点
   */
  private animateElectricArc(arcGroup: THREE.Group, arcPoints: THREE.Vector3[]): void {
    // 创建时间记录
    const startTime = Date.now()

    // 动画函数
    const animate = () => {
      // 计算经过的时间（秒）
      const elapsedTime = (Date.now() - startTime) * 0.001

      // 更新电弧粒子位置
      arcGroup.children.forEach((child, index) => {
        // 跳过第一个子对象（电弧线）
        if (index === 0) {
          return
        }

        // 更新粒子位置
        if (child.userData && child.userData.position !== undefined) {
          // 更新位置参数 - 使用更平滑的移动
          child.userData.position += child.userData.speed

          // 循环位置
          if (child.userData.position >= arcPoints.length) {
            child.userData.position = 0
          }

          // 计算实际位置索引，使用插值实现平滑过渡
          const exactIndex = child.userData.position
          const index1 = Math.floor(exactIndex) % arcPoints.length
          const index2 = (index1 + 1) % arcPoints.length
          const fraction = exactIndex - index1

          // 在两点之间进行插值，实现平滑移动
          const point1 = arcPoints[index1]
          const point2 = arcPoints[index2]

          // 使用THREE.js的插值函数
          const interpolatedPosition = new THREE.Vector3().lerpVectors(point1, point2, fraction)
          child.position.copy(interpolatedPosition)

          // 添加非常轻微的随机抖动，不要太明显
          child.position.x += (Math.random() - 0.5) * 0.1
          child.position.z += (Math.random() - 0.5) * 0.1

          // 使用正弦函数创建更平滑的脉冲效果
          const mesh = child as THREE.Mesh
          if (mesh.material instanceof THREE.MeshBasicMaterial) {
            // 获取用户数据
            const baseOpacity = child.userData.baseOpacity || 0.6
            const pulseSpeed = child.userData.pulseSpeed || 0.5
            const pulseIntensity = child.userData.pulseIntensity || 0.3

            // 计算脉冲值
            const pulse = Math.sin(elapsedTime * pulseSpeed + index) * pulseIntensity

            // 应用到不透明度和缩放
            mesh.material.opacity = baseOpacity + pulse
            const scale = 0.9 + pulse * 0.6
            child.scale.set(scale, scale, scale)
          }
        }
      })

      // 让电弧线也有轻微的脉冲效果
      const arcLine = arcGroup.children[0]
      if (
        arcLine &&
        arcLine instanceof THREE.Line &&
        arcLine.material instanceof THREE.LineBasicMaterial
      ) {
        const pulseLine = Math.sin(elapsedTime * 0.3) * 0.1 + 0.7
        arcLine.material.opacity = pulseLine
      }

      // 继续动画循环
      requestAnimationFrame(animate)
    }

    // 启动动画
    animate()
  }

  /**
   * 创建文本贴图
   * @param text 要显示的文本
   * @param width 贴图宽度
   * @param height 贴图高度
   * @param backgroundColor 背景颜色
   * @returns 文本贴图
   */
  private createTextTexture(
    text: string,
    width: number,
    height: number,
    backgroundColor: number,
  ): THREE.Texture {
    // 创建Canvas元素 - 使用更高分辨率提高清晰度
    const canvas = document.createElement('canvas')
    canvas.width = 2048 // 使用超高分辨率以保证文本清晰
    canvas.height = 2048 * (height / width) // 保持与节点顶面相同的宽高比

    // 获取绘图上下文
    const context = canvas.getContext('2d')
    if (!context) {
      return new THREE.Texture()
    }

    // 设置半透明背景 - 模拟图片中的效果
    context.fillStyle = 'rgba(20, 40, 80, 0.7)' // 深蓝色半透明背景
    context.fillRect(0, 0, canvas.width, canvas.height)

    // 设置文本样式
    context.fillStyle = '#ffffff' // 白色文本
    context.textAlign = 'center'
    context.textBaseline = 'middle'

    // 计算合适的字体大小 - 适应更小的节点尺寸
    const fontSize = Math.floor(canvas.width * 0.12) // 稍微增大字体尺寸比例，从0.11增加到0.12
    context.font = `bold ${fontSize}px Microsoft YaHei` // 使用粗体增强可读性

    // 绘制文本（支持文本换行）
    const padding = canvas.width * 0.08 // 减小内边距，从0.1减小到0.08，使文字区域更大
    const maxWidth = canvas.width - padding * 2
    const lineHeight = fontSize * 1.2 // 减小行高

    // 使用\n拆分文本为多行
    const lines = text.split('\n')

    // 计算多行文本的起始Y坐标
    const totalHeight = lines.length * lineHeight
    let currentY = canvas.height / 2 - totalHeight / 2 + lineHeight / 2

    // 绘制多行文本 - 添加发光效果
    lines.forEach((line) => {
      // 添加发光效果 - 多次绘制同一文本，不同颜色和模糊度
      // 第一层 - 外发光，减小发光范围
      context.shadowColor = 'rgba(100, 200, 255, 0.8)'
      context.shadowBlur = fontSize * 0.3
      context.shadowOffsetX = 0
      context.shadowOffsetY = 0
      context.fillText(line, canvas.width / 2, currentY, maxWidth)

      // 第二层 - 内发光，减小发光范围
      context.shadowColor = 'rgba(150, 220, 255, 0.6)'
      context.shadowBlur = fontSize * 0.15
      context.fillText(line, canvas.width / 2, currentY, maxWidth)

      // 第三层 - 主文本，无阴影
      context.shadowColor = 'transparent'
      context.shadowBlur = 0
      context.fillText(line, canvas.width / 2, currentY, maxWidth)

      currentY += lineHeight
    })

    // 创建贴图
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true

    // 设置贴图的映射和过滤方式，提高清晰度
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = 16 // 增加各向异性过滤级别，显著提高倾斜视角下的清晰度

    return texture
  }

  /**
   * 创建所有节点和连接
   * @param nodes 节点数据数组
   */
  public createNodesAndConnections(nodes: WorkflowNode[]): void {
    // console.log(`开始创建${nodes.length}个节点和连接`)

    // 停止当前动画（如果有）
    if (this.isAnimationPlaying) {
      this.stopAnimation()
    }

    // 清除之前的节点和连接
    this.nodeGroup.clear()
    this.nodesMap.clear()
    this.cellNodeCount.clear()

    // 重置动画路径
    this.animationPathPoints = []
    this.flowMarker = null
    this.connectionPaths = []
    this.nodePositions = [] // 重置节点位置数组
    this.labelPositions = [] // 重置标签位置数组

    // 重置序列相关映射
    this.nodeIdToSequenceItem.clear()
    this.connectionIdToSequenceItem.clear()

    // 记录已渲染的节点ID
    const renderedNodeIds = new Set<string>()

    // 将工作流节点数据传递给动画控制器，用于计算动画顺序
    this.teleportAnimationController2.setWorkflowNodes(nodes)

    // 第一步：先将所有节点信息存入nodesMap（不创建网格）
    for (const node of nodes) {
      if (!this.isTimeInterval(node.timePointId)) {
        this.nodesMap.set(node.id, node)
      }
    }

    // 第二步：计算每个单元格内的节点数量
    this.cellNodeCount = this.calculateCellNodeCount()

    // 第三步：创建所有节点
    for (const node of nodes) {
      // 检查节点是否在时间间隔中，如果是则跳过
      if (this.isTimeInterval(node.timePointId)) {
        // console.log(`跳过节点 ${node.id}：位于时间间隔 ${node.timePointId} 中`)
        continue
      }

      // 查找审核人位置
      const reviewer = this.getReviewer(node.reviewerId)
      if (!reviewer) {
        // console.warn(`未找到审核人: ID=${node.reviewerId}, 节点=${node.id}`)
        continue
      }

      const reviewerPosition = reviewer.position
      // console.log(`为节点${node.id}找到审核人${node.reviewerId}，位置=${reviewerPosition}`)

      // 创建节点网格
      const nodeMesh = this.createNodeMesh(node, reviewerPosition)

      // 添加到场景
      this.nodeGroup.add(nodeMesh)

      // 存储节点引用
      renderedNodeIds.add(node.id)

      // 记录节点位置，用于紫色动画节点
      this.nodePositions.push(nodeMesh.position.clone())

      // 为节点添加点击事件监听器
      nodeMesh.userData.onClick = (event: MouseEvent) => {
        this.handleNodeClick(event, node.id, node, nodeMesh.userData)
      }
    }

    // console.log(`已创建${renderedNodeIds.size}个节点`)

    // 第二步：构建连接映射
    const connectionMap = this.buildConnectionMap(nodes, renderedNodeIds)

    // 第三步：创建连接线
    for (const [fromNodeId, toNodeId] of connectionMap.entries()) {
      // 获取源节点和目标节点
      const fromNode = this.nodesMap.get(fromNodeId)
      const toNode = this.nodesMap.get(toNodeId)

      if (!fromNode || !toNode) {
        // console.warn(`无法创建连接: 找不到节点 ${fromNodeId} -> ${toNodeId}`)
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
        // console.warn(`无法创建连接: 找不到节点网格 ${fromNodeId} -> ${toNodeId}`)
        continue
      }

      // 获取源节点的状态和流程类型
      const sourceNodeData = this.nodesMap.get(fromNodeId)
      if (!sourceNodeData) {
        // console.warn(`无法创建连接: 找不到源节点数据 ${fromNodeId}`)
        continue
      }

      // 创建连接线
      this.createConnection(
        fromMesh,
        toMesh,
        sourceNodeData.status,
        DEFAULT_FLOW_TYPE,
        sourceNodeData,
      )
    }

    // console.log('节点和连接创建完成')
    // console.log(
    //   `记录了${this.nodePositions.length}个节点位置和${this.labelPositions.length}个标签位置`,
    // )

    // 计算动画序列
    this.calculateAndBindAnimationSequence(nodes)

    // 初始化动画
    this.initAnimation()
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
      if (!node || !node.to) {
        return
      }

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
          if (!currentNode || !currentNode.to) {
            break
          }

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
          // console.log(`无法为节点 ${nodeId} 找到有效的连接目标`)
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

  /**
   * 初始化动画
   */
  private initAnimation(): void {
    // 直接在节点间移动
    if (this.nodePositions.length > 0) {
      // 设置节点位置、连接路径和标签位置
      this.teleportAnimationController2.setPositions(
        this.nodePositions,
        this.connectionPaths,
        this.labelPositions,
      )

      // 创建瞬移节点
      this.teleportAnimationController2.createTeleportNode()

      // 启动动画
      this.isAnimationPlaying = true
      this.startAnimation()

      // console.log('直接移动动画已启动')
    } else {
      // console.warn('没有可用的节点位置，无法创建动画')
    }
  }

  /**
   * 开始动画
   */
  public startAnimation(): void {
    this.teleportAnimationController2.startAnimation()
    this.isAnimationPlaying = true
  }

  /**
   * 停止动画
   */
  public stopAnimation(): void {
    this.teleportAnimationController2.stopAnimation()
    this.isAnimationPlaying = false
  }

  /**
   * 释放资源
   */
  public dispose(): void {
    this.stopAnimation()
    this.teleportAnimationController2.dispose()

    // 清除节点和连接
    this.nodeGroup.clear()
    this.nodesMap.clear()
    this.connectionPaths = []
    this.nodePositions = []
    this.labelPositions = []

    // console.log('工作流节点渲染器已释放资源')
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

    // 计算主要移动方向（X、Y或Z）
    const absX = Math.abs(direction.x)
    const absY = Math.abs(direction.y)
    const absZ = Math.abs(direction.z)

    // 确定主要移动方向
    let primaryDirection = 'x' // 默认为水平方向
    if (absZ > absX) {
      primaryDirection = 'z' // 垂直方向
    }

    // 根据主要移动方向选择合适的偏移距离
    let offsetDistance
    if (primaryDirection === 'x') {
      // 水平方向移动，使用节点宽度的一半作为偏移
      offsetDistance = FIXED_NODE_WIDTH / 2 + 2
    } else {
      // 垂直方向移动，使用节点深度的一半作为偏移
      offsetDistance = FIXED_NODE_DEPTH / 2 + 2
    }

    // 计算调整后的起点和终点
    const adjustedStartPosition = startPosition
      .clone()
      .add(direction.clone().multiplyScalar(offsetDistance))
    const adjustedEndPosition = endPosition
      .clone()
      .sub(direction.clone().multiplyScalar(offsetDistance))

    // 创建直角连接线的点
    const points: THREE.Vector3[] = []
    points.push(adjustedStartPosition.clone())

    // 根据主要移动方向创建不同的拐角点
    if (primaryDirection === 'x') {
      // 水平方向为主 - 先水平移动，再垂直移动
      const midPoint1 = new THREE.Vector3(
        adjustedEndPosition.x, // 终点的X坐标
        adjustedStartPosition.y, // 起点的Y坐标
        adjustedStartPosition.z, // 起点的Z坐标
      )
      points.push(midPoint1)
    } else {
      // 垂直方向为主 - 先垂直移动，再水平移动
      const midPoint1 = new THREE.Vector3(
        adjustedStartPosition.x, // 起点的X坐标
        adjustedStartPosition.y, // 起点的Y坐标
        adjustedEndPosition.z, // 终点的Z坐标
      )
      points.push(midPoint1)
    }

    // 添加终点
    points.push(adjustedEndPosition.clone())

    // 计算线条中点位置，用于放置标签
    let midPoint: THREE.Vector3

    // 判断连接线是主要水平方向还是垂直方向
    if (primaryDirection === 'x') {
      // 水平方向为主的连接线 - 标签放在水平段的中间
      midPoint = new THREE.Vector3(
        (adjustedStartPosition.x + points[1].x) / 2, // X坐标取水平段的中点
        adjustedStartPosition.y + 15, // Y坐标稍微上移，使标签更明显
        adjustedStartPosition.z, // Z坐标与水平段相同
      )
    } else {
      // 垂直方向为主的连接线 - 标签放在垂直段的中间
      midPoint = new THREE.Vector3(
        adjustedStartPosition.x, // X坐标与起点相同
        adjustedStartPosition.y + 15, // Y坐标稍微上移，使标签更明显
        (adjustedStartPosition.z + points[1].z) / 2, // Z坐标取垂直段的中点
      )
    }

    // 根据流程类型选择颜色，不再考虑状态
    const color = 0x4caf50

    // 创建连接线段 - 分别处理水平段和垂直段
    this.createConnectionSegments(points, primaryDirection, color, sourceNodeData)

    // 计算箭头位置和方向 - 箭头应该指向目标节点
    // 将箭头位置稍微向后移动，不要贴在节点上
    const arrowDirection = new THREE.Vector3()
      .subVectors(adjustedEndPosition, points[points.length - 2])
      .normalize()

    // 箭头位置向后偏移一点距离
    const arrowPosition = adjustedEndPosition.clone().sub(arrowDirection.clone().multiplyScalar(8))

    // 创建箭头指示方向
    const arrow = this.createArrow(
      arrowPosition,
      arrowDirection,
      color,
      primaryDirection,
      adjustedStartPosition,
      adjustedEndPosition,
    )

    // 为箭头设置相同的connectionId
    if (arrow) {
      arrow.userData.connectionId = `${sourceNodeData.id}->${sourceNodeData.to}`
      arrow.userData.type = 'connectionArrow'
    }

    // 添加连接线标签
    this.createConnectionLabel(midPoint, sourceNodeData, status)
  }

  /**
   * 创建连接线段 - 分别处理水平段和垂直段
   */
  private createConnectionSegments(
    points: THREE.Vector3[],
    primaryDirection: string,
    color: number,
    sourceNodeData: WorkflowNode,
  ): void {
    const connectionId = `${sourceNodeData.id}->${sourceNodeData.to}`

    if (primaryDirection === 'x') {
      // 水平方向为主：第一段是水平线（虚线），第二段是垂直线（实线）

      // 第一段：水平线（虚线带动画）
      const horizontalPoints = [points[0], points[1]]
      const horizontalGeometry = new THREE.BufferGeometry().setFromPoints(horizontalPoints)

      const horizontalMaterial = new THREE.LineDashedMaterial({
        color: color,
        linewidth: 3,
        transparent: true,
        opacity: 0.8,
        dashSize: 8,
        gapSize: 4,
      })

      const horizontalLine = new THREE.Line(horizontalGeometry, horizontalMaterial)
      horizontalLine.computeLineDistances() // 计算虚线距离

      // 添加动画效果
      this.addDashAnimation(horizontalLine, horizontalMaterial)

      horizontalLine.userData = {
        curvePoints: horizontalPoints,
        connectionType: 'horizontal',
        flowType: DEFAULT_FLOW_TYPE,
        connectionId: connectionId,
        type: 'connectionLine',
      }

      this.nodeGroup.add(horizontalLine)

      // 第二段：垂直线（实线）
      if (points.length > 2) {
        const verticalPoints = [points[1], points[2]]
        const verticalGeometry = new THREE.BufferGeometry().setFromPoints(verticalPoints)

        const verticalMaterial = new THREE.LineBasicMaterial({
          color: color,
          linewidth: 3,
          transparent: true,
          opacity: 0.8,
        })

        const verticalLine = new THREE.Line(verticalGeometry, verticalMaterial)

        verticalLine.userData = {
          curvePoints: verticalPoints,
          connectionType: 'vertical',
          flowType: DEFAULT_FLOW_TYPE,
          connectionId: connectionId,
          type: 'connectionLine',
        }

        this.nodeGroup.add(verticalLine)
      }
    } else {
      // 垂直方向为主：第一段是垂直线（实线），第二段是水平线（虚线）

      // 第一段：垂直线（实线）
      const verticalPoints = [points[0], points[1]]
      const verticalGeometry = new THREE.BufferGeometry().setFromPoints(verticalPoints)

      const verticalMaterial = new THREE.LineBasicMaterial({
        color: color,
        linewidth: 3,
        transparent: true,
        opacity: 0.8,
      })

      const verticalLine = new THREE.Line(verticalGeometry, verticalMaterial)

      verticalLine.userData = {
        curvePoints: verticalPoints,
        connectionType: 'vertical',
        flowType: DEFAULT_FLOW_TYPE,
        connectionId: connectionId,
        type: 'connectionLine',
      }

      this.nodeGroup.add(verticalLine)

      // 第二段：水平线（虚线带动画）
      if (points.length > 2) {
        const horizontalPoints = [points[1], points[2]]
        const horizontalGeometry = new THREE.BufferGeometry().setFromPoints(horizontalPoints)

        const horizontalMaterial = new THREE.LineDashedMaterial({
          color: color,
          linewidth: 3,
          transparent: true,
          opacity: 0.8,
          dashSize: 8,
          gapSize: 4,
        })

        const horizontalLine = new THREE.Line(horizontalGeometry, horizontalMaterial)
        horizontalLine.computeLineDistances() // 计算虚线距离

        // 添加动画效果
        this.addDashAnimation(horizontalLine, horizontalMaterial)

        horizontalLine.userData = {
          curvePoints: horizontalPoints,
          connectionType: 'horizontal',
          flowType: DEFAULT_FLOW_TYPE,
          connectionId: connectionId,
          type: 'connectionLine',
        }

        this.nodeGroup.add(horizontalLine)
      }
    }

    // 将连接点添加到连接路径集合中，用于瞬移动画
    this.connectionPaths.push(points)
  }

  /**
   * 为虚线添加动画效果
   */
  private addDashAnimation(line: THREE.Line, material: THREE.LineDashedMaterial): void {
    // 存储原始的 dashSize 和 gapSize
    const originalDashSize = material.dashSize
    const originalGapSize = material.gapSize
    let animationPhase = 0

    const animate = () => {
      animationPhase += 0.05 // 控制动画速度

      // 通过改变 dashSize 和 gapSize 来创建流动效果
      const offset = Math.sin(animationPhase) * 2
      material.dashSize = originalDashSize + offset
      material.gapSize = originalGapSize - offset * 0.5

      // 重新计算线段距离以应用新的虚线参数
      line.computeLineDistances()

      // 继续动画
      requestAnimationFrame(animate)
    }

    animate()
  }

  /**
   * 创建连接线标签
   */
  private createConnectionLabel(
    position: THREE.Vector3,
    nodeData: WorkflowNode,
    status: string,
  ): void {
    // 获取状态文本
    const statusText = nodeData.stateInfo

    // 构建标签文本
    const labelText = statusText ? statusText : ''

    // 如果有标签文本，创建标签精灵
    if (labelText) {
      // 创建标签纹理
      const texture = this.createLabelTexture(labelText, status)

      // 创建精灵材质
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false, // 禁用深度测试，确保标签总是可见
      })

      // 创建精灵
      const sprite = new THREE.Sprite(spriteMaterial)

      // 设置精灵位置，稍微上移一点
      sprite.position.copy(position)
      sprite.position.y += 10

      // 设置精灵大小
      sprite.scale.set(40, 20, 1)

      // 设置渲染顺序
      sprite.renderOrder = 10 // 设置较高的渲染顺序，确保在普通节点之上，但在紫色节点之下

      // 添加连接线标签ID到userData
      sprite.userData = {
        type: 'connectionLabel',
        labelText: `${nodeData.id}->${nodeData.to}`,
        connectionId: `${nodeData.id}->${nodeData.to}`,
        fromNodeId: nodeData.id,
        toNodeId: nodeData.to,
        status,
        nodeData: nodeData, // 添加节点数据引用
      }

      // 为标签添加点击事件处理
      sprite.onBeforeRender = () => {
        // 检查鼠标是否悬停在标签上
        // 这里可以添加悬停效果
      }

      // 添加到场景
      this.nodeGroup.add(sprite)

      // 记录标签位置和文本，用于紫色动画节点
      this.labelPositions.push({
        position: position.clone(),
        labelText: `${nodeData.id}->${nodeData.to}`,
      })
    }
  }

  /**
   * 创建标签纹理
   * @param text 标签文本
   * @param status 状态
   * @returns 纹理
   */
  private createLabelTexture(text: string, status: string): THREE.Texture {
    // 创建Canvas元素 - 增加分辨率提高清晰度
    const canvas = document.createElement('canvas')
    canvas.width = 512 // 增加分辨率
    canvas.height = 256 // 增加分辨率

    // 获取绘图上下文
    const context = canvas.getContext('2d')
    if (!context) {
      return new THREE.Texture()
    }

    // 统一使用黄色背景、黑色文字样式，类似于"历时35天"的效果
    const backgroundColor = 'rgba(255, 193, 7, 0.9)' // 黄色背景，接近#FFC107
    const textColor = 'rgba(0, 0, 0, 0.9)' // 黑色文字

    // 绘制圆角矩形背景
    const cornerRadius = 20 // 圆角半径
    context.fillStyle = backgroundColor
    context.beginPath()
    context.moveTo(cornerRadius, 0)
    context.lineTo(canvas.width - cornerRadius, 0)
    context.quadraticCurveTo(canvas.width, 0, canvas.width, cornerRadius)
    context.lineTo(canvas.width, canvas.height - cornerRadius)
    context.quadraticCurveTo(
      canvas.width,
      canvas.height,
      canvas.width - cornerRadius,
      canvas.height,
    )
    context.lineTo(cornerRadius, canvas.height)
    context.quadraticCurveTo(0, canvas.height, 0, canvas.height - cornerRadius)
    context.lineTo(0, cornerRadius)
    context.quadraticCurveTo(0, 0, cornerRadius, 0)
    context.closePath()
    context.fill()

    // 添加边框
    context.lineWidth = 4
    context.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    context.stroke()

    // 设置文本样式
    context.fillStyle = textColor
    context.textAlign = 'center'
    context.textBaseline = 'middle'

    // 计算合适的字体大小
    const fontSize = Math.floor(canvas.height * 0.4)
    context.font = `bold ${fontSize}px Microsoft YaHei`

    // 绘制文本
    context.fillText(text, canvas.width / 2, canvas.height / 2)

    // 添加发光效果
    context.shadowColor = 'rgba(0, 0, 0, 0.5)' // 黑色阴影，增强文字可读性
    context.shadowBlur = 10
    context.shadowOffsetX = 0
    context.shadowOffsetY = 0
    context.fillText(text, canvas.width / 2, canvas.height / 2)

    // 创建纹理
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true

    // 设置纹理的映射和过滤方式，提高清晰度
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = 16 // 增加各向异性过滤级别，提高倾斜视角下的清晰度

    return texture
  }

  /**
   * 创建箭头
   * @param position 箭头位置
   * @param direction 箭头方向（指向目标节点）
   * @param color 颜色
   * @param primaryDirection 主要连接方向 ('x' 或 'z')
   * @param startPosition 连接起始位置
   * @param endPosition 连接结束位置
   */
  private createArrow(
    position: THREE.Vector3,
    direction: THREE.Vector3,
    color: number,
    primaryDirection: string,
    startPosition: THREE.Vector3,
    endPosition: THREE.Vector3,
  ): THREE.Mesh | null {
    // 创建简单的三角形箭头几何体
    const arrowGeometry = new THREE.BufferGeometry()

    // 标准化方向向量
    // const normalizedDirection = direction.clone().normalize()

    let vertices: number[] = [] // 初始化为空数组

    // 使用primaryDirection来判断箭头类型，而不是依赖方向向量的大小比较
    if (primaryDirection === 'x') {
      vertices = [
        0,
        0,
        0, // 箭头尖端
        -16,
        0,
        5, // 左后角 - 增加长度，减小宽度使其更尖锐
        -16,
        0,
        -5, // 左前角 - 增加长度，减小宽度使其更尖锐
      ]
    } else {
      // 通过比较起始和结束位置的Z坐标来判断方向
      const deltaZ = endPosition.z - startPosition.z

      if (deltaZ > 0) {
        // 向下的箭头 (正Z方向)
        vertices = [
          0,
          0,
          0, // 箭头尖端
          -5,
          0,
          -16, // 左后角 - 在X轴方向展开，向后延伸
          5,
          0,
          -16, // 右后角 - 在X轴方向展开，向后延伸
        ]
      } else {
        // 向上的箭头 (负Z方向)
        vertices = [
          0,
          0,
          0, // 箭头尖端
          -5,
          0,
          16, // 左前角 - 在X轴方向展开，向前延伸
          5,
          0,
          16, // 右前角 - 在X轴方向展开，向前延伸
        ]
      }
    }

    // 设置顶点数据
    arrowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))

    // 计算法向量
    arrowGeometry.computeVertexNormals()

    // 创建材质
    const arrowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide, // 双面材质，确保从各个角度都能看到
    })

    // 创建箭头网格
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial)

    // 设置箭头位置
    arrow.position.copy(position)

    // 添加到场景
    this.nodeGroup.add(arrow)

    return arrow
  }

  /**
   * 处理节点点击事件
   * @param event 鼠标事件
   * @param nodeId 节点ID
   * @param nodeData 节点数据
   */
  public handleNodeClick(
    event: MouseEvent,
    nodeId: string,
    nodeData: WorkflowNode,
    userData: any,
  ): void {
    // console.log(`节点被点击: ID=${nodeId}, 标题=${nodeData.title}, 类型=${nodeData.type}`, nodeData)

    // 根据节点数据中的 type 字段触发不同的自定义事件
    const nodeType = nodeData.type || 'reviewNode'

    if (nodeType === 'reviewNode') {
      // 审核节点点击 - 打开审核操作弹窗
      const clickEvent = new CustomEvent('workflow-review-node-click', {
        detail: {
          nodeId,
          nodeData,
          userData,
          originalEvent: event,
        },
      })
      document.dispatchEvent(clickEvent)
    } else if (nodeType === 'reviewStatus') {
      // 审核状态点击 - 打开状态详情弹窗
      const clickEvent = new CustomEvent('workflow-status-node-click', {
        detail: {
          nodeId,
          nodeData,
          originalEvent: event,
        },
      })
      document.dispatchEvent(clickEvent)
    } else {
      // 其他类型节点 - 触发通用点击事件
      const clickEvent = new CustomEvent('workflow-node-click', {
        detail: {
          nodeId,
          nodeData,
          originalEvent: event,
        },
      })
      document.dispatchEvent(clickEvent)
    }

    // 这里可以添加其他点击效果，例如高亮显示节点
    // 可以在将来实现
  }

  /**
   * 计算动画序列并绑定到节点和连接线
   */
  private calculateAndBindAnimationSequence(nodes: WorkflowNode[]): void {
    // 计算动画序列
    this.animationSequenceItems = calculateAnimationSequence(
      nodes,
      this.nodePositions,
      this.labelPositions,
    )

    // console.log(`计算得到${this.animationSequenceItems.length}个动画序列项`)

    // 构建映射关系
    for (const item of this.animationSequenceItems) {
      if (item.type === 'node') {
        this.nodeIdToSequenceItem.set(item.id, item)
      } else if (item.type === 'connection') {
        this.connectionIdToSequenceItem.set(item.id, item)
      }
    }

    // 为节点添加序列信息
    for (const child of this.nodeGroup.children) {
      if (child.userData?.nodeId) {
        const nodeId = child.userData.nodeId
        const sequenceItem = this.nodeIdToSequenceItem.get(nodeId)

        if (sequenceItem) {
          // 将序列信息添加到节点的userData中
          child.userData.sequenceInfo = {
            sequence: sequenceItem.sequence,
            type: sequenceItem.type,
            flowColorIndex: sequenceItem.flowColorIndex,
            flowColorConfig: sequenceItem.flowColorConfig,
          }

          // 应用流程颜色配置到节点
          if (sequenceItem.flowColorConfig && child instanceof THREE.Mesh) {
            this.applyNodeFlowColorConfig(child, sequenceItem.flowColorConfig)
          }

          // console.log(
          //   `为节点${nodeId}绑定序列值: ${sequenceItem.sequence}, 流程颜色索引: ${sequenceItem.flowColorIndex}`,
          // )
        }
      } else if (child.userData?.connectionId) {
        const connectionId = child.userData.connectionId
        const sequenceItem = this.connectionIdToSequenceItem.get(connectionId)

        if (sequenceItem) {
          // 将序列信息添加到连接线的userData中
          child.userData.sequenceInfo = {
            sequence: sequenceItem.sequence,
            type: sequenceItem.type,
            flowColorIndex: sequenceItem.flowColorIndex,
            flowColorConfig: sequenceItem.flowColorConfig,
          }

          // 应用流程颜色配置到连接线
          if (sequenceItem.flowColorConfig) {
            this.applyConnectionFlowColorConfig(child, sequenceItem.flowColorConfig)
          }

          // console.log(
          //   `为连接线${connectionId}绑定序列值: ${sequenceItem.sequence}, 流程颜色索引: ${sequenceItem.flowColorIndex}`,
          // )
        }
      }
    }

    // 将排序后的位置传递给动画控制器
    const sortedPositions = this.animationSequenceItems
      .sort((a, b) => a.sequence - b.sequence)
      .map((item) => item.position)

    // 设置动画控制器的位置
    this.teleportAnimationController2.setPositions(
      this.nodePositions,
      this.connectionPaths,
      this.labelPositions,
    )
  }

  /**
   * 应用流程颜色配置到节点
   * @param nodeMesh 节点网格
   * @param flowConfig 流程颜色配置
   */
  private applyNodeFlowColorConfig(nodeMesh: THREE.Mesh, flowConfig: FlowColorConfig): void {
    // 检查节点是否有材质
    if (nodeMesh.material instanceof THREE.MeshStandardMaterial) {
      // 应用节点颜色
      nodeMesh.material.color.setHex(flowConfig.nodeColor)

      // 设置发光属性
      nodeMesh.material.emissive.setHex(flowConfig.emissiveColor)
      nodeMesh.material.emissiveIntensity = flowConfig.emissiveIntensity * 0.6 // 稍微降低强度

      // console.log(`应用节点颜色: 0x${flowConfig.nodeColor.toString(16)}`)
    } else if (Array.isArray(nodeMesh.material)) {
      // 如果节点使用了材质数组，应用到每个面（除了顶面，顶面是文本贴图）
      for (let i = 0; i < nodeMesh.material.length; i++) {
        const mat = nodeMesh.material[i]
        if (mat instanceof THREE.MeshStandardMaterial) {
          // 应用节点颜色
          mat.color.setHex(flowConfig.nodeColor)

          // 设置发光属性
          mat.emissive.setHex(flowConfig.emissiveColor)
          mat.emissiveIntensity = flowConfig.emissiveIntensity * 0.6
        }
      }
      // console.log(`应用节点颜色到材质数组: 0x${flowConfig.nodeColor.toString(16)}`)
    }
  }

  /**
   * 应用流程颜色配置到连接线
   * @param connection 连接线对象
   * @param flowConfig 流程颜色配置
   */
  private applyConnectionFlowColorConfig(
    connection: THREE.Object3D,
    flowConfig: FlowColorConfig,
  ): void {
    // 对于连接线（Line对象）
    if (connection instanceof THREE.Line) {
      if (connection.material instanceof THREE.LineBasicMaterial) {
        // 应用连接线颜色
        connection.material.color.setHex(flowConfig.edgeColor)
        // console.log(`应用连接线颜色: 0x${flowConfig.edgeColor.toString(16)}`)
      } else if (connection.material instanceof THREE.LineDashedMaterial) {
        // 应用虚线连接线颜色
        connection.material.color.setHex(flowConfig.edgeColor)
        // console.log(`应用虚线连接线颜色: 0x${flowConfig.edgeColor.toString(16)}`)
      }
    }
    // 对于箭头（Mesh对象，使用ConeGeometry）
    else if (connection instanceof THREE.Mesh && connection.userData?.type === 'connectionArrow') {
      // 应用箭头颜色
      if (connection.material instanceof THREE.MeshBasicMaterial) {
        connection.material.color.setHex(flowConfig.edgeColor)
        // console.log(`应用箭头颜色: 0x${flowConfig.edgeColor.toString(16)}`)
      }
    }
    // 对于连接线标签（Sprite对象）
    else if (
      connection instanceof THREE.Sprite &&
      connection.material instanceof THREE.SpriteMaterial
    ) {
      // 标签使用的是纹理，无法直接修改颜色
      // 这里我们可以记录颜色配置，以便后续可能的重新创建
      connection.userData.flowColorConfig = flowConfig
      // console.log(`记录标签的流程颜色配置: 0x${flowConfig.edgeColor.toString(16)}`)
    }
  }
}
