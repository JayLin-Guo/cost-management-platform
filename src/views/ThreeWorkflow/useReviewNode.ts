import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

// 审核节点状态类型
export enum ReviewNodeStatus {
  PENDING = '待审核',
  REVIEWING = '审核中',
  APPROVED = '已通过',
  REJECTED = '已驳回',
  SUBMITTED = '已提交',
}

// 审核节点配置选项
export interface ReviewNodeOptions {
  id: string
  title: string
  description?: string
  position: THREE.Vector3
  status: ReviewNodeStatus
  files?: Array<{
    name: string
    url: string
    size?: string
    uploadTime?: string
  }>
  comments?: Array<{
    author: string
    content: string
    time: string
  }>
  onStatusChange?: (nodeId: string, newStatus: ReviewNodeStatus, comment?: string) => void
  onClick?: (nodeId: string) => void
}

// 状态图标映射 (使用Unicode字符作为简单图标)
const statusIconMap = {
  [ReviewNodeStatus.PENDING]: '⏱️',
  [ReviewNodeStatus.SUBMITTED]: '📤',
  [ReviewNodeStatus.REVIEWING]: '🔍',
  [ReviewNodeStatus.APPROVED]: '✅',
  [ReviewNodeStatus.REJECTED]: '❌',
}

// 审核节点类
export class ReviewNode {
  private id: string
  private title: string
  private description: string
  private status: ReviewNodeStatus
  private files: Array<{ name: string; url: string; size?: string; uploadTime?: string }>
  private comments: Array<{ author: string; content: string; time: string }>

  private nodeMesh: THREE.Group
  private nodeLabel?: CSS2DObject
  private actionButton?: CSS2DObject
  private glowMesh: THREE.Mesh | null = null
  private pulseAnimationId: number | null = null
  private originalPosition: THREE.Vector3

  private onStatusChange:
    | ((nodeId: string, newStatus: ReviewNodeStatus, comment?: string) => void)
    | undefined
  private onClick: ((nodeId: string) => void) | undefined

  constructor(options: ReviewNodeOptions) {
    this.id = options.id
    this.title = options.title
    this.description = options.description || ''
    this.status = options.status
    this.files = options.files || []
    this.comments = options.comments || []
    this.onStatusChange = options.onStatusChange
    this.onClick = options.onClick
    this.originalPosition = options.position.clone()

    // 初始化3D对象
    this.nodeMesh = new THREE.Group()
    this.nodeMesh.position.copy(options.position)

    // 创建节点的3D表现
    this.createNodeMesh()

    // 创建节点的HTML标签
    // this.nodeLabel = this.createNodeLabel();
    // this.nodeMesh.add(this.nodeLabel);

    // 创建操作按钮
    // this.actionButton = this.createActionButton();
    // this.nodeMesh.add(this.actionButton);

    // 为审核中的节点添加脉冲效果
    if (this.status === ReviewNodeStatus.REVIEWING) {
      this.addPulseEffect()
    }
  }

  // 获取3D对象
  getMesh(): THREE.Group {
    return this.nodeMesh
  }

  // 更新节点状态
  updateStatus(newStatus: ReviewNodeStatus): void {
    // 停止现有的脉冲动画
    this.stopPulseEffect()

    this.status = newStatus
    this.updateNodeColor()

    // 更新标签显示
    this.updateLabelDisplay()

    // 如果新状态是审核中，添加脉冲效果
    if (newStatus === ReviewNodeStatus.REVIEWING) {
      this.addPulseEffect()
    }

    // 添加状态变化动画效果
    this.playStatusChangeAnimation()
  }

  // 播放状态变化动画
  private playStatusChangeAnimation(): void {
    // 保存初始位置
    const startPosition = this.nodeMesh.position.clone()
    const targetPosition = startPosition.clone()
    targetPosition.y += 3 // 向上跳跃高度

    let time = 0
    const duration = 0.5 // 动画持续时间(秒)
    const animate = () => {
      time += 0.016 // 大约60fps
      const progress = Math.min(time / duration, 1)

      // 使用弹性缓动函数
      const easedProgress = this.easeOutElastic(progress)

      // 上升然后回落
      if (progress < 0.5) {
        // 上升阶段
        const upProgress = progress * 2 // 0到1
        this.nodeMesh.position.lerpVectors(startPosition, targetPosition, upProgress)
      } else {
        // 下降阶段
        const downProgress = (progress - 0.5) * 2 // 0到1
        this.nodeMesh.position.lerpVectors(targetPosition, startPosition, downProgress)
      }

      // 如果动画未完成，继续
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // 动画完成，恢复原始位置
        this.nodeMesh.position.copy(startPosition)
      }
    }

