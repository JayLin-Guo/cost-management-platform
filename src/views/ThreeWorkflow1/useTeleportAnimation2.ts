import * as THREE from 'three'
import {
  FIXED_NODE_WIDTH,
  FIXED_NODE_HEIGHT,
  FIXED_NODE_DEPTH,
  ANIMATION_CONFIG,
  COLORS,
} from './config'
import type { WorkflowNode } from './types'
import {
  calculateAnimationSequence,
  type AnimationSequenceItem,
  type FlowColorConfig,
} from './useAnimationSequence'

// 增加自定义节点类型，包含sequence属性
interface ExtendedWorkflowNode extends WorkflowNode {
  sequence?: number
}

/**
 * 连接线标签位置信息
 */
interface ConnectionLabelPosition {
  position: THREE.Vector3
  labelText: string
}

/**
 * 节点位置信息
 */
interface NodePositionInfo {
  position: THREE.Vector3 // 位置
  nodeId?: string // 节点ID
  isLabel: boolean // 是否是标签
  sequence: number // 序列值
  flowColorIndex: number // 流程颜色索引
  flowColorConfig: FlowColorConfig // 流程颜色配置
}

/**
 * 瞬移节点动画控制器 - 方案2
 * 直接在节点之间移动，不沿着路径移动
 */
export class TeleportAnimationController2 {
  // 瞬移节点
  private teleportNode: THREE.Mesh | null = null
  // 节点位置集合
  private nodePositions: THREE.Vector3[] = []
  // 连接线标签位置集合
  private labelPositions: ConnectionLabelPosition[] = []
  // 所有停留点（包括节点和标签）
  private allStopPositions: THREE.Vector3[] = []
  // 节点位置信息集合
  private nodePositionInfos: NodePositionInfo[] = []
  // 工作流节点数据
  private workflowNodes: ExtendedWorkflowNode[] = []
  // 节点ID与位置的映射
  private nodeIdToPositionMap: Map<string, THREE.Vector3> = new Map()
  // 动画序列集合
  private animationSequenceItems: AnimationSequenceItem[] = []
  // 当前序列索引
  private currentSequenceIndex: number = 0
  // 动画状态
  private isAnimationPlaying: boolean = false
  private animationClock: THREE.Clock = new THREE.Clock()
  private teleportTimer: number = 0
  private teleportInterval: number = ANIMATION_CONFIG.teleport.interval
  private currentPositionIndex: number = 0
  private animationLoopId: number | null = null
  // 场景引用
  private nodeGroup: THREE.Group

  /**
   * 构造函数
   * @param nodeGroup 节点组
   */
  constructor(nodeGroup: THREE.Group) {
    this.nodeGroup = nodeGroup
  }

  /**
   * 设置工作流节点数据
   * @param nodes 工作流节点数据
   */
  public setWorkflowNodes(nodes: ExtendedWorkflowNode[]): void {
    this.workflowNodes = nodes
    // console.log(`设置了${nodes.length}个工作流节点数据`)
  }

  /**
   * 设置节点位置和连接线标签位置
   * @param nodePositions 节点位置集合
   * @param connectionPaths 连接路径点集合
   * @param labelPositions 连接线标签位置集合
   */
  public setPositions(
    nodePositions: THREE.Vector3[],
    connectionPaths: THREE.Vector3[][],
    labelPositions: ConnectionLabelPosition[],
  ): void {
    this.nodePositions = nodePositions
    this.labelPositions = labelPositions

    // 构建节点ID到位置的映射
    this.buildNodeIdToPositionMap()

    // 合并所有停留点
    this.mergeStopPositions()

    // console.log(`设置了${nodePositions.length}个节点位置和${labelPositions.length}个标签位置，共${this.allStopPositions.length}个停留点`)
  }

