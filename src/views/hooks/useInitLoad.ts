import * as THREE from 'three'
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { onMounted, onUnmounted, ref } from 'vue'
// @ts-ignore
import { CalendarScene, renderNodeTreeOnCalendar } from '@/three/CalendarScene'
import { mockDateOptions, nodeTree, timeline, reviewers } from '@/mock/timeline'

function useInitLoad() {
  // Three.js 原生对象
  let scene: THREE.Scene
  let camera: THREE.OrthographicCamera
  let renderer: THREE.WebGLRenderer
  let controls: OrbitControls
  let calendarScene: CalendarScene
  let animationFrameId: number | undefined
  let flashPhase = 0

  // 鼠标拾取相关
  let raycaster: THREE.Raycaster
  let mouse: THREE.Vector2

  // 当前选中的节点
  const selectedNode = ref(null)

  /**
   * 绘制文件夹icon
   * @param {CanvasRenderingContext2D} ctx - canvas上下文
   * @param {number} x - icon中心x
   * @param {number} y - icon中心y
   * @param {number} width - icon宽度
   * @param {number} height - icon高度
   * @param {string} bodyColor - 文件夹主体颜色
   * @param {string} capColor - 文件夹盖颜色
   * @param {number} scale - 缩放比例（可选）
   */
  function drawFolderIcon(
    ctx,
    x,
    y,
    width,
    height,
    bodyColor = '#ffe066',
    capColor = '#ffd700',
    scale = 1,
  ) {
    // 主体
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x - width / 2, y - height / 2 + height * 0.3)
    ctx.lineTo(x + width / 2, y - height / 2 + height * 0.3)
    ctx.lineTo(x + width / 2, y + height / 2)
    ctx.lineTo(x - width / 2, y + height / 2)
    ctx.closePath()
    ctx.fillStyle = bodyColor
    ctx.shadowColor = 'rgba(255,255,100,0.3)'
    ctx.shadowBlur = 8 * scale
    ctx.fill()
    ctx.restore()

    // 盖
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x - width / 2 + width * 0.1, y - height / 2 + height * 0.3)
    ctx.lineTo(x - width / 2 + width * 0.4, y - height / 2)
    ctx.lineTo(x + width / 2 - width * 0.1, y - height / 2)
    ctx.lineTo(x + width / 2 - width * 0.4, y - height / 2 + height * 0.3)
    ctx.closePath()
    ctx.fillStyle = capColor
    ctx.fill()
    ctx.restore()
  }

  // 审核人进度区贴图
  function createReviewerGridTexture() {
    const auditData: Record<string, Record<string, { status: string }>> = {}
    reviewers.forEach((r) => {
      auditData[r.id] = {}
    })
    mockDateOptions.forEach((item) => {
      const reviewer = reviewers.find((r) => r.name === item.title)
      if (!reviewer) {
        return
      }
      item.timeLine.forEach((day) => {
        auditData[reviewer.id][day.time] = { status: day.status }
      })
    })

    const cellWidth = 140  // 固定单元格宽度为140px，与日历贴图保持一致
    const leftOffset = 280  // 左侧偏移量，与日历贴图保持一致
    const iconColWidth = 120  // 图标列宽度
    const nameColWidth = 160  // 姓名列宽度
    const rowHeight = 36
    const iconOffsetX = 30  // icon向右偏移
    const nameOffsetX = 20  // 姓名向左偏移
    const calendarBarHeight = 60  // 预留日历条厚度
    const startY = 20 + calendarBarHeight  // 内容整体下移
    const totalWidth = timeline.length * cellWidth  // 总宽度
    const canvasWidth = leftOffset + totalWidth
    const canvasHeight = startY + reviewers.length * rowHeight + 40
    const canvas = document.createElement('canvas')
    const scale = window.devicePixelRatio || 2
    const extraScale = 2  // 分辨率提升倍数
    canvas.width = canvasWidth * scale * extraScale
    canvas.height = canvasHeight * scale * extraScale
    canvas.style.width = canvasWidth + 'px'
    canvas.style.height = canvasHeight + 'px'
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return null
    }
    ctx.scale(scale * extraScale, scale * extraScale)

    // 绘制垂直分隔线
    ctx.strokeStyle = '#5a80b0'  // 使用与底板网格线相同的颜色
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(leftOffset, 0)
    ctx.lineTo(leftOffset, canvas.height / scale)
    ctx.stroke()

    // 横向分割线 - 每个审核人一条线
    const rowCount = reviewers.length
    for (let i = 0; i <= rowCount; i++) {
      const y = startY + i * rowHeight

      // 绘制分隔线
      ctx.strokeStyle = '#3970a0'  // 与底板网格线相同的颜色
      ctx.setLineDash([6, 4])
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width / scale, y)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // 绘制每个审核人
    reviewers.forEach((reviewer, rowIdx) => {
      const y = startY + rowIdx * rowHeight

      // 左侧姓名 - 更美观的字体样式
      ctx.font = 'bold 18px Microsoft YaHei'
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(reviewer.name, leftOffset - nameOffsetX, y + rowHeight / 2)

      // 文件夹icon呼吸光圈动画
      const iconX = iconColWidth / 2 + iconOffsetX
      const iconY = y + rowHeight / 2
      const scale = 1 + 0.2 * Math.abs(Math.sin(flashPhase))
      const iconW = 28 * scale
      const iconH = 18 * scale

      // 光圈 - 增强发光效果
      ctx.save()
      ctx.beginPath()
      ctx.arc(iconX, iconY, iconW * 0.8, 0, Math.PI * 2)
      ctx.shadowColor = 'rgba(255, 255, 100, 0.9)'
      ctx.shadowBlur = 20 * scale
      ctx.globalAlpha = 0.4 + 0.3 * Math.abs(Math.sin(flashPhase))
      ctx.fillStyle = 'rgba(255, 255, 100, 0.4)'
      ctx.fill()
      ctx.restore()

      // 文件夹icon（可自定义颜色）- 增强颜色对比度
      drawFolderIcon(ctx, iconX, iconY, iconW, iconH, '#ffe066', '#ffd700', scale)

      // icon下方显示文字 - 更清晰的样式
      ctx.save()
      ctx.font = 'bold 12px Microsoft YaHei'
      ctx.fillStyle = '#aaddff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText('未上传文件', iconX, iconY + iconH / 2 + 4)
      ctx.restore()

      // 为每个日期绘制状态指示器
      timeline.forEach((date, dateIdx) => {
        const status = auditData[reviewer.id]?.[date]?.status
        if (status) {
          const statusX = leftOffset + dateIdx * cellWidth + cellWidth / 2

          // 根据状态设置颜色
          let statusColor = '#888888' // 默认灰色
          switch(status) {
            case '已审核': statusColor = '#00ff66'; break; // 绿色
            case '已提交': statusColor = '#00aaff'; break; // 蓝色
            case '审核中': statusColor = '#ffcc00'; break; // 黄色
            case '已驳回': statusColor = '#ff3366'; break; // 红色
            case '未上传': statusColor = '#555555'; break; // 深灰色
          }

          // 绘制状态指示点
          ctx.save()
          // 绘制发光效果
          ctx.shadowColor = statusColor
          ctx.shadowBlur = 8

          ctx.fillStyle = statusColor
          ctx.beginPath()
          ctx.arc(statusX, y + rowHeight / 2, 5, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      })
    })

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.needsUpdate = true
    return texture
  }

  const createTempCalendarTexture = () => {
    const cellWidth = 140  // 固定单元格宽度为140px
    const leftOffset = 280  // 左侧偏移量，对应审核区域左侧的人员和文件夹 (140*2)

    const totalWidth = timeline.length * cellWidth  // 总宽度
    const canvasWidth = leftOffset + totalWidth // 日历总宽度
    const canvasHeight = 60
    const canvas = document.createElement('canvas')
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return null
    }

    // 背景渐变 - 使用参考项目中的深蓝色渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#2c4470')  // 顶部颜色，与底板和左侧区域一致
    gradient.addColorStop(1, '#1e3055')  // 底部颜色
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 顶部亮线 - 增强亮度
    ctx.strokeStyle = '#3a9adf'  // 更亮的蓝色
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

    // 左侧偏移区域的分隔线
    ctx.strokeStyle = '#3a9adf'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(leftOffset, 0)
    ctx.lineTo(leftOffset, canvas.height)
    ctx.stroke()

    // 绘制日期表头和分割线
    ctx.font = 'bold 16px Microsoft YaHei'  // 加粗字体
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    timeline.forEach((date, idx) => {
      const x = leftOffset + idx * cellWidth
      // 解析日期，从YYYY-MM-DD格式中提取日和星期
      const dateObj = new Date(date)
      const day = dateObj.getDate()
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const weekday = weekdays[dateObj.getDay()]

      // 判断是否是周末
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6

      // 判断是否是今天
      const today = new Date()
      const isToday = date === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

      // 设置文字颜色
      if (isToday) {
        ctx.fillStyle = '#ffff00'  // 今天用黄色
      } else if (isWeekend) {
        ctx.fillStyle = '#ff6e6e'  // 周末用红色
      } else {
        ctx.fillStyle = '#ffffff'  // 工作日用白色
      }

      // 绘制日期数字
      ctx.font = 'bold 18px Microsoft YaHei'
      ctx.fillText(day.toString(), x + cellWidth / 2, canvasHeight / 3)

      // 绘制星期
      ctx.font = '14px Microsoft YaHei'
      ctx.fillText(weekday, x + cellWidth / 2, canvasHeight * 2/3)

      // 分割线 - 使用参考项目的样式
      ctx.strokeStyle = '#1a5ad1'  // 较暗的蓝色
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
      ctx.setLineDash([])
    })

    // 绘制角标（遍历mockDateOptions）- 保留原有逻辑，调整样式
    mockDateOptions.forEach((item) => {
      item.timeLine.forEach((day: any) => {
        if (day.tag) {
          const idx = timeline.findIndex((t) => t === day.time)
          if (idx === -1) {
            return
          }
          const x = leftOffset + idx * cellWidth + cellWidth / 2

          // 角标色块 - 改用圆形背景和内发光
          ctx.save()

          // 绘制发光效果
          const glowRadius = 12
          const glowColor = day.tagColor || '#ff3366'
          ctx.shadowColor = glowColor
          ctx.shadowBlur = 6

          // 绘制圆形背景
          ctx.fillStyle = day.tagColor || '#ff3366'
          ctx.beginPath()
          ctx.arc(x + 30, canvasHeight / 2 + 16, 8, 0, Math.PI * 2)
          ctx.fill()

          // 角标文字 - 使用白色，更好的对比度
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 10px Microsoft YaHei'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(day.tag, x + 30, canvasHeight / 2 + 16)
          ctx.restore()
        }
      })
    })

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }

  // 初始化Three.js场景
  function initThreeJS() {
    const container = document.getElementById('3d-container')
    if (!container) {
      console.error('找不到3D容器元素')
      return
    }
    container.innerHTML = '' // 关键：每次初始化前清空，防止多个canvas

    // 创建场景
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f2555)

    // 计算理想的相机位置和参数
    const cellWidth = 140  // 固定单元格宽度
    const leftOffset = 280  // 左侧偏移
    const totalWidth = timeline.length * cellWidth  // 总宽度
    const calendarWidth = leftOffset + totalWidth  // 日历总宽度
    const calendarHeight = 400  // 日历高度

    // 优化后的相机视角 - 根据场景大小自适应调整
    const aspectRatio = container.clientWidth / container.clientHeight
    // 使用正交相机，更适合平面可视化
    camera = new THREE.OrthographicCamera(
      calendarWidth / -2,  // left
      calendarWidth / 2,   // right
      calendarHeight / 2,  // top
      calendarHeight / -2, // bottom
      1,                   // near
      2000                 // far
    )
    // 调整相机缩放以适应容器
    const cameraZoom = Math.min(
      container.clientWidth / calendarWidth,
      container.clientHeight / calendarHeight
    ) * 0.9  // 留出10%的边距，确保完全显示
    camera.zoom = cameraZoom
    camera.position.set(0, 400, 100)  // 调整相机高度和距离，更接近顶视图
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    // 启用阴影
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    // 轨道控制器，优化交互体验
    controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0, 0)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    // 限制相机旋转角度 - 防止过度旋转
    controls.minPolarAngle = Math.PI / 4   // 45度
    controls.maxPolarAngle = Math.PI / 2.2 // 约82度
    // 允许平移，但设置合理的限制范围
    controls.enablePan = true
    controls.panSpeed = 1.0
    // 更小的旋转速度使控制更精确
    controls.rotateSpeed = 0.8
    // 允许缩放，但设置合理的最小最大距离
    controls.zoomSpeed = 1.2
    controls.minDistance = 50
    controls.maxDistance = 1000
    // 限制相机高度，保持良好的视角
    controls.maxZoom = 3.0  // 正交相机最大缩放
    controls.minZoom = 0.2  // 正交相机最小缩放

    // 取消控制左右转动限制，允许自由旋转
    // controls.minAzimuthAngle = azimuth - Math.PI / 4
    // controls.maxAzimuthAngle = azimuth + Math.PI / 4

    // 优化光照系统
    // 1. 环境光 - 提供基础照明
    const ambientLight = new THREE.AmbientLight(0x6688cc, 0.4)
    scene.add(ambientLight)

    // 2. 主平行光 - 模拟主光源，产生阴影
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
    directionalLight.position.set(100, 180, 100)
    directionalLight.target.position.set(0, 0, 0)
    // 启用阴影
    directionalLight.castShadow = true
    // 优化阴影质量
    directionalLight.shadow.mapSize.width = 4048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 500
    directionalLight.shadow.camera.left = -200
    directionalLight.shadow.camera.right = 200
    directionalLight.shadow.camera.top = 200
    directionalLight.shadow.camera.bottom = -200
    directionalLight.shadow.bias = -0.0005
    scene.add(directionalLight)
    scene.add(directionalLight.target)

    // 3. 半球光 - 提供更自然的环境光照
    const hemisphereLight = new THREE.HemisphereLight(0xaaccff, 0x223366, 0.5)
    scene.add(hemisphereLight)

    // 4. 添加蓝色点光源 - 增强科技感
    const bluePointLight = new THREE.PointLight(0x1adfff, 1.5, 300)
    bluePointLight.position.set(0, 100, 50)
    scene.add(bluePointLight)

    // 5. 添加黄色点光源 - 提供暖色调平衡
    const yellowPointLight = new THREE.PointLight(0xffcc66, 0.8, 250)
    yellowPointLight.position.set(-150, 80, -50)
    scene.add(yellowPointLight)

    // 创建日历场景（长方体+平面+网格）
    const calendarTexture = createTempCalendarTexture()
    if (calendarTexture) {
      // 使用与相机设置相同的尺寸参数
      const cellWidth = 140  // 固定单元格宽度
      const leftOffset = 280  // 左侧偏移
      const totalWidth = timeline.length * cellWidth  // 总宽度
      const calendarWidth = leftOffset + totalWidth  // 日历总宽度
      const calendarDepth = 400  // 与相机视图匹配的深度

      calendarScene = new CalendarScene({
        gridSizeX: calendarWidth,  // 使用计算得到的日历总宽度
        gridSizeZ: calendarDepth,  // 使用与相机视图匹配的深度
        calendarBarHeight: 8,
        calendarBarDepth: 40,  // 稍微增加日历条的厚度，让它更显眼
        calendarTexture,
      })
      calendarScene.addToScene(scene)

      // 调整日历场景位置，使其完全位于视野内
      calendarScene.setPosition(0, 0, 0)

      // 启用渲染节点
      renderNodeTreeOnCalendar(nodeTree, calendarScene.calendarBar, {})

      // 记录创建完成
      console.log('审核节点渲染完成', { calendarWidth, calendarDepth })
    }

    // 初始化射线检测器和鼠标坐标
    raycaster = new THREE.Raycaster()
    mouse = new THREE.Vector2()

    // 添加鼠标事件监听
    if (container) {
      container.addEventListener('click', onMouseClick)
      container.addEventListener('mousemove', onMouseMove)
    }

    // 启动渲染循环
    animate()
  }

  // 鼠标移动处理
  function onMouseMove(event) {
    if (!calendarScene || !camera) return

    // 计算鼠标在归一化设备坐标中的位置
    const container = document.getElementById('3d-container')
    if (!container) return

    const rect = container.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1

    // 设置射线
    raycaster.setFromCamera(mouse, camera)

    // 检测与节点的交叉
    const intersects = raycaster.intersectObjects(calendarScene.calendarBar.children, true)

    // 重置所有节点的缩放
    resetNodesScale()

    // 如果有交叉，高亮显示最近的节点
    if (intersects.length > 0) {
      // 找到第一个Box几何体（节点）
      const nodeObject = findNodeObject(intersects)
      if (nodeObject) {
        // 高亮显示
        nodeObject.scale.set(1.1, 1.1, 1.1)
        document.body.style.cursor = 'pointer'
        return
      }
    }

    // 如果没有交叉，恢复默认光标
    document.body.style.cursor = 'default'
  }

  // 鼠标点击处理
  function onMouseClick(event) {
    if (!calendarScene || !camera) return

    // 计算鼠标在归一化设备坐标中的位置
    const container = document.getElementById('3d-container')
    if (!container) return

    const rect = container.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1

    // 设置射线
    raycaster.setFromCamera(mouse, camera)

    // 检测与节点的交叉
    const intersects = raycaster.intersectObjects(calendarScene.calendarBar.children, true)

    // 如果有交叉，显示节点信息
    if (intersects.length > 0) {
      // 找到第一个Box几何体（节点）
      const nodeObject = findNodeObject(intersects)
      if (nodeObject && nodeObject.userData) {
        // 选中节点
        selectedNode.value = nodeObject.userData
        console.log('选中节点:', nodeObject.userData)

        // 这里可以添加显示节点详情的逻辑，例如弹出对话框
        // showNodeDetails(nodeObject.userData)
      }
    }
  }

  // 查找节点对象
  function findNodeObject(intersects) {
    for (let i = 0; i < intersects.length; i++) {
      let object = intersects[i].object

      // 向上查找父对象，直到找到节点对象
      while (object && !(object.geometry instanceof THREE.BoxGeometry) && object.parent) {
        object = object.parent
      }

      // 如果找到了节点对象，返回
      if (object && object.geometry instanceof THREE.BoxGeometry) {
        return object
      }
    }

    return null
  }

  // 重置所有节点的缩放
  function resetNodesScale() {
    if (!calendarScene || !calendarScene.calendarBar) return

    calendarScene.calendarBar.children.forEach(child => {
      if (child instanceof THREE.Mesh && child.geometry instanceof THREE.BoxGeometry) {
        child.scale.set(1, 1, 1)
      }
    })
  }

  // 对外暴露的初始化方法
  const initLoad = () => {
    console.log('初始化3D场景')
    initThreeJS()
  }

  // 窗口大小调整处理，保证3D画面自适应
  function onWindowResize() {
    const container = document.getElementById('3d-container')
    if (!container || !camera || !renderer) {
      return
    }

    // 对于正交相机，需要重新计算视锥体
    const cellWidth = 140
    const leftOffset = 280
    const totalWidth = timeline.length * cellWidth
    const calendarWidth = leftOffset + totalWidth
    const calendarHeight = 400

    // 计算新的缩放比例
    const cameraZoom = Math.min(
      container.clientWidth / calendarWidth,
      container.clientHeight / calendarHeight
    ) * 0.9

    // 更新相机参数
    camera.left = calendarWidth / -2
    camera.right = calendarWidth / 2
    camera.top = calendarHeight / 2
    camera.bottom = calendarHeight / -2
    camera.zoom = cameraZoom
    camera.updateProjectionMatrix()

    // 更新渲染器大小
    renderer.setSize(container.clientWidth, container.clientHeight)
  }

  // 动画循环（每帧渲染）
  function animate() {
    if (!controls || !renderer || !scene || !camera) {
      console.error('场景组件未完全初始化')
      return
    }
    animationFrameId = requestAnimationFrame(animate)
    flashPhase += 0.05 // 控制呼吸动画速度

    // 每帧刷新审核人进度区贴图
    if (calendarScene) {
      const reviewerGridTexture = createReviewerGridTexture()
      if (reviewerGridTexture) {
        const material = new THREE.MeshBasicMaterial({
          map: reviewerGridTexture,
          transparent: false,
          opacity: 1,
          side: THREE.DoubleSide,
        })
        calendarScene.contentPlane.material = material
        material.needsUpdate = true
      }

      // 添加节点动画效果
      animateNodes()
    }

    controls.update() // 必须每帧调用，保证交互流畅
    renderer.render(scene, camera)
  }

  // 节点动画效果
  function animateNodes() {
    // 找到所有节点和连接线
    if (!calendarScene || !calendarScene.calendarBar) return

    // 获取当前时间
    const time = Date.now() * 0.001

    // 遍历日历条的子对象
    calendarScene.calendarBar.children.forEach(child => {
      // 节点呼吸效果
      if (child instanceof THREE.Mesh && child.geometry instanceof THREE.BoxGeometry) {
        // 记录原始Y坐标（如果没有记录）
        if (!child.userData.originalY) {
          child.userData.originalY = child.position.y
        }

        // 轻微的上下浮动（基于原始位置）
        const originalY = child.userData.originalY
        child.position.y = originalY + Math.sin(time + child.position.x * 0.05) * 0.5

        // 查找状态指示器
        child.children.forEach(subChild => {
          if (subChild instanceof THREE.Mesh && subChild.geometry instanceof THREE.SphereGeometry) {
            // 指示器发光效果
            if (subChild.material instanceof THREE.MeshStandardMaterial) {
              subChild.material.emissiveIntensity = 0.3 + Math.sin(time * 3 + child.position.x * 0.1) * 0.2
            }
          }
        })
      }

      // 连接线动画
      if (child instanceof THREE.Group) {
        child.children.forEach(line => {
          if (line instanceof THREE.Line) {
            // 线条呼吸效果
            if (line.material instanceof THREE.LineBasicMaterial) {
              line.material.opacity = 0.5 + Math.sin(time * 2) * 0.2
            }
          }
        })
      }
    })
  }

  // 清理函数，组件卸载时释放资源
  function cleanup() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    if (renderer) {
      renderer.dispose()
    }
    if (controls) {
      controls.dispose()
    }

    // 移除事件监听
    const container = document.getElementById('3d-container')
    if (container) {
      container.removeEventListener('click', onMouseClick)
      container.removeEventListener('mousemove', onMouseMove)
    }

    window.removeEventListener('resize', onWindowResize)
  }

  // 生命周期钩子：挂载时初始化，卸载时清理
  onMounted(() => {
    window.addEventListener('resize', onWindowResize)
    initLoad()
  })

  onUnmounted(() => {
    cleanup()
  })

  // 对外暴露的操作方法
  return {
    initLoad, // 初始化方法
    updateCalendarTexture: (texture: THREE.Texture) => {
      calendarScene?.setCalendarTexture(texture)
    },
    setCalendarPosition: (x: number, y: number, z: number) => {
      calendarScene?.setPosition(x, y, z)
    },
    setCalendarVisible: (visible: boolean) => {
      calendarScene?.setVisible(visible)
    },
    setGridVisible: (visible: boolean) => {
      calendarScene?.setGridVisible(visible)
    },
    selectedNode, // 导出选中的节点
  }
}

export default useInitLoad
