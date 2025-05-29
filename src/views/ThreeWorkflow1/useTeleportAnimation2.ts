import * as THREE from 'three'
import { FIXED_NODE_WIDTH, FIXED_NODE_HEIGHT, FIXED_NODE_DEPTH, ANIMATION_CONFIG, COLORS } from './config'

/**
 * 连接线标签位置信息
 */
interface ConnectionLabelPosition {
  position: THREE.Vector3;
  labelText: string;
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
   * 设置节点位置和连接线标签位置
   * @param nodePositions 节点位置集合
   * @param connectionPaths 连接路径点集合
   * @param labelPositions 连接线标签位置集合
   */
  public setPositions(
    nodePositions: THREE.Vector3[], 
    connectionPaths: THREE.Vector3[][],
    labelPositions: ConnectionLabelPosition[]
  ): void {
    this.nodePositions = nodePositions
    this.labelPositions = labelPositions
    
    // 合并所有停留点
    this.mergeStopPositions()
    
    console.log(`设置了${nodePositions.length}个节点位置和${labelPositions.length}个标签位置，共${this.allStopPositions.length}个停留点`)
  }
  
  /**
   * 合并所有停留点（节点位置和标签位置）
   * 并按照合理的顺序排序
   */
  private mergeStopPositions(): void {
    // 先添加所有节点位置
    this.allStopPositions = [...this.nodePositions]
    
    // 再添加所有标签位置
    for (const labelPos of this.labelPositions) {
      // 检查是否已经存在相同或非常接近的位置
      const isDuplicate = this.allStopPositions.some(pos => 
        this.isPositionClose(pos, labelPos.position)
      )
      
      if (!isDuplicate) {
        this.allStopPositions.push(labelPos.position)
      }
    }
    
    // 按照X坐标排序，确保动画从左到右进行
    this.allStopPositions.sort((a, b) => {
      // 首先按X坐标排序
      if (Math.abs(a.x - b.x) > 10) {
        return a.x - b.x
      }
      // X坐标接近时，按Z坐标排序
      return a.z - b.z
    })
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
    
    // 使用硬编码颜色，避免类型错误
    const teleportNodeColor = COLORS.animation.teleportNode // 紫色
    const teleportEdgeColor = COLORS.animation.teleportEdge // 亮紫色边缘
    const teleportEmissiveColor = COLORS.animation.teleportEmissive // 亮紫色发光
    
    // 创建一个长方形平面，与节点顶面保持相同大小，但稍微放大一些
    const nodeGeometry = new THREE.BoxGeometry(
      FIXED_NODE_WIDTH * teleportConfig.nodeWidthScale * 1.2, // 宽度放大20%
      FIXED_NODE_HEIGHT * teleportConfig.nodeHeightScale * 1.5, // 高度放大50%
      FIXED_NODE_DEPTH * teleportConfig.nodeDepthScale * 1.2 // 深度放大20%
    )
    
    // 创建瞬移节点材质 - 紫色半透明
    const nodeMaterial = new THREE.MeshStandardMaterial({
      color: teleportNodeColor, // 紫色
      emissive: teleportEmissiveColor, // 亮紫色发光
      emissiveIntensity: 1.0, // 增强发光强度
      metalness: 0.8, // 增加金属感
      roughness: 0.1, // 减少粗糙度，增加光滑感
      transparent: true,
      opacity: 0.8, // 增加不透明度
      depthTest: false, // 禁用深度测试，确保总是渲染在最上层
    })
    
    // 创建瞬移节点网格
    this.teleportNode = new THREE.Mesh(nodeGeometry, nodeMaterial)
    
    // 设置渲染顺序，确保瞬移节点在普通节点上层
    this.teleportNode.renderOrder = 100 // 增加渲染顺序值，确保在所有其他对象之上
    
    // 添加发光边缘
    const edgeGeometry = new THREE.EdgesGeometry(nodeGeometry)
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: teleportEdgeColor, // 亮紫色
      transparent: true,
      opacity: 1.0, // 增加不透明度
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
    
    console.log('创建了瞬移节点')
    return this.teleportNode
  }
  