  /**
   * 构建节点ID到位置的映射
   */
  private buildNodeIdToPositionMap(): void {
    this.nodeIdToPositionMap.clear()

    // 如果没有工作流节点数据，则无法构建映射
    if (!this.workflowNodes.length) {
      // console.warn('没有工作流节点数据，无法构建节点ID到位置的映射')
      return
    }

    // 构建节点ID到位置索引的映射
    for (let i = 0; i < this.workflowNodes.length; i++) {
      const node = this.workflowNodes[i]
      if (i < this.nodePositions.length) {
        this.nodeIdToPositionMap.set(node.id, this.nodePositions[i])
      }
    }

    // console.log(`构建了${this.nodeIdToPositionMap.size}个节点ID到位置的映射`)
  }

  /**
   * 计算动画轨迹顺序
   * 基于工作流节点数据计算每个位置的顺序值
   */
  private calculateAnimationSequence(): void {
    // 使用工作流节点数据、节点位置和标签位置计算动画序列
    this.animationSequenceItems = calculateAnimationSequence(
      this.workflowNodes,
      this.nodePositions,
      this.labelPositions,
    )

    // console.log(`计算得到${this.animationSequenceItems.length}个动画序列项`)

    // 将动画序列项转换为节点位置信息
    this.nodePositionInfos = this.animationSequenceItems.map((item) => ({
      position: item.position,
      nodeId: item.type === 'node' ? item.id : undefined,
      isLabel: item.type === 'connection',
      sequence: item.sequence,
      flowColorIndex: item.flowColorIndex,
      flowColorConfig: item.flowColorConfig,
    }))

    // 按序列值排序
    this.nodePositionInfos.sort((a, b) => a.sequence - b.sequence)

    // console.log(`转换得到${this.nodePositionInfos.length}个节点位置信息`)
  }

  /**
   * 查找两个节点之间的标签位置
   */
  private findLabelBetweenNodes(nodeId1: string, nodeId2: string): ConnectionLabelPosition | null {
    // 根据标签文本查找
    const labelText = `${nodeId1}->${nodeId2}`
    const label = this.labelPositions.find((l) => l.labelText === labelText)

    if (label) {
      return label
    }

    // 如果找不到精确匹配，则查找包含两个节点ID的标签
    return (
      this.labelPositions.find(
        (l) => l.labelText.includes(nodeId1) && l.labelText.includes(nodeId2),
      ) || null
    )
  }

  /**
   * 合并所有停留点（节点位置和标签位置）
   * 并按照计算的顺序排序
   */
  private mergeStopPositions(): void {
    // 计算动画轨迹顺序
    this.calculateAnimationSequence()

    // 提取排序后的位置
    this.allStopPositions = this.nodePositionInfos.map((info) => info.position)

    // console.log(` 序列值排序后的停留点数量: ${this.allStopPositions.length}`)
  }

  /**
   * 检查两个位置是否非常接近
   */
  private isPositionClose(pos1: THREE.Vector3, pos2: THREE.Vector3): boolean {
    const threshold = 10 // 位置接近的阈值
    return pos1.distanceTo(pos2) < threshold
  }

