import * as THREE from 'three'
import { nodeTree, reviewers, timeline } from '@/mock/timeline'
import type { FileNodeTree } from '@/mock/timeline'

/**
 * CalendarSceneOptions
 * @description 构造日历场景所需的参数
 */
export interface CalendarSceneOptions {
  gridSizeX: number // 网格宽度（X轴）
  gridSizeZ: number // 网格深度（Z轴）
  calendarBarHeight: number // 日历条厚度（Y轴）
  calendarBarDepth: number // 日历条前后厚度（Z轴）
  calendarTexture: THREE.Texture // 日历条canvas贴图
}

/**
 * CalendarScene
 * @description 封装日历条（长方体+贴图）和内容区底板（平面）的3D组合体
 */
export class CalendarScene {
  public calendarBar: THREE.Mesh // 顶部日历条Mesh
  public contentPlane: THREE.Mesh // 内容区底板Mesh
  public group: THREE.Group // 组合体，便于整体操作
  private gridHelper: THREE.GridHelper | null = null // 网格辅助线，初始为null

  constructor(options: CalendarSceneOptions) {
    const { gridSizeX, gridSizeZ, calendarBarHeight, calendarBarDepth, calendarTexture } = options

    // 创建组
    this.group = new THREE.Group()

    // 1. 创建顶部日历条（长方体，带贴图）
    const calendarBarGeometry = new THREE.BoxGeometry(
      gridSizeX,
      calendarBarHeight,
      calendarBarDepth,
    )

    // 升级为更高质量的材质
    const calendarBarMaterials = [
      new THREE.MeshStandardMaterial({
        color: 0x1a3a7a,
        metalness: 0.7,
        roughness: 0.3,
        envMapIntensity: 0.8,
      }), // 右
      new THREE.MeshStandardMaterial({
        color: 0x1a3a7a,
        metalness: 0.7,
        roughness: 0.3,
        envMapIntensity: 0.8,
      }), // 左
      new THREE.MeshStandardMaterial({
        map: calendarTexture,
        roughness: 0.3,
        metalness: 0.6,
      }), // 顶
      new THREE.MeshStandardMaterial({
        color: 0x1a3a7a,
        metalness: 0.7,
        roughness: 0.3,
        envMapIntensity: 0.8,
      }), // 底
      new THREE.MeshStandardMaterial({
        color: 0x1a3a7a,
        metalness: 0.7,
        roughness: 0.3,
        envMapIntensity: 0.8,
      }), // 前
      new THREE.MeshStandardMaterial({
        color: 0x1a3a7a,
        metalness: 0.7,
        roughness: 0.3,
        envMapIntensity: 0.8,
      }), // 后
    ]

    this.calendarBar = new THREE.Mesh(calendarBarGeometry, calendarBarMaterials)
    // 位置：顶部，略微悬浮在内容区上方
    this.calendarBar.position.set(0, calendarBarHeight / 2, -gridSizeZ / 2 + calendarBarDepth / 2)
    // 添加阴影效果
    this.calendarBar.castShadow = true
    this.calendarBar.receiveShadow = true

    // 2. 创建内容区底板（平面）- 升级材质
    const contentPlaneGeometry = new THREE.PlaneGeometry(gridSizeX, gridSizeZ)

    // 创建网格纹理
    const gridCanvas = document.createElement('canvas')
    const gridSize = 2048 // 纹理尺寸，更大以获得更高分辨率
    gridCanvas.width = gridSize
    gridCanvas.height = gridSize
    const gridCtx = gridCanvas.getContext('2d')
    if (gridCtx) {
      // 填充蓝色背景，更接近参考项目中的颜色
      const gradient = gridCtx.createLinearGradient(0, 0, 0, gridSize)
      gradient.addColorStop(0, '#2c4470') // 更亮的蓝色，接近参考项目
      gradient.addColorStop(1, '#1e3055') // 较深的蓝色
      gridCtx.fillStyle = gradient
      gridCtx.fillRect(0, 0, gridSize, gridSize)

      // 计算网格间距
      const cellSize = gridSize / 20

      // 绘制水平线，使用浅蓝色虚线
      gridCtx.strokeStyle = '#5a80b0' // 更亮的蓝色线条
      gridCtx.lineWidth = 1
      gridCtx.setLineDash([4, 4]) // 使用虚线
      for (let y = 0; y <= gridSize; y += cellSize) {
        gridCtx.beginPath()
        gridCtx.moveTo(0, y)
        gridCtx.lineTo(gridSize, y)
        gridCtx.stroke()
      }

      // 绘制垂直线
      for (let x = 0; x <= gridSize; x += cellSize) {
        gridCtx.beginPath()
        gridCtx.moveTo(x, 0)
        gridCtx.lineTo(x, gridSize)
        gridCtx.stroke()
      }
      gridCtx.setLineDash([]) // 重置虚线设置

      // 添加边缘发光效果，让边缘更清晰
      gridCtx.strokeStyle = '#4a7ad1' // 亮蓝色
      gridCtx.lineWidth = 2
      gridCtx.strokeRect(2, 2, gridSize - 4, gridSize - 4)
    }

    // 创建纹理并设置重复
    const gridTexture = new THREE.CanvasTexture(gridCanvas)
    gridTexture.wrapS = THREE.RepeatWrapping
    gridTexture.wrapT = THREE.RepeatWrapping
    gridTexture.repeat.set(3, 3) // 增加重复次数，使网格线条更密集

    // 创建内容区平面材质，应用网格纹理
    const contentPlaneMaterial = new THREE.MeshStandardMaterial({
      map: gridTexture,
      color: 0x3a5787, // 调整为参考项目中类似的颜色
      transparent: true,
      opacity: 1.0, // 不透明度调高
      side: THREE.DoubleSide,
      metalness: 0.3,
      roughness: 0.7,
    })

    this.contentPlane = new THREE.Mesh(contentPlaneGeometry, contentPlaneMaterial)
    this.contentPlane.rotation.x = -Math.PI / 2 // 水平放置

    // 调整位置，确保与日历条对齐
    // 日历条位于前侧，内容区向后延伸
    this.contentPlane.position.set(
      0, // X轴居中
      0, // Y轴与地面平齐
      -gridSizeZ / 4, // Z轴向后调整，使日历条位于正前方
    )

    this.contentPlane.receiveShadow = true

    // 添加外框
    const edgeGeometry = new THREE.EdgesGeometry(contentPlaneGeometry)
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x4a7ad1,
      linewidth: 1.5, // 注意：由于WebGL限制，线宽在大多数浏览器中会被忽略
    })
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial)
    edges.rotation.x = -Math.PI / 2 // 与底板相同的旋转
    edges.position.copy(this.contentPlane.position) // 与底板相同的位置

    // 4. 组合所有元素
    this.group.add(this.calendarBar)
    this.group.add(this.contentPlane)
    this.group.add(edges)
  }

  /**
   * addToScene
   * @description 一键将日历条+底板整体添加到主场景
   * @param scene THREE.Scene
   */
  addToScene(scene: THREE.Scene) {
    scene.add(this.group)
  }

  /**
   * setCalendarTexture
   * @description 动态更新日历条贴图
   * @param texture THREE.Texture
   */
  setCalendarTexture(texture: THREE.Texture) {
    const material = this.calendarBar.material as THREE.MeshStandardMaterial
    material.map = texture
    material.needsUpdate = true
  }

  /**
   * setPosition
   * @description 整体移动日历场景
   * @param x X轴
   * @param y Y轴
   * @param z Z轴
   */
  setPosition(x: number, y: number, z: number) {
    this.group.position.set(x, y, z)
  }

  /**
   * setVisible
   * @description 控制整体显隐
   * @param visible boolean
   */
  setVisible(visible: boolean) {
    this.group.visible = visible
  }

  /**
   * setGridVisible
   * @description 控制网格辅助线显隐
   * @param visible boolean
   */
  setGridVisible(visible: boolean) {
    if (this.gridHelper) {
      this.gridHelper.visible = visible
    }
  }
}