    requestAnimationFrame(animate)
  }

  // 弹性缓动函数
  private easeOutElastic(x: number): number {
    const c4 = (2 * Math.PI) / 3
    return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1
  }

  // 创建节点的3D表现
  private createNodeMesh(): void {
    // 使用平面几何体替代圆柱体，创建方形节点
    const boxWidth = 32
    const boxHeight = 20

    // 1. 创建主体核心 - 使用更现代的设计
    const coreGeometry = new THREE.BoxGeometry(boxWidth, 6, boxHeight)
    const coreMaterial = this.getEnhancedStatusMaterial(this.status)
    const core = new THREE.Mesh(coreGeometry, coreMaterial)
    core.position.y = 0
    core.renderOrder = 5

    // 2. 创建全息投影边框 - 多层边框效果
    const outerEdgeGeometry = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(boxWidth + 4, 8, boxHeight + 4),
    )
    const outerEdgeMaterial = new THREE.LineBasicMaterial({
      color: this.getEdgeColor(this.status),
      linewidth: 3,
      transparent: true,
      opacity: 0.8,
    })
    const outerEdges = new THREE.LineSegments(outerEdgeGeometry, outerEdgeMaterial)
    outerEdges.position.y = 1
    outerEdges.renderOrder = 6

    // 3. 创建内层边框
    const innerEdgeGeometry = new THREE.EdgesGeometry(coreGeometry)
    const innerEdgeMaterial = new THREE.LineBasicMaterial({
      color: this.getEdgeColor(this.status),
      linewidth: 2,
      transparent: true,
      opacity: 1.0,
    })
    const innerEdges = new THREE.LineSegments(innerEdgeGeometry, innerEdgeMaterial)
    innerEdges.renderOrder = 7

    // 4. 创建雷电光束效果 - 围绕节点边框旋转
    const lightningBeamGroup = this.createLightningBeamEffect(boxWidth, boxHeight)
    lightningBeamGroup.userData.isLightningBeam = true

    // 5. 创建主光晕效果 - 更强的发光效果
    const mainGlowGeometry = new THREE.BoxGeometry(boxWidth + 6, 8, boxHeight + 6)
    const mainGlowMaterial = new THREE.MeshBasicMaterial({
      color: this.getEdgeColor(this.status),
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    })
    this.glowMesh = new THREE.Mesh(mainGlowGeometry, mainGlowMaterial)
    this.glowMesh.renderOrder = 1

    // 添加所有组件到节点组
    this.nodeMesh.add(core)
    this.nodeMesh.add(outerEdges)
    this.nodeMesh.add(innerEdges)
    this.nodeMesh.add(lightningBeamGroup)
    this.nodeMesh.add(this.glowMesh)

    // 存储引用以便后续更新
    this.nodeMesh.userData.mainBody = core
    this.nodeMesh.userData.outerEdges = outerEdges
    this.nodeMesh.userData.innerEdges = innerEdges
    this.nodeMesh.userData.lightningBeam = lightningBeamGroup

    // 启动节点动画
    this.startNodeAnimation()
  }

  // 创建雷电光束效果
  private createLightningBeamEffect(boxWidth: number, boxHeight: number): THREE.Group {
    const lightningGroup = new THREE.Group()

    // 创建围绕节点边框的雷电路径
    const createLightningPath = (offset: number = 0) => {
      const points: THREE.Vector3[] = []
      const segments = 60 // 增加分段数让雷电更平滑
      const margin = 2 // 边框外的距离

      // 计算矩形边框的四个角点
      const halfWidth = (boxWidth + margin) / 2
      const halfHeight = (boxHeight + margin) / 2
      const height = 2 // 雷电的高度

      for (let i = 0; i <= segments; i++) {
        const progress = (i / segments + offset) % 1
        let x, z

        // 沿着矩形边框移动
        if (progress < 0.25) {
          // 前边
          const t = progress * 4
          x = -halfWidth + t * boxWidth
          z = halfHeight
        } else if (progress < 0.5) {
          // 右边
          const t = (progress - 0.25) * 4
          x = halfWidth
          z = halfHeight - t * boxHeight
        } else if (progress < 0.75) {
          // 后边
          const t = (progress - 0.5) * 4
          x = halfWidth - t * boxWidth
          z = -halfHeight
        } else {
          // 左边
          const t = (progress - 0.75) * 4
          x = -halfWidth
          z = -halfHeight + t * boxHeight
        }

        // 添加雷电的随机扰动
        const noise = (Math.sin(progress * Math.PI * 8) + Math.cos(progress * Math.PI * 12)) * 0.5
        x += noise
        z += noise

        points.push(new THREE.Vector3(x, height + Math.sin(progress * Math.PI * 4) * 0.5, z))
      }

      return points
    }

    // 创建多条雷电光束
    const beamCount = 3
    for (let i = 0; i < beamCount; i++) {
      const offset = i / beamCount
      const points = createLightningPath(offset)

      // 创建雷电几何体
      const lightningGeometry = new THREE.BufferGeometry().setFromPoints(points)

      // 创建雷电材质 - 使用电蓝色和紫色
      const lightningMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL(0.6 + Math.sin(Date.now() * 0.01 + i) * 0.1, 1, 0.8),
        transparent: true,
        opacity: 0.8 + Math.sin(Date.now() * 0.02 + i) * 0.2,
        linewidth: 2,
      })

      const lightningBeam = new THREE.Line(lightningGeometry, lightningMaterial)
      lightningBeam.userData = {
        beamIndex: i,
        offset: offset,
        baseColor: 0.6 + i * 0.05, // 不同的色调
        speed: 1 + i * 0.3, // 不同的速度
      }

      lightningGroup.add(lightningBeam)
    }

    // 创建雷电粒子效果
    const particleCount = 20
    for (let i = 0; i < particleCount; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.2, 6, 6)
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.65, 1, 0.9),
        transparent: true,
        opacity: 0.7,
      })

      const particle = new THREE.Mesh(particleGeometry, particleMaterial)

      // 随机位置在边框附近
      const angle = (i / particleCount) * Math.PI * 2
      const radius = Math.max(boxWidth, boxHeight) * 0.6
      particle.position.set(
        Math.cos(angle) * radius,
        2 + Math.random() * 2,
        Math.sin(angle) * radius,
      )

      particle.userData = {
        initialAngle: angle,
        radius: radius,
        speed: 0.5 + Math.random() * 0.5,
        flickerSpeed: 2 + Math.random() * 3,
      }

      lightningGroup.add(particle)
    }

    return lightningGroup
  }

  // 启动节点动画
  private startNodeAnimation(): void {
    const startTime = Date.now()

    const animateNode = () => {
      if (!this.nodeMesh.parent) {
        return
      } // 如果节点已被移除，停止动画

      const elapsed = (Date.now() - startTime) / 1000

      this.nodeMesh.traverse((child) => {
        if (child.userData.isLightningBeam) {
          // 雷电光束动画
          child.children.forEach((beam, index) => {
            if (beam instanceof THREE.Line) {
              const data = beam.userData
              const time = elapsed * data.speed

              // 重新生成雷电路径以实现动态效果
              const points: THREE.Vector3[] = []
              const segments = 60
              const margin = 2
              const boxWidth = 32
              const boxHeight = 20
              const halfWidth = (boxWidth + margin) / 2
              const halfHeight = (boxHeight + margin) / 2
              const height = 2

              for (let i = 0; i <= segments; i++) {
                const progress = (i / segments + data.offset + time * 0.5) % 1
                let x, z

                // 沿着矩形边框移动
                if (progress < 0.25) {
                  const t = progress * 4
                  x = -halfWidth + t * boxWidth
                  z = halfHeight
                } else if (progress < 0.5) {
                  const t = (progress - 0.25) * 4
                  x = halfWidth
                  z = halfHeight - t * boxHeight
                } else if (progress < 0.75) {
                  const t = (progress - 0.5) * 4
                  x = halfWidth - t * boxWidth
                  z = -halfHeight
                } else {
                  const t = (progress - 0.75) * 4
                  x = -halfWidth
                  z = -halfHeight + t * boxHeight
                }

                // 添加动态雷电扰动
                const noise =
                  (Math.sin(progress * Math.PI * 8 + time * 3) +
                    Math.cos(progress * Math.PI * 12 + time * 2)) *
                  0.8
                const verticalNoise = Math.sin(progress * Math.PI * 6 + time * 4) * 0.3
                x += noise
                z += noise

                points.push(
                  new THREE.Vector3(
                    x,
                    height + Math.sin(progress * Math.PI * 4 + time) * 0.5 + verticalNoise,
                    z,
                  ),
                )
              }

              // 更新几何体
              beam.geometry.setFromPoints(points)

              // 动态颜色变化 - 雷电效果
              if (beam.material instanceof THREE.LineBasicMaterial) {
                const hue = (data.baseColor + Math.sin(time * 2 + index) * 0.1) % 1
                const saturation = 0.9 + Math.sin(time * 3 + index) * 0.1
                const lightness = 0.7 + Math.sin(time * 4 + index) * 0.2
                beam.material.color.setHSL(hue, saturation, lightness)
                beam.material.opacity = 0.6 + Math.sin(time * 5 + index) * 0.3
              }
            } else if (beam instanceof THREE.Mesh) {
              // 雷电粒子动画
              const data = beam.userData
              const particleTime = elapsed * data.speed

              // 围绕边框移动
              const newAngle = data.initialAngle + particleTime
              beam.position.x = Math.cos(newAngle) * data.radius
              beam.position.z = Math.sin(newAngle) * data.radius
              beam.position.y = 2 + Math.sin(particleTime * data.flickerSpeed) * 1

              // 粒子闪烁效果
              if (beam.material instanceof THREE.MeshBasicMaterial) {
                beam.material.opacity = 0.4 + Math.sin(particleTime * data.flickerSpeed) * 0.4
                const hue = (0.65 + Math.sin(particleTime * 2) * 0.1) % 1
                beam.material.color.setHSL(hue, 1, 0.8 + Math.sin(particleTime * 3) * 0.2)
              }
            }
          })
        }
      })

      // 主光晕脉冲
      if (this.glowMesh) {
        const glowPulse = Math.sin(elapsed * 1.5) * 0.03 + 1
        this.glowMesh.scale.set(glowPulse, glowPulse, glowPulse)
        if (this.glowMesh.material instanceof THREE.MeshBasicMaterial) {
          this.glowMesh.material.opacity = 0.08 + Math.sin(elapsed * 2) * 0.02
        }
      }

      requestAnimationFrame(animateNode)
    }

    animateNode()
  }

  // 根据状态获取边框颜色
  private getEdgeColor(status: ReviewNodeStatus): number {
    switch (status) {
      case ReviewNodeStatus.APPROVED:
        return 0x00ff99
      case ReviewNodeStatus.REJECTED:
        return 0xff5577
      case ReviewNodeStatus.REVIEWING:
        return 0xffee33
      case ReviewNodeStatus.PENDING:
        return 0xaaaaaa
      case ReviewNodeStatus.SUBMITTED:
        return 0x33aaff
      default:
        return 0xdddddd
    }
  }

  // 更新节点颜色
  private updateNodeColor(): void {
    const mainBody = this.nodeMesh.userData.mainBody as THREE.Mesh
    const outerEdges = this.nodeMesh.userData.outerEdges as THREE.LineSegments
    const innerEdges = this.nodeMesh.userData.innerEdges as THREE.LineSegments
    const lightningBeam = this.nodeMesh.userData.lightningBeam as THREE.Group

    if (mainBody) {
      mainBody.material = this.getEnhancedStatusMaterial(this.status)
    }

    if (outerEdges && outerEdges.material instanceof THREE.LineBasicMaterial) {
      outerEdges.material.color.setHex(this.getEdgeColor(this.status))
    }

    if (innerEdges && innerEdges.material instanceof THREE.LineBasicMaterial) {
      innerEdges.material.color.setHex(this.getEdgeColor(this.status))
    }

    // 更新雷电光束颜色
    if (lightningBeam) {
      const statusHue = this.getStatusHue()
      lightningBeam.children.forEach((beam, index) => {
        if (beam instanceof THREE.Line && beam.material instanceof THREE.LineBasicMaterial) {
          // 基于状态设置雷电颜色，但保持雷电的动态效果
          const baseHue = statusHue > 0 ? statusHue : 0.6 // 默认使用蓝色
          beam.userData.baseColor = baseHue + index * 0.05
          beam.material.color.setHSL(baseHue, 1, 0.8)
        } else if (beam instanceof THREE.Mesh && beam.material instanceof THREE.MeshBasicMaterial) {
          // 更新雷电粒子颜色
          const baseHue = statusHue > 0 ? statusHue : 0.65
          beam.material.color.setHSL(baseHue, 1, 0.9)
        }
      })
    }

    if (this.glowMesh && this.glowMesh.material instanceof THREE.MeshBasicMaterial) {
      this.glowMesh.material.color.setHex(this.getEdgeColor(this.status))
    }
  }

  // 添加脉冲效果
  private addPulseEffect(): void {
    if (!this.glowMesh) {
      return
    }

    let pulseTime = 0

    const animate = () => {
      pulseTime += 0.03

      // 发光效果脉冲
      if (this.glowMesh) {
        ;(this.glowMesh.material as THREE.MeshBasicMaterial).opacity =
          0.15 + Math.sin(pulseTime) * 0.1
      }

      // 轻微上下浮动
      this.nodeMesh.position.y = this.originalPosition.y + Math.sin(pulseTime) * 0.3

      this.pulseAnimationId = requestAnimationFrame(animate)
    }

    this.pulseAnimationId = requestAnimationFrame(animate)
  }

  // 停止脉冲效果
  private stopPulseEffect(): void {
    if (this.pulseAnimationId !== null) {
      cancelAnimationFrame(this.pulseAnimationId)
      this.pulseAnimationId = null

      // 重置位置
      this.nodeMesh.position.y = this.originalPosition.y

      // 重置发光效果
      if (this.glowMesh) {
        ;(this.glowMesh.material as THREE.MeshBasicMaterial).opacity = 0.15
      }
    }
  }

  // 创建节点标签 (CSS2D)
  private createNodeLabel(): CSS2DObject {
    const labelDiv = document.createElement('div')
    labelDiv.className = 'review-node-label'

    // 应用与图片中类似的方形标签样式
    labelDiv.style.backgroundColor = 'rgba(25, 45, 90, 0.90)'
    labelDiv.style.color = 'white'
    labelDiv.style.padding = '6px 10px'
    labelDiv.style.fontFamily = 'Microsoft YaHei, sans-serif'
    labelDiv.style.fontSize = '12px'
    labelDiv.style.textAlign = 'center'
    labelDiv.style.pointerEvents = 'auto'
    labelDiv.style.width = '110px'
    labelDiv.style.boxSizing = 'border-box'
    labelDiv.style.display = 'flex'
    labelDiv.style.flexDirection = 'column'
    labelDiv.style.alignItems = 'center'
    labelDiv.style.justifyContent = 'center'
    labelDiv.style.borderRadius = '4px'
    labelDiv.style.transition = 'all 0.2s ease-in-out'

    // 应用边框样式
    const borderColor = this.getStatusBorderColor()
    labelDiv.style.border = `2px solid ${borderColor}`
    labelDiv.style.boxShadow = `0 2px 5px rgba(0,0,0,0.3)`

    // 更新标签内容
    this.updateLabelContent(labelDiv)

    // 点击事件
    labelDiv.addEventListener('click', () => {
      if (this.onClick) {
        // 添加点击反馈动画
        labelDiv.style.transform = 'scale(0.95)'
        setTimeout(() => {
          labelDiv.style.transform = 'scale(1)'
        }, 100)

        this.onClick(this.id)
      }
    })

    // 悬停效果
    labelDiv.addEventListener('mouseenter', () => {
      // 增强边框高亮效果
      labelDiv.style.boxShadow = `0 0 8px ${borderColor}, 0 2px 5px rgba(0,0,0,0.3)`
      labelDiv.style.border = `2px solid ${this.getStatusHighlightColor()}`
      labelDiv.style.transform = 'translateY(-2px)'
    })

    labelDiv.addEventListener('mouseleave', () => {
      labelDiv.style.boxShadow = `0 2px 5px rgba(0,0,0,0.3)`
      labelDiv.style.border = `2px solid ${borderColor}`
      labelDiv.style.transform = 'translateY(0)'
    })

    // 创建CSS2D对象
    const labelObject = new CSS2DObject(labelDiv)
    labelObject.position.set(0, 8, 0) // 在节点上方显示

    return labelObject
  }

  // 更新标签内容
  private updateLabelContent(labelDiv: HTMLElement): void {
    // 清空现有内容
    labelDiv.innerHTML = ''

    // 添加状态图标
    const statusIcon = document.createElement('div')
    statusIcon.style.fontSize = '16px'
    statusIcon.style.marginBottom = '3px'
    statusIcon.textContent = statusIconMap[this.status] || ''

    // 添加标题
    const titleElement = document.createElement('div')
    titleElement.style.fontWeight = 'bold'
    titleElement.style.color = this.getStatusTextColor()
    titleElement.textContent = this.title

    // 添加状态文本
    const statusElement = document.createElement('div')
    statusElement.style.fontSize = '10px'
    statusElement.style.color = this.getStatusTextColor()
    statusElement.style.marginTop = '3px'
    statusElement.textContent = this.status

    // 组装标签
    labelDiv.appendChild(statusIcon)
    labelDiv.appendChild(titleElement)
    labelDiv.appendChild(statusElement)

    // 根据状态设置边框颜色
    labelDiv.style.borderColor = this.getStatusBorderColor()
  }

  // 获取状态对应的边框颜色
  private getStatusBorderColor(): string {
    switch (this.status) {
      case ReviewNodeStatus.APPROVED:
        return '#00ff99'
      case ReviewNodeStatus.REJECTED:
        return '#ff5577'
      case ReviewNodeStatus.REVIEWING:
        return '#ffee33'
      case ReviewNodeStatus.PENDING:
        return '#aaaaaa'
      case ReviewNodeStatus.SUBMITTED:
        return '#33aaff'
      default:
        return '#dddddd'
    }
  }

  // 获取状态对应的高亮边框颜色
  private getStatusHighlightColor(): string {
    switch (this.status) {
      case ReviewNodeStatus.APPROVED:
        return '#66ffbb'
      case ReviewNodeStatus.REJECTED:
        return '#ff7799'
      case ReviewNodeStatus.REVIEWING:
        return '#ffff66'
      case ReviewNodeStatus.PENDING:
        return '#cccccc'
      case ReviewNodeStatus.SUBMITTED:
        return '#66ccff'
      default:
        return '#ffffff'
    }
  }

  // 获取状态对应的文本颜色
  private getStatusTextColor(): string {
    switch (this.status) {
      case ReviewNodeStatus.APPROVED:
        return '#00ff99'
      case ReviewNodeStatus.REJECTED:
        return '#ff5577'
      case ReviewNodeStatus.REVIEWING:
        return '#ffee33'
      case ReviewNodeStatus.PENDING:
        return '#cccccc'
      case ReviewNodeStatus.SUBMITTED:
        return '#33aaff'
      default:
        return '#ffffff'
    }
  }

  // 更新标签显示
  private updateLabelDisplay(): void {
    if (!this.nodeLabel) {
      return
    }
    const labelDiv = this.nodeLabel?.element as HTMLElement
    this.updateLabelContent(labelDiv)
  }

  // 创建操作按钮
  private createActionButton(): CSS2DObject {
    const buttonDiv = document.createElement('div')
    buttonDiv.className = 'review-node-action'
    buttonDiv.style.backgroundColor = 'rgba(74, 138, 255, 0.9)'
    buttonDiv.style.color = 'white'
    buttonDiv.style.borderRadius = '50%'
    buttonDiv.style.width = '24px'
    buttonDiv.style.height = '24px'
    buttonDiv.style.display = 'flex'
    buttonDiv.style.justifyContent = 'center'
    buttonDiv.style.alignItems = 'center'
    buttonDiv.style.cursor = 'pointer'
    buttonDiv.style.pointerEvents = 'auto'
    buttonDiv.style.transition = 'all 0.2s ease'
    buttonDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
    buttonDiv.innerHTML = '<span style="font-size: 14px;">⚙️</span>'

    // 点击事件 - 显示操作弹窗
    buttonDiv.addEventListener('click', (event) => {
      event.stopPropagation()
      this.showActionPopup()
    })

    // 悬停效果
    buttonDiv.addEventListener('mouseenter', () => {
      buttonDiv.style.transform = 'scale(1.2)'
      buttonDiv.style.backgroundColor = 'rgba(100, 160, 255, 0.95)'
    })

    buttonDiv.addEventListener('mouseleave', () => {
      buttonDiv.style.transform = 'scale(1)'
      buttonDiv.style.backgroundColor = 'rgba(74, 138, 255, 0.9)'
    })

    const buttonObject = new CSS2DObject(buttonDiv)
    buttonObject.position.set(15, 0, 0) // 位于节点右侧

    return buttonObject
  }

  // 显示操作弹窗
  private showActionPopup(): void {
    // 创建弹窗背景
    const popupBackground = document.createElement('div')
    popupBackground.style.position = 'fixed'
    popupBackground.style.top = '0'
    popupBackground.style.left = '0'
    popupBackground.style.width = '100%'
    popupBackground.style.height = '100%'
    popupBackground.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'
    popupBackground.style.zIndex = '1000'
    popupBackground.style.display = 'flex'
    popupBackground.style.justifyContent = 'center'
    popupBackground.style.alignItems = 'center'

    // 创建弹窗内容
    const popupContent = document.createElement('div')
    popupContent.style.backgroundColor = '#fff'
    popupContent.style.borderRadius = '8px'
    popupContent.style.padding = '20px'
    popupContent.style.width = '400px'
    popupContent.style.maxWidth = '90%'
    popupContent.style.maxHeight = '80vh'
    popupContent.style.overflowY = 'auto'
    popupContent.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.25)'
    popupContent.style.fontFamily = 'Microsoft YaHei, sans-serif'

    // 标题和关闭按钮
    popupContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h2 style="margin: 0; font-size: 18px;">${this.title} - 审核操作</h2>
        <button class="close-btn" style="background: none; border: none; font-size: 20px; cursor: pointer; padding: 0 5px;">×</button>
      </div>

      <div style="margin-bottom: 15px;">
        <div style="font-weight: bold; margin-bottom: 5px;">当前状态：</div>
        <div style="padding: 8px 12px; background-color: #f5f5f5; border-radius: 4px;">${this.status}</div>
      </div>

      <div style="margin-bottom: 15px;">
        <div style="font-weight: bold; margin-bottom: 5px;">审核意见：</div>
        <textarea id="reviewComment" style="width: 100%; height: 80px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;"></textarea>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button id="approveBtn" style="flex: 1; padding: 8px 0; background-color: #00cc66; color: white; border: none; border-radius: 4px; cursor: pointer;">通过</button>
        <button id="rejectBtn" style="flex: 1; padding: 8px 0; background-color: #ff3366; color: white; border: none; border-radius: 4px; cursor: pointer;">驳回</button>
      </div>

      <div style="margin-top: 20px;">
        <div style="font-weight: bold; margin-bottom: 10px;">附件文件：</div>
        <div id="fileList" style="max-height: 150px; overflow-y: auto; border: 1px solid #eee; border-radius: 4px; padding: 10px;">
          ${this.renderFileList()}
        </div>
      </div>
    `

    // 添加到弹窗
    popupBackground.appendChild(popupContent)
    document.body.appendChild(popupBackground)

    // 事件绑定
    const closeBtn = popupContent.querySelector('.close-btn')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.body.removeChild(popupBackground)
      })
    }

    // 点击背景关闭
    popupBackground.addEventListener('click', (event) => {
      if (event.target === popupBackground) {
        document.body.removeChild(popupBackground)
      }
    })

    // 通过按钮
    const approveBtn = document.getElementById('approveBtn')
    if (approveBtn) {
      approveBtn.addEventListener('click', () => {
        const commentInput = document.getElementById('reviewComment') as HTMLTextAreaElement
        const comment = commentInput?.value || ''
        if (this.onStatusChange) {
          this.onStatusChange(this.id, ReviewNodeStatus.APPROVED, comment)
        }
        this.updateStatus(ReviewNodeStatus.APPROVED)
        document.body.removeChild(popupBackground)
      })
    }

    // 驳回按钮
    const rejectBtn = document.getElementById('rejectBtn')
    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => {
        const commentInput = document.getElementById('reviewComment') as HTMLTextAreaElement
        const comment = commentInput?.value || ''
        if (this.onStatusChange) {
          this.onStatusChange(this.id, ReviewNodeStatus.REJECTED, comment)
        }
        this.updateStatus(ReviewNodeStatus.REJECTED)
        document.body.removeChild(popupBackground)
      })
    }
  }

  // 渲染文件列表
  private renderFileList(): string {
    if (this.files.length === 0) {
      return '<div style="color: #999; text-align: center; padding: 10px;">暂无文件</div>'
    }

    return this.files
      .map(
        (file) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #eee;">
        <div style="display: flex; align-items: center;">
          <span style="margin-right: 8px;">📄</span>
          <div>
            <div style="font-weight: 500;">${file.name}</div>
            ${file.size ? `<div style="font-size: 12px; color: #666;">${file.size}</div>` : ''}
          </div>
        </div>
        <a href="${file.url}" target="_blank" style="color: #4a8aff; text-decoration: none;">查看</a>
      </div>
    `,
      )
      .join('')
  }

  // 高亮显示节点
  highlight(enable: boolean = true): void {
    // 停止脉冲效果(如果有)
    this.stopPulseEffect()

    if (enable) {
      // 添加高亮效果
      if (this.glowMesh) {
        ;(this.glowMesh.material as THREE.MeshBasicMaterial).opacity = 0.4
      }

      // 稍微抬高节点
      this.nodeMesh.position.y = this.originalPosition.y + 2

      // 放大节点标签
      if (this.nodeLabel) {
        const labelElement = this.nodeLabel?.element as HTMLElement
        labelElement.style.transform = 'scale(1.1)'
        labelElement.style.boxShadow = `0 0 15px ${this.getStatusHighlightColor()}, 0 2px 5px rgba(0,0,0,0.5)`
      }
    } else {
      // 恢复正常状态
      if (this.glowMesh) {
        ;(this.glowMesh.material as THREE.MeshBasicMaterial).opacity = 0.15
      }

      // 恢复原始高度
      this.nodeMesh.position.y = this.originalPosition.y

      // 恢复标签原始大小
      if (this.nodeLabel) {
        const labelElement = this.nodeLabel?.element as HTMLElement
        labelElement.style.transform = 'scale(1)'
        labelElement.style.boxShadow = `0 2px 5px rgba(0,0,0,0.3)`
      }

      // 如果是审核中状态，重新添加脉冲效果
      if (this.status === ReviewNodeStatus.REVIEWING) {
        this.addPulseEffect()
      }
    }
  }

  // 添加到场景
  addToScene(scene: THREE.Scene): void {
    scene.add(this.nodeMesh)
  }

  // 从场景中移除
  removeFromScene(scene: THREE.Scene): void {
    scene.remove(this.nodeMesh)
    this.stopPulseEffect()
  }

  // 获取状态对应的色调值
  private getStatusHue(): number {
    switch (this.status) {
      case ReviewNodeStatus.APPROVED:
        return 0.33 // 绿色
      case ReviewNodeStatus.REJECTED:
        return 0.0 // 红色
      case ReviewNodeStatus.REVIEWING:
        return 0.15 // 黄色
      case ReviewNodeStatus.PENDING:
        return 0.0 // 无色调
      case ReviewNodeStatus.SUBMITTED:
        return 0.6 // 蓝色
      default:
        return 0.0
    }
  }

  // 增强的状态材质
  private getEnhancedStatusMaterial(status: ReviewNodeStatus): THREE.Material {
    let color
    let emissive
    let emissiveIntensity

    switch (status) {
      case ReviewNodeStatus.PENDING:
        color = 0x666666
        emissive = 0x333333
        emissiveIntensity = 0.3
        break
      case ReviewNodeStatus.REVIEWING:
        color = 0xffcc00
        emissive = 0xff8800
        emissiveIntensity = 0.5
        break
      case ReviewNodeStatus.APPROVED:
        color = 0x00cc66
        emissive = 0x00ff88
        emissiveIntensity = 0.6
        break
      case ReviewNodeStatus.REJECTED:
        color = 0xff3366
        emissive = 0xff0044
        emissiveIntensity = 0.5
        break
      case ReviewNodeStatus.SUBMITTED:
        color = 0x00aaff
        emissive = 0x0088ff
        emissiveIntensity = 0.4
        break
      default:
        color = 0x888888
        emissive = 0x444444
        emissiveIntensity = 0.2
    }

    return new THREE.MeshStandardMaterial({
      color: color,
      emissive: emissive,
      emissiveIntensity: emissiveIntensity,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9,
    })
  }
}

// 创建审核节点的工厂函数
export function createReviewNode(options: ReviewNodeOptions): ReviewNode {
  return new ReviewNode(options)
}
