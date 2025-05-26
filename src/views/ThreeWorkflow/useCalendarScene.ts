import * as THREE from 'three'

export interface CalendarSceneOptions {
  width: number
  depth: number
  height: number
  leftOffset: number
  cellWidth: number
  timeline: string[]
}

export function useCalendarScene() {
  /**
   * 创建日历场景
   * @param options 配置选项
   */
  function createCalendarScene(options: CalendarSceneOptions) {
    const { width, depth, height, leftOffset, cellWidth, timeline } = options

    // 创建一个组来容纳所有场景元素
    const group = new THREE.Group()

    // 确保日历条的总宽度正确
    const calendarBarWidth = width

    // 1. 创建日历条 (顶部长方体)
    const calendarBarGeometry = new THREE.BoxGeometry(
      calendarBarWidth,
      height,
      40 // 日历条厚度
    )

    // 创建日历贴图 (用于日历条顶部的日期显示)
    const calendarTexture = createCalendarTexture(timeline, leftOffset, cellWidth)

    // 使用高质量材质
    const calendarBarMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x1a3a7a, metalness: 0.7, roughness: 0.3 }), // 右
      new THREE.MeshStandardMaterial({ color: 0x1a3a7a, metalness: 0.7, roughness: 0.3 }), // 左
      new THREE.MeshStandardMaterial({ map: calendarTexture, roughness: 0.3, metalness: 0.6 }), // 顶
      new THREE.MeshStandardMaterial({ color: 0x1a3a7a, metalness: 0.7, roughness: 0.3 }), // 底
      new THREE.MeshStandardMaterial({ color: 0x1a3a7a, metalness: 0.7, roughness: 0.3 }), // 前
      new THREE.MeshStandardMaterial({ color: 0x1a3a7a, metalness: 0.7, roughness: 0.3 })  // 后
    ]

    const calendarBar = new THREE.Mesh(calendarBarGeometry, calendarBarMaterials)
    calendarBar.position.set(0, height / 2, -depth / 2 + 20) // 将日历条放在场景的前部
    calendarBar.castShadow = true
    calendarBar.receiveShadow = true

    // 2. 创建内容平面 (用于显示审核区域)
    const contentPlaneGeometry = new THREE.PlaneGeometry(width, depth)

    // 创建网格纹理，确保与日历对齐 - 传入更多参数以确保对齐
    const contentTexture = createGridTexture(cellWidth, leftOffset, timeline.length)

    // 创建内容平面材质
    const contentPlaneMaterial = new THREE.MeshStandardMaterial({
      map: contentTexture,
      color: 0x3a5787,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
      metalness: 0.3,
      roughness: 0.7
    })

    const contentPlane = new THREE.Mesh(contentPlaneGeometry, contentPlaneMaterial)
    contentPlane.rotation.x = -Math.PI / 2 // 水平放置
    contentPlane.position.set(
      0,                // X轴居中
      -1,               // Y轴略微下沉1个单位，避免Z-fighting
      0                 // Z轴位于中心
    )
    contentPlane.receiveShadow = true

    // 添加左侧审核区域分隔线 - 使用与参考项目相同的计算方式
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x55aaff })

    // 计算分隔线位置 - 确保在左侧区域的右边界
    const dividerX = -width/2 + leftOffset

    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(dividerX, 0, -depth/2),
      new THREE.Vector3(dividerX, 0, depth/2)
    ])
    const dividerLine = new THREE.Line(lineGeometry, lineMaterial)


    // 组合元素 - 移除了edges
    group.add(calendarBar)
    group.add(contentPlane)
    group.add(dividerLine)


    // 存储重要元素的引用，方便外部访问
    group.userData = {
      calendarBar,
      contentPlane,
      leftOffset,
      width,
      depth,
      cellWidth
    }

    return group
  }

  /**
   * 创建日历贴图
   */
  function createCalendarTexture(timeline: string[], leftOffset: number, cellWidth: number): THREE.Texture {
    const totalWidth = leftOffset + timeline.length * cellWidth
    const canvasHeight = 60

    const canvas = document.createElement('canvas')
    canvas.width = totalWidth
    canvas.height = canvasHeight
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return new THREE.Texture()
    }

    // 背景渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#2c4470')
    gradient.addColorStop(1, '#1e3055')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 顶部亮线
    ctx.strokeStyle = '#3a9adf'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(canvas.width, 0)
    ctx.stroke()

    // 底部分隔线
    ctx.strokeStyle = '#3a9adf'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, canvas.height)
    ctx.lineTo(canvas.width, canvas.height)
    ctx.stroke()

    // 左侧分隔线 - 确保与3D分隔线对齐
    ctx.strokeStyle = '#3a9adf'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(leftOffset, 0)
    ctx.lineTo(leftOffset, canvas.height)
    ctx.stroke()

    // 左侧区域标题
    ctx.font = 'bold 18px Arial'
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('审核人员', leftOffset / 2, canvasHeight / 2)

    // 日期表头
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    timeline.forEach((date, idx) => {
      const x = leftOffset + idx * cellWidth

      // 解析日期
      const dateObj = new Date(date)
      const day = dateObj.getDate()
      const month = dateObj.getMonth() + 1
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const weekday = weekdays[dateObj.getDay()]

      // 判断周末和今天
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6
      const today = new Date()
      const isToday = date === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

      // 设置文字颜色
      if (isToday) {
        ctx.fillStyle = '#ffff00' // 今天用黄色
      } else if (isWeekend) {
        ctx.fillStyle = '#ff6e6e' // 周末用红色
      } else {
        ctx.fillStyle = '#ffffff' // 工作日用白色
      }

      // 绘制日期数字
      ctx.font = 'bold 18px Arial'
      ctx.fillText(`${month}/${day}`, x + cellWidth / 2, canvasHeight / 3)

      // 绘制星期
      ctx.font = '14px Arial'
      ctx.fillText(weekday, x + cellWidth / 2, canvasHeight * 2/3)

      // 日期分割线
      ctx.strokeStyle = '#1a5ad1'
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
      ctx.setLineDash([])
    })

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }

  /**
   * 创建网格纹理
   */
  function createGridTexture(cellWidth: number, leftOffset: number, timelineLength: number = 10): THREE.Texture {
    // 从外部函数传入的参数已经是基于BASE_UNIT计算的
    // cellWidth = BASE_UNIT.CELL_WIDTH
    // leftOffset = BASE_UNIT.CELL_WIDTH * BASE_UNIT.LEFT_CELLS

    const gridSize = 2048 // 高分辨率纹理
    const gridCanvas = document.createElement('canvas')
    gridCanvas.width = gridSize
    gridCanvas.height = gridSize
    const gridCtx = gridCanvas.getContext('2d')

    if (!gridCtx) {
      return new THREE.Texture()
    }

    // 蓝色渐变背景 - 保留渐变背景
    const gradient = gridCtx.createLinearGradient(0, 0, 0, gridSize)
    gradient.addColorStop(0, '#2c4470') // 亮蓝色
    gradient.addColorStop(1, '#1e3055') // 深蓝色
    gridCtx.fillStyle = gradient
    gridCtx.fillRect(0, 0, gridSize, gridSize)

    // 创建纹理并设置
    const gridTexture = new THREE.CanvasTexture(gridCanvas)
    gridTexture.wrapS = THREE.RepeatWrapping
    gridTexture.wrapT = THREE.RepeatWrapping
    gridTexture.repeat.set(1, 1) // 不重复纹理

    return gridTexture
  }

  // 返回公开API
  return {
    createCalendarScene
  }
}