/**
 * 在日历条上方批量渲染节点单元格
 * @param nodeTree FileNodeTree 根节点
 * @param calendarBarMesh THREE.Mesh 日历条Mesh
 * @param options 配置项（可选：单元格大小、间距等）
 */
export function renderNodeTreeOnCalendar(
  nodeTree: FileNodeTree,
  calendarBarMesh: THREE.Mesh,
  options: any = {},
) {
  // 审核人Y轴映射
  const reviewerYMap = reviewers.reduce(
    (map, r, idx) => {
      map[r.id] = 50 - idx * 36 // 调整纵向间距为36，起点为50，与审核区域行高一致
      return map
    },
    {} as Record<string, number>,
  )
  // 时间X轴映射
  const timelineXMap = timeline.reduce(
    (map, date, idx) => {
      const cellWidth = 140 // 固定单元格宽度为140px，与日历贴图保持一致
      const leftOffset = 280 // 左侧偏移量，与日历贴图保持一致
      // 计算节点位置，需要调整为3D坐标系
      // 由于Three.js中心是(0,0,0)，所以需要将左侧偏移后的位置向左偏移整个场景宽度的一半
      const totalWidth = timeline.length * cellWidth // 总宽度
      const sceneCenter = (leftOffset + totalWidth) / 2 // 场景中心位置
      map[date] = leftOffset + idx * cellWidth + cellWidth / 2 - sceneCenter // 居中对齐
      return map
    },
    {} as Record<string, number>,
  )
  // 单元格参数
  const cellWidth = options.cellWidth || 45 // 调整为与日历单元格对应的宽度
  const cellHeight = options.cellHeight || 18
  const cellDepth = options.cellDepth || 10

  // 节点连接线组
  const connectionGroup = new THREE.Group()
  calendarBarMesh.add(connectionGroup)

  // 存储节点位置信息，用于后续创建连接线
  const nodePositions = new Map()

  // 获取状态颜色
  function getStatusColor(status: string): number {
    switch (status) {
      case '已审核':
        return 0x00ff66 // 绿色
      case '已提交':
        return 0x00aaff // 蓝色
      case '审核中':
        return 0xffcc00 // 黄色
      case '待审核':
        return 0x888888 // 灰色
      case '已驳回':
        return 0xff3366 // 红色
      case '未上传':
        return 0x555555 // 深灰色
      default:
        return 0xaaaaaa // 默认灰色
    }
  }

  // 创建发光材质
  function createGlowingMaterial(color: number) {
    return new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.5,
      roughness: 0.3,
      emissive: color,
      emissiveIntensity: 0.2,
    })
  }

  // 递归渲染节点和连接线
  function renderNode(node: FileNodeTree, parent: FileNodeTree | null = null) {
    const x = timelineXMap[node.time] || 0
    const y = reviewerYMap[node.reviewerId] || 0
    const z = calendarBarMesh.position.z + 8 // 在日历条上方8个单位，提高可见度

    // 创建单元格
    const nodeColor = getStatusColor(node.status)
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(cellWidth, cellHeight, cellDepth),
      createGlowingMaterial(nodeColor),
    )
    box.position.set(x, y, z)
    box.castShadow = true
    box.receiveShadow = true

    // 存储节点位置
    nodePositions.set(node.id, { x, y, z })

    // 将节点数据存储在userData中，以便交互时能够获取到
    box.userData = {
      id: node.id,
      reviewerId: node.reviewerId,
      time: node.time,
      type: node.type,
      status: node.status,
      remark: node.remark || '',
    }

    // 添加节点标签
    const labelGeometry = new THREE.PlaneGeometry(cellWidth + 5, cellHeight / 2)
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 32
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.type, canvas.width / 2, canvas.height / 2)

      const texture = new THREE.CanvasTexture(canvas)
      const labelMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
      })

      const label = new THREE.Mesh(labelGeometry, labelMaterial)
      label.position.set(0, -cellHeight / 1.5, cellDepth / 2 + 0.1)
      box.add(label)
    }

    // 添加状态指示器
    const indicatorGeometry = new THREE.SphereGeometry(cellHeight / 4, 16, 16)
    const indicatorMaterial = new THREE.MeshStandardMaterial({
      color: nodeColor,
      emissive: nodeColor,
      emissiveIntensity: 0.5,
    })
    const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial)
    indicator.position.set(cellWidth / 2 - 5, cellHeight / 2 + 2, cellDepth / 2 + 2)
    box.add(indicator)

    // 将节点添加到日历条
    calendarBarMesh.add(box)

    // 如果有父节点，创建连接线
    if (parent) {
      const parentPos = nodePositions.get(parent.id)
      if (parentPos) {
        // 创建曲线连接线
        const curve = new THREE.CubicBezierCurve3(
          new THREE.Vector3(parentPos.x, parentPos.y, parentPos.z),
          new THREE.Vector3(parentPos.x + (x - parentPos.x) * 0.25, parentPos.y + 15, parentPos.z),
          new THREE.Vector3(x - (x - parentPos.x) * 0.25, y + 15, z),
          new THREE.Vector3(x, y, z),
        )

        const points = curve.getPoints(30)
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0x1adfff,
          linewidth: 2,
          transparent: true,
          opacity: 0.7,
        })

        const line = new THREE.Line(lineGeometry, lineMaterial)
        connectionGroup.add(line)

        // 添加方向指示箭头
        const arrowPos = curve.getPointAt(0.7)
        const arrowDir = new THREE.Vector3()
          .subVectors(curve.getPointAt(0.8), curve.getPointAt(0.6))
          .normalize()

        const arrowLength = 5
        const arrowGeometry = new THREE.ConeGeometry(2, arrowLength, 8)
        const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0x1adfff })
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial)

        // 设置箭头位置和方向
        arrow.position.copy(arrowPos)
        const axis = new THREE.Vector3(0, 1, 0)
        arrow.quaternion.setFromUnitVectors(axis, arrowDir)
        arrow.rotateX(Math.PI / 2)

        connectionGroup.add(arrow)
      }
    }

    // 递归渲染子节点
    if (node.children) {
      node.children.forEach((child) => renderNode(child, node))
    }
  }

  // 从根节点开始渲染
  renderNode(nodeTree)
}