  /**
   * 创建瞬移节点
   * 创建一个长方形平面形状悬浮在节点上方
   * @returns 创建的瞬移节点
   */
  public createTeleportNode(): THREE.Mesh {
    // 如果已经存在瞬移节点，先移除
    if (this.teleportNode && this.nodeGroup.children.includes(this.teleportNode)) {
      this.nodeGroup.remove(this.teleportNode)
    }

    // 获取配置
    const teleportConfig = ANIMATION_CONFIG.teleport

    // 获取初始流程颜色配置（如果有）
    let initialFlowConfig: FlowColorConfig | undefined = undefined
    if (this.nodePositionInfos.length > 0) {
      initialFlowConfig = this.nodePositionInfos[0].flowColorConfig
    }

    // 使用流程颜色配置或默认颜色
    const teleportNodeColor = initialFlowConfig
      ? initialFlowConfig.animationColor
      : COLORS.animation.teleportNode
    const teleportEdgeColor = initialFlowConfig
      ? initialFlowConfig.edgeColor
      : COLORS.animation.teleportEdge
    const teleportEmissiveColor = initialFlowConfig
      ? initialFlowConfig.emissiveColor
      : COLORS.animation.teleportEmissive

    // 使用流程颜色配置或默认材质参数
    const emissiveIntensity = initialFlowConfig ? initialFlowConfig.emissiveIntensity : 1.0
    const opacity = initialFlowConfig ? initialFlowConfig.opacity : 0.8
    const metalness = initialFlowConfig ? initialFlowConfig.metalness : 0.8
    const roughness = initialFlowConfig ? initialFlowConfig.roughness : 0.1

    // 创建一个长方形平面，与节点顶面保持相同大小，但稍微放大一些
    const nodeGeometry = new THREE.BoxGeometry(
      FIXED_NODE_WIDTH * teleportConfig.nodeWidthScale * 1.2, // 宽度放大20%
      FIXED_NODE_HEIGHT * teleportConfig.nodeHeightScale * 1.5, // 高度放大50%
      FIXED_NODE_DEPTH * teleportConfig.nodeDepthScale * 1.2, // 深度放大20%
    )

    // 创建瞬移节点材质 - 使用流程颜色配置
    const nodeMaterial = new THREE.MeshStandardMaterial({
      color: teleportNodeColor,
      emissive: teleportEmissiveColor,
      emissiveIntensity: emissiveIntensity,
      metalness: metalness,
      roughness: roughness,
      transparent: true,
      opacity: opacity,
      depthTest: false, // 禁用深度测试，确保总是渲染在最上层
    })

    // 创建瞬移节点网格
    this.teleportNode = new THREE.Mesh(nodeGeometry, nodeMaterial)

    // 设置渲染顺序，确保瞬移节点在普通节点上层
    this.teleportNode.renderOrder = 100 // 增加渲染顺序值，确保在所有其他对象之上

    // 添加发光边缘
    const edgeGeometry = new THREE.EdgesGeometry(nodeGeometry)
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: teleportEdgeColor,
      transparent: true,
      opacity: 1.0, // 边缘不透明度保持较高
      linewidth: 3, // 增加线宽
      depthTest: false, // 边缘也禁用深度测试
    })
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial)
    edges.renderOrder = 101 // 边缘渲染顺序更高
    this.teleportNode.add(edges)

    // 设置初始位置
    this.setInitialPosition()

    // 添加到场景 - 确保添加在最后，使其渲染在其他节点之上
    this.nodeGroup.add(this.teleportNode)

    if (initialFlowConfig) {
      // console.log(`创建了瞬移节点，应用初始流程颜色配置: 动画节点颜色 0x${initialFlowConfig.animationColor.toString(16)}`)
    } else {
      // console.log('创建了瞬移节点，使用默认颜色配置')
    }

    return this.teleportNode
  }

  /**
   * 设置初始位置
   * 将瞬移节点放置在第一个节点位置
   */
  private setInitialPosition(): void {
    if (!this.teleportNode) {
      return
    }

    if (this.allStopPositions.length > 0) {
      // 获取第一个停留点位置
      const initialPosition = this.allStopPositions[0].clone()

      // 将瞬移节点放置在普通节点顶部上方，使用统一的悬浮高度
      initialPosition.y = ANIMATION_CONFIG.teleport.nodeHeight

      this.teleportNode.position.copy(initialPosition)

      // console.log(`设置瞬移节点初始位置: x=${initialPosition.x}, y=${initialPosition.y}, z=${initialPosition.z}`)
    } else {
      // console.warn('没有可用的停留点位置，无法设置瞬移节点初始位置')
    }
  }

  /**
   * 开始瞬移动画
   * 让瞬移节点在各个节点之间直接跳转
   */
  public startAnimation(): void {
    // 如果没有停留点位置或瞬移节点，不执行动画
    if (this.allStopPositions.length === 0 || !this.teleportNode) {
      // console.warn('没有可用的停留点位置或瞬移节点')
      return
    }

    // 重置动画状态
    this.currentPositionIndex = 0
    this.isAnimationPlaying = true
    this.teleportTimer = 0

    // 获取配置
    const config = ANIMATION_CONFIG.teleport

    // 获取初始流程颜色配置
    if (this.nodePositionInfos.length > 0) {
      const initialFlowConfig = this.nodePositionInfos[0].flowColorConfig
      if (initialFlowConfig) {
        // 应用初始流程颜色配置
        this.applyFlowColorConfig(initialFlowConfig)
        // console.log(`应用初始流程颜色配置: 动画节点颜色 0x${initialFlowConfig.animationColor.toString(16)}`)
      }
    }

    // 使用配置文件中的间隔时间和速度因子
    // speedFactor值越大，动画越慢
    this.teleportInterval = config.interval * config.nodeStayRatio * config.speedFactor

    this.animationClock.start()

    // 启动动画循环
    this.updateAnimation()

    // console.log(`瞬移动画已启动，速度因子: ${config.speedFactor}  隔: ${this.teleportInterval.toFixed(2)}秒`)
  }

  /**
   * 停止瞬移动画
   */
  public stopAnimation(): void {
    this.isAnimationPlaying = false

    if (this.animationLoopId !== null) {
      cancelAnimationFrame(this.animationLoopId)
      this.animationLoopId = null
    }

    // console.log('瞬移动画已停止')
  }

  /**
   * 更新瞬移动画
   * 实现节点之间直接跳转的效果
   */
  private updateAnimation(): void {
    if (!this.isAnimationPlaying || !this.teleportNode || this.allStopPositions.length === 0) {
      return
    }

    // 获取配置
    const config = ANIMATION_CONFIG.teleport

    // 获取时间增量
    const delta = this.animationClock.getDelta()

    // 更新瞬移计时器
    this.teleportTimer += delta

    // 当达到瞬移间隔时，移动到下一个停留点位置
    if (this.teleportTimer >= this.teleportInterval) {
      // 重置计时器
      this.teleportTimer = 0

      // 检查是否需要回到第一个位置
      let nextPositionIndex = this.currentPositionIndex + 1

      // 如果已经到达最后一个位置，则回到第一个位置
      if (nextPositionIndex >= this.allStopPositions.length) {
        nextPositionIndex = 0
        // console.log('动画完成一个完整循环，回到第一个位置')
      }

      this.currentPositionIndex = nextPositionIndex

      // 获取下一个停留点位置
      const nextPosition = this.allStopPositions[this.currentPositionIndex].clone()

      // 设置Y坐标（悬浮高度）并更新位置
      const currentPosInfo = this.nodePositionInfos[this.currentPositionIndex]
      const flowConfig = currentPosInfo?.flowColorConfig

      // 使用统一的悬浮高度，不再从流程配置中获取
      nextPosition.y = ANIMATION_CONFIG.teleport.nodeHeight
      this.teleportNode.position.copy(nextPosition)

      // 应用当前位置的流程颜色配置
      if (flowConfig) {
        this.applyFlowColorConfig(flowConfig)
      }

      // 高亮显示当前位置对应的节点或连接线
      this.highlightCurrentElement()

      // 检查当前位置是否是标签位置
      const isLabelPosition = currentPosInfo
        ? currentPosInfo.isLabel
        : this.isLabelPosition(nextPosition)

      // 如果是标签位置，使用更短的停留时间
      if (isLabelPosition) {
        this.teleportInterval = config.interval * config.labelStayRatio * config.speedFactor
      } else {
        this.teleportInterval = config.interval * config.nodeStayRatio * config.speedFactor
      }

      // console.log(`紫色节点移动到停留点索引 ${this.currentPositionIndex}, 序列值: ${currentPosInfo?.sequence}, 流程颜色索引: ${currentPosInfo?.flowColorIndex}, 是标签位置: ${isLabelPosition}`)
    }

    // 添加悬浮效果 - 只修改Y坐标，不影响X和Z坐标
    if (this.teleportNode) {
      // 获取当前流程配置
      const currentPosInfo = this.nodePositionInfos[this.currentPositionIndex]
      const flowConfig = currentPosInfo?.flowColorConfig

      // 使用统一的浮动速度和浮动量，不再从流程配置中获取
      const floatSpeed = config.floatSpeed * 1.5
      const floatAmount = config.floatAmount * 1.2

      // 使用统一的基础高度，不再从流程配置中获取
      const baseHeight = config.nodeHeight

      // 悬浮效果 - 轻微上下浮动
      const floatOffset = Math.sin(Date.now() * floatSpeed) * floatAmount

      // 只修改Y坐标，保持X和Z坐标不变
      this.teleportNode.position.y = baseHeight + floatOffset

      // 脉冲发光效果
      const materials = this.teleportNode.material as THREE.MeshStandardMaterial
      if (materials) {
        const pulseSpeed = flowConfig ? flowConfig.pulseSpeed : config.pulseSpeed * 1.5
        const pulseAmount = flowConfig ? flowConfig.pulseAmount : config.pulseAmount * 1.2
        const baseEmissive = flowConfig ? 0.7 : 0.7
        const baseOpacity = flowConfig ? flowConfig.opacity : 0.7

        materials.emissiveIntensity = baseEmissive + Math.sin(Date.now() * pulseSpeed) * pulseAmount
        materials.opacity = baseOpacity + (Math.sin(Date.now() * pulseSpeed) * pulseAmount) / 2
      }

      // 调整边缘不透明度
      const edges = this.teleportNode.children[0] as THREE.LineSegments
      if (edges && edges.material instanceof THREE.LineBasicMaterial) {
        const pulseSpeed = flowConfig ? flowConfig.pulseSpeed : config.pulseSpeed * 1.5
        const pulseAmount = flowConfig ? flowConfig.pulseAmount : config.pulseAmount

        edges.material.opacity = 0.8 + Math.sin(Date.now() * pulseSpeed) * pulseAmount
      }
    }

    // 继续动画循环
    this.animationLoopId = requestAnimationFrame(this.updateAnimation.bind(this))
  }

  /**
   * 应用流程颜色配置
   * 将颜色和材质参数应用到动画节点
   */
  private applyFlowColorConfig(flowConfig: FlowColorConfig): void {
    if (!this.teleportNode) {
      return
    }

    // 应用颜色和材质参数到动画节点
    const material = this.teleportNode.material as THREE.MeshStandardMaterial
    if (material) {
      // 应用颜色
      material.color.setHex(flowConfig.animationColor)
      material.emissive.setHex(flowConfig.emissiveColor)

      // 应用材质参数
      material.emissiveIntensity = flowConfig.emissiveIntensity
      material.opacity = flowConfig.opacity
      material.metalness = flowConfig.metalness
      material.roughness = flowConfig.roughness
    }

    // 应用边缘颜色
    const edges = this.teleportNode.children[0] as THREE.LineSegments
    if (edges && edges.material instanceof THREE.LineBasicMaterial) {
      edges.material.color.setHex(flowConfig.edgeColor)
    }

    // console.log(`应用流程颜色配置: 动画节点颜色 0x${flowConfig.animationColor.toString(16)}, 边缘颜色 0x${flowConfig.edgeColor.toString(16)}`)
  }

  /**
   * 检查位置是否是标签位置
   */
  private isLabelPosition(position: THREE.Vector3): boolean {
    // 如果有节点位置信息，使用它来判断
    if (this.nodePositionInfos.length > 0) {
      const posInfo = this.nodePositionInfos.find((info) =>
        this.isPositionClose(info.position, position),
      )
      return posInfo ? posInfo.isLabel : false
    }

    // 否则使用原有逻辑
    return this.labelPositions.some((labelPos) => this.isPositionClose(labelPos.position, position))
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    this.stopAnimation()

    if (this.teleportNode && this.nodeGroup.children.includes(this.teleportNode)) {
      this.nodeGroup.remove(this.teleportNode)
    }

    if (this.teleportNode) {
      // 释放几何体和材质
      if (this.teleportNode.geometry) {
        this.teleportNode.geometry.dispose()
      }

      if (this.teleportNode.material instanceof THREE.Material) {
        this.teleportNode.material.dispose()
      } else if (Array.isArray(this.teleportNode.material)) {
        this.teleportNode.material.forEach((material) => material.dispose())
      }

      // 清理边缘线条
      if (this.teleportNode.children.length > 0) {
        const edges = this.teleportNode.children[0] as THREE.LineSegments
        if (edges) {
          if (edges.geometry) {
            edges.geometry.dispose()
          }
          if (edges.material instanceof THREE.Material) {
            edges.material.dispose()
          }
        }
      }
    }

    this.teleportNode = null
    this.nodePositions = []
    this.labelPositions = []
    this.allStopPositions = []
    this.nodePositionInfos = []
    this.workflowNodes = []
    this.nodeIdToPositionMap.clear()

    // console.log('瞬移动画控制器已释放资源')
  }

  /**
   * 高亮显示当前元素（节点或连接线）
   */
  private highlightCurrentElement(): void {
    // 如果没有序列信息，不执行高亮
    if (
      !this.nodePositionInfos.length ||
      this.currentPositionIndex >= this.nodePositionInfos.length
    ) {
      return
    }

    // 获取当前位置对应的序列信息
    const currentPosInfo = this.nodePositionInfos[this.currentPositionIndex]

    // 遍历场景中的所有对象
    for (const child of this.nodeGroup.children) {
      // 重置所有对象的高亮状态
      if (child.userData?.highlighted) {
        this.resetHighlight(child)
      }

      // 如果是节点且节点ID匹配
      if (currentPosInfo.nodeId && child.userData?.nodeId === currentPosInfo.nodeId) {
        this.setHighlight(child, currentPosInfo.flowColorConfig)
      }
      // 如果是连接线标签且位置接近
      else if (currentPosInfo.isLabel && child.userData?.type === 'connectionLabel') {
        const childPos = child.position
        if (this.isPositionClose(childPos, currentPosInfo.position)) {
          this.setHighlight(child, currentPosInfo.flowColorConfig)
        }
      }
    }
  }

  /**
   * 设置对象高亮
   */
  private setHighlight(object: THREE.Object3D, flowConfig?: FlowColorConfig): void {
    // 标记对象为高亮状态
    object.userData.highlighted = true

    // 根据对象类型应用不同的高亮效果
    if (object instanceof THREE.Mesh) {
      // 如果是网格对象且有材质
      if (object.material instanceof THREE.MeshStandardMaterial) {
        // 保存原始材质属性
        if (!object.userData.originalMaterial) {
          object.userData.originalMaterial = {
            emissive: object.material.emissive
              ? object.material.emissive.clone()
              : new THREE.Color(0x000000),
            emissiveIntensity: object.material.emissiveIntensity || 0,
          }
        }

        // 设置高亮效果 - 使用流程颜色配置或默认紫色
        if (flowConfig) {
          object.material.emissive.setHex(flowConfig.nodeColor)
          object.material.emissiveIntensity = flowConfig.emissiveIntensity * 0.6 // 稍微降低强度
        } else {
          object.material.emissive.set(0x8844ff) // 默认紫色发光
          object.material.emissiveIntensity = 0.5 // 默认发光强度
        }
      }
    } else if (object instanceof THREE.Sprite) {
      // 如果是精灵对象，增加缩放
      if (!object.userData.originalScale) {
        object.userData.originalScale = object.scale.clone()
      }
      object.scale.multiplyScalar(1.2) // 放大20%
    }
  }

  /**
   * 重置对象高亮
   */
  private resetHighlight(object: THREE.Object3D): void {
    // 移除高亮标记
    object.userData.highlighted = false

    // 根据对象类型重置不同的高亮效果
    if (object instanceof THREE.Mesh) {
      // 如果是网格对象且有材质
      if (
        object.material instanceof THREE.MeshStandardMaterial &&
        object.userData.originalMaterial
      ) {
        // 恢复原始材质属性
        if (object.userData.originalMaterial.emissive) {
          object.material.emissive.copy(object.userData.originalMaterial.emissive)
        }
        object.material.emissiveIntensity = object.userData.originalMaterial.emissiveIntensity
      }
    } else if (object instanceof THREE.Sprite) {
      // 如果是精灵对象，恢复原始缩放
      if (object.userData.originalScale) {
        object.scale.copy(object.userData.originalScale)
      }
    }
  }
}