  /**
   * 设置初始位置
   * 将瞬移节点放置在第一个节点位置
   */
  private setInitialPosition(): void {
    if (!this.teleportNode) return
    
    if (this.allStopPositions.length > 0) {
      // 获取第一个停留点位置
      const initialPosition = this.allStopPositions[0].clone()
      
      // 将瞬移节点放置在普通节点顶部上方
      initialPosition.y = ANIMATION_CONFIG.teleport.nodeHeight
      
      this.teleportNode.position.copy(initialPosition)
      console.log(`设置紫色节点初始位置: x=${initialPosition.x}, y=${initialPosition.y}, z=${initialPosition.z}`)
    } else {
      console.warn('没有可用的停留点位置，无法设置紫色节点初始位置')
    }
  }
  
  /**
   * 开始瞬移动画
   * 让瞬移节点在各个节点之间直接跳转
   */
  public startAnimation(): void {
    // 如果没有停留点位置或瞬移节点，不执行动画
    if (this.allStopPositions.length === 0 || !this.teleportNode) {
      console.warn('没有可用的停留点位置或瞬移节点')
      return
    }
    
    // 重置动画状态
    this.currentPositionIndex = 0
    this.isAnimationPlaying = true
    this.teleportTimer = 0
    
    // 获取配置
    const config = ANIMATION_CONFIG.teleport
    
    // 使用配置文件中的间隔时间和速度因子
    // speedFactor值越大，动画越慢
    this.teleportInterval = config.interval * config.nodeStayRatio * config.speedFactor
    
    this.animationClock.start()
    
    // 启动动画循环
    this.updateAnimation()
    
    console.log(`瞬移动画已启动，速度因子: ${config.speedFactor}，间隔: ${this.teleportInterval.toFixed(2)}秒`)
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
    
    console.log('瞬移动画已停止')
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
      
      // 移动到下一个停留点位置
      this.currentPositionIndex = (this.currentPositionIndex + 1) % this.allStopPositions.length
      
      // 获取下一个停留点位置
      const nextPosition = this.allStopPositions[this.currentPositionIndex].clone()
      
      // 设置Y坐标（悬浮高度）并更新位置
      nextPosition.y = config.nodeHeight
      this.teleportNode.position.copy(nextPosition)
      
      // 检查当前位置是否是标签位置
      const isLabelPosition = this.isLabelPosition(nextPosition)
      
      // 如果是标签位置，使用更短的停留时间
      if (isLabelPosition) {
        this.teleportInterval = config.interval * config.labelStayRatio * config.speedFactor
      } else {
        this.teleportInterval = config.interval * config.nodeStayRatio * config.speedFactor
      }
      
      console.log(`紫色节点移动到停留点索引 ${this.currentPositionIndex}, 位置: x=${nextPosition.x}, y=${nextPosition.y}, z=${nextPosition.z}, 是标签位置: ${isLabelPosition}`)
    }
    
    // 添加悬浮效果 - 只修改Y坐标，不影响X和Z坐标
    if (this.teleportNode) {
      // 悬浮效果 - 轻微上下浮动，增加浮动速度
      const floatOffset = Math.sin(Date.now() * config.floatSpeed * 1.5) * config.floatAmount * 1.2
      
      // 只修改Y坐标，保持X和Z坐标不变
      this.teleportNode.position.y = config.nodeHeight + floatOffset
      
      // 脉冲发光效果，增加脉冲速度和强度
      const materials = this.teleportNode.material as THREE.MeshStandardMaterial
      if (materials) {
        materials.emissiveIntensity = 0.7 + Math.sin(Date.now() * config.pulseSpeed * 1.5) * config.pulseAmount * 1.2
        materials.opacity = 0.7 + Math.sin(Date.now() * config.pulseSpeed * 1.5) * config.pulseAmount / 2
      }
      
      // 调整边缘不透明度
      const edges = this.teleportNode.children[0] as THREE.LineSegments
      if (edges && edges.material instanceof THREE.LineBasicMaterial) {
        edges.material.opacity = 0.8 + Math.sin(Date.now() * config.pulseSpeed * 1.5) * config.pulseAmount
      }
    }
    
    // 继续动画循环
    this.animationLoopId = requestAnimationFrame(this.updateAnimation.bind(this))
  }
  
  /**
   * 检查位置是否是标签位置
   */
  private isLabelPosition(position: THREE.Vector3): boolean {
    return this.labelPositions.some(labelPos => 
      this.isPositionClose(labelPos.position, position)
    )
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
        this.teleportNode.material.forEach(material => material.dispose())
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
    
    console.log('瞬移动画控制器已释放资源')
  }
} 