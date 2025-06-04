import { ref, shallowRef } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import WorkflowNodeRenderer, { calculateCellWidth } from './useWorkflowNodeRenderer'
import { DEFAULT_CONFIG, COLORS, FONT_HEADER, FONT_CELL, FIXED_NODE_WIDTH } from './config'
import type { SceneConfig, TimeInterval, WorkflowNode } from './types'
import type { Reviewer, TimePoint } from './useMockData' // 仍然需要类型定义

/**
 * 工作流程图场景类
 */
class WorkflowScene {
  private config: SceneConfig
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private cssRenderer: CSS2DRenderer
  private controls!: OrbitControls
  private animationId: number | null = null

  // 场景组件
  private timelineBar: THREE.Mesh | null = null
  private reviewArea: THREE.Mesh | null = null
  private reviewerLabels: THREE.Group
  private timeLabels: THREE.Group
  private nodeGroup: THREE.Group

  // 数据相关 - 改为直接接收数据
  // private mockData = useMockData()
  private timeIntervals: TimeInterval[] = []
  private timePoints: TimePoint[] = [] // 修改为直接持有数据
  private reviewers: Reviewer[] = [] // 修改为直接持有数据
  private workflowNodes: WorkflowNode[] = [] // 修改为直接持有数据

  // 节点渲染器
  private nodeRenderer: WorkflowNodeRenderer

  // 事件处理
  private raycaster: THREE.Raycaster
  private mouse: THREE.Vector2
  private boundMouseClick: (event: MouseEvent) => void
  private boundWindowResize: () => void

  // 添加一个属性来跟踪旋转限制状态
  private isRotationLimited: boolean = true

  constructor(
    config: SceneConfig,
    data: {
      reviewers: Reviewer[]
      timePoints: TimePoint[]
      workflowNodes: WorkflowNode[]
    },
  ) {
    this.config = config

    // 直接使用传入的数据
    this.reviewers = data.reviewers
    this.timePoints = data.timePoints
    this.workflowNodes = data.workflowNodes

    // 初始化Three.js核心组件
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000)
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.cssRenderer = new CSS2DRenderer()

    // 初始化场景组
    this.reviewerLabels = new THREE.Group()
    this.timeLabels = new THREE.Group()
    this.nodeGroup = new THREE.Group()

    // 初始化事件处理
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.boundMouseClick = this.onMouseClick.bind(this)
    this.boundWindowResize = this.onWindowResize.bind(this)

    // 生成时间间隔
    this.timeIntervals = this.convertTimePointsToIntervals()

    // 初始化节点渲染器
    this.nodeRenderer = new WorkflowNodeRenderer(
      this.scene,
      this.nodeGroup,
      {
        cellWidth: DEFAULT_CONFIG.cellWidth,
        reviewRowHeight: DEFAULT_CONFIG.reviewRowHeight,
        leftOffset: DEFAULT_CONFIG.leftOffset,
        nodeSpacing: DEFAULT_CONFIG.nodeSpacing,
        reviewerColumnWidth: DEFAULT_CONFIG.reviewerColumnWidth,
        fileUploadColumnWidth: DEFAULT_CONFIG.fileUploadColumnWidth,
        timelineDepth: DEFAULT_CONFIG.timelineDepth,
      },
      this.timeIntervals,
      this.getReviewer.bind(this), // 修改为自己的方法
    )

    // 初始化场景
    this.init()
  }

  /**
   * 获取审核人信息
   */
  private getReviewer(reviewerId: string): Reviewer | undefined {
    return this.reviewers.find((reviewer) => reviewer.id === reviewerId)
  }

  /**
   * 将时间点转换为时间间隔
   */
  private convertTimePointsToIntervals(): TimeInterval[] {
    // console.log('原始timePoints数据:', this.timePoints)

    // 转换并保留原始timePoint.id
    const intervals = this.timePoints.map((tp) => ({
      date: tp.isInterval ? tp.id : tp.date, // 对于间隔使用id，对于时间点使用日期
      label: tp.label,
      isInterval: tp.isInterval || false,
      id: tp.id, // 保留原始ID
    }))

    // console.log('转换后的timeIntervals数据:', intervals)

    return intervals
  }

  /**
   * 初始化场景
   */
  private init(): void {
    this.setupScene()
    this.setupCamera()
    this.setupRenderer()
    this.setupControls()
    this.setupLights()
    this.createWorkflowLayout()
    this.setupEventListeners()
    this.startRenderLoop()
  }

  /**
   * 设置场景
   */
  private setupScene(): void {
    this.scene.background = new THREE.Color(DEFAULT_CONFIG.backgroundColor)
    this.scene.add(this.reviewerLabels)
    this.scene.add(this.timeLabels)
    this.scene.add(this.nodeGroup)
  }

  /**
   * 设置相机
   */
  private setupCamera(): void {
    // 计算场景尺寸 - 使用动态计算的总宽度
    const sceneWidth = this.getSceneWidth()
    const totalRows = this.reviewers.length
    const sceneDepth = totalRows * DEFAULT_CONFIG.reviewRowHeight

    // 设置相机位置 - 从侧前方45度角观察，更符合人眼习惯
    this.camera.position.set(sceneWidth / 2 - 300, 300, sceneDepth + 500)
    this.camera.lookAt(sceneWidth / 2, 0, sceneDepth / 2)
  }

  /**
   * 设置渲染器
   */
  private setupRenderer(): void {
    // WebGL渲染器
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.config.container.appendChild(this.renderer.domElement)

    // CSS2D渲染器
    this.cssRenderer.setSize(window.innerWidth, window.innerHeight)
    this.cssRenderer.domElement.style.position = 'absolute'
    this.cssRenderer.domElement.style.top = '0'
    this.cssRenderer.domElement.style.pointerEvents = 'none'
    this.config.cssContainer.appendChild(this.cssRenderer.domElement)
  }

  /**
   * 设置控制器
   */
  private setupControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    // 计算场景尺寸 - 使用动态计算的总宽度
    const sceneWidth = this.getSceneWidth()
    const totalRows = this.reviewers.length
    const sceneDepth = totalRows * DEFAULT_CONFIG.reviewRowHeight

    // 设置目标点为场景中心
    const targetX = sceneWidth / 2
    const targetY = 0
    const targetZ = sceneDepth / 2 + DEFAULT_CONFIG.timelineDepth / 2
    this.controls.target.set(targetX, targetY, targetZ)

    // 启用旋转，但仅限上下翻转（垂直旋转）
    this.controls.enableRotate = true

    // 设置鼠标按键功能
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE, // 左键旋转
      MIDDLE: THREE.MOUSE.DOLLY, // 中键缩放
      RIGHT: THREE.MOUSE.PAN, // 右键平移
    }

    // 应用旋转限制（默认状态）
    this.applyRotationLimits(this.isRotationLimited)

    // 启用阻尼效果，使旋转更平滑
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.1

    // 设置缩放限制
    this.controls.minDistance = 200
    this.controls.maxDistance = 1600

    // 启用缩放
    this.controls.enableZoom = true

    // 设置为顶视图
    this.camera.position.set(targetX, 800, targetZ)

    // 更新控制器
    this.controls.update()
  }

  /**
   * 应用或取消旋转限制
   * @param limited 是否限制旋转
   */
  private applyRotationLimits(limited: boolean): void {
    if (limited) {
      // 限制旋转范围 - 仅允许垂直旋转（围绕X轴），不允许水平旋转（围绕Y轴）
      this.controls.minPolarAngle = Math.PI * 0.1 // 最小仰角约10度，防止看到底部
      this.controls.maxPolarAngle = Math.PI * 0.5 // 最大仰角90度，俯视图

      // 禁用水平旋转
      this.controls.minAzimuthAngle = 0 // 锁定水平旋转角度
      this.controls.maxAzimuthAngle = 0
    } else {
      // 放开旋转限制
      this.controls.minPolarAngle = 0 // 允许完全俯视
      this.controls.maxPolarAngle = Math.PI // 允许完全仰视

      // 允许水平旋转
      this.controls.minAzimuthAngle = -Infinity
      this.controls.maxAzimuthAngle = Infinity
    }

    // 更新控制器
    this.controls.update()
  }

  /**
   * 切换旋转限制状态
   * @returns 当前旋转限制状态
   */
  public toggleRotationLimits(): boolean {
    this.isRotationLimited = !this.isRotationLimited
    this.applyRotationLimits(this.isRotationLimited)
    return this.isRotationLimited
  }

  /**
   * 设置旋转限制状态
   * @param limited 是否限制旋转
   */
  public setRotationLimits(limited: boolean): void {
    if (this.isRotationLimited !== limited) {
      this.isRotationLimited = limited
      this.applyRotationLimits(this.isRotationLimited)
    }
  }

  /**
   * 获取当前旋转限制状态
   * @returns 当前旋转限制状态
   */
  public getRotationLimitState(): boolean {
    return this.isRotationLimited
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    this.renderer.domElement.addEventListener('click', this.boundMouseClick)
    window.addEventListener('resize', this.boundWindowResize)
  }

  /**
   * 设置灯光
   */
  private setupLights(): void {
    // 计算场景尺寸用于灯光定位 - 使用动态计算的总宽度
    const sceneWidth = this.getSceneWidth()
    const totalRows = this.reviewers.length
    const sceneDepth = totalRows * DEFAULT_CONFIG.reviewRowHeight

    // 场景中心点坐标
    const centerX = sceneWidth / 2
    const centerY = 0
    const centerZ = sceneDepth / 2 + DEFAULT_CONFIG.timelineDepth / 2

    // 环境光 - 使用深空主题的环境光，与背景色协调
    const ambientLight = new THREE.AmbientLight(0x1a1f3a, 0.4)
    this.scene.add(ambientLight)

    // 主方向光 - 使用冷色调，营造科技感
    const mainLight = new THREE.DirectionalLight(0xb0d0ff, 0.9) // 冷白色，增强科技感
    mainLight.position.set(centerX + 500, 600, centerZ - 300) // 右上角位置
    mainLight.target.position.set(centerX, 0, centerZ) // 照射目标为场景中心
    mainLight.castShadow = true

    // 配置阴影参数，提高阴影质量
    mainLight.shadow.mapSize.width = 2048 // 增加阴影分辨率
    mainLight.shadow.mapSize.height = 2048
    mainLight.shadow.camera.near = 0.5
    mainLight.shadow.camera.far = 2000
    mainLight.shadow.camera.left = -1000
    mainLight.shadow.camera.right = 1000
    mainLight.shadow.camera.top = 1000
    mainLight.shadow.camera.bottom = -1000

    this.scene.add(mainLight)
    this.scene.add(mainLight.target) // 必须将target添加到场景中

    // 专门照射时间轴的聚光灯 - 使用青色调
    const timelineSpotlight = new THREE.SpotLight(0x80d0ff, 0.7)
    timelineSpotlight.position.set(centerX, 400, DEFAULT_CONFIG.timelineDepth / 2)
    timelineSpotlight.target.position.set(centerX, 0, DEFAULT_CONFIG.timelineDepth / 2) // 直接对准时间轴
    timelineSpotlight.angle = Math.PI / 6 // 较窄的光束
    timelineSpotlight.penumbra = 0.2 // 柔和的边缘
    timelineSpotlight.decay = 1.5
    timelineSpotlight.distance = 1000
    timelineSpotlight.castShadow = true

    this.scene.add(timelineSpotlight)
    this.scene.add(timelineSpotlight.target)

    // 添加柔和的补光，使用深空主题色调
    const fillLight = new THREE.DirectionalLight(0x2d3561, 0.4) // 使用头部组件渐变色
    fillLight.position.set(centerX - 300, 200, centerZ + 500) // 从左前方照射
    fillLight.target.position.set(centerX, 0, centerZ) // 照射目标为场景中心
    fillLight.castShadow = false

    this.scene.add(fillLight)
    this.scene.add(fillLight.target)

    // 添加科技感点光源 - 青色调
    const techLight = new THREE.PointLight(0x00ffff, 0.6, 800)
    techLight.position.set(centerX, 300, centerZ)
    this.scene.add(techLight)
  }

  /**
   * 创建工作流布局
   */
  private createWorkflowLayout(): void {
    // 使用动态计算的总宽度
    const sceneWidth = this.getSceneWidth()
    const sceneDepth = DEFAULT_CONFIG.reviewAreaDepth

    // 1. 创建时间轴长方体
    this.createTimelineBar(sceneWidth)

    // 2. 创建审核区域平面
    this.createReviewArea(sceneWidth, sceneDepth)

    // 3. 创建时间标签 - 注释掉以移除蓝色悬浮标签
    // this.createTimeLabels()

    // 4. 创建审核人标签
    this.createReviewerLabels()

    // 5. 创建工作流节点
    this.createWorkflowNodes()
  }

  /**
   * 创建时间轴长方体
   */
  private createTimelineBar(width: number): void {
    // 创建时间轴长方体几何体 - 注意timelineHeight控制3D长方体的物理高度(Y轴厚度)
    const timelineGeometry = new THREE.BoxGeometry(
      width,
      DEFAULT_CONFIG.timelineHeight,
      DEFAULT_CONFIG.timelineDepth, // 使用独立的时间轴深度参数
    )

    // 创建时间轴贴图 - 贴图的高度由cellHeight决定
    const timelineTexture = this.createTimelineTexture()

    // 提高贴图的清晰度
    timelineTexture.anisotropy = 16 // 增加各向异性过滤
    timelineTexture.minFilter = THREE.LinearFilter
    timelineTexture.magFilter = THREE.LinearFilter

    // 创建简单的环境贴图 - 使用立方体纹理
    const envMap = this.createSimpleEnvMap()

    // 创建材质数组 - 为每个面指定不同材质
    const materials = [
      new THREE.MeshPhysicalMaterial({
        color: DEFAULT_CONFIG.timelineBarColor,
        metalness: 0.8, // 增加金属感
        roughness: 0.2, // 降低粗糙度，使表面更光滑
        clearcoat: 0.3, // 增加清漆层厚度
        clearcoatRoughness: 0.1,
        reflectivity: 0.7, // 增加反射度
        envMap: envMap,
        envMapIntensity: 1.0, // 环境贴图强度
      }), // 右
      new THREE.MeshPhysicalMaterial({
        color: DEFAULT_CONFIG.timelineBarColor,
        metalness: 0.8,
        roughness: 0.2,
        clearcoat: 0.3,
        clearcoatRoughness: 0.1,
        reflectivity: 0.7,
        envMap: envMap,
        envMapIntensity: 1.0,
      }), // 左
      new THREE.MeshPhysicalMaterial({
        map: timelineTexture,
        roughness: 0.15, // 顶部更光滑
        metalness: 0.7,
        clearcoat: 0.5, // 顶部使用更厚的清漆层
        clearcoatRoughness: 0.05,
        reflectivity: 0.8,
        envMap: envMap,
        envMapIntensity: 1.2, // 顶部反射更强
      }), // 顶部 - 使用贴图
      new THREE.MeshPhysicalMaterial({
        color: DEFAULT_CONFIG.timelineBarColor,
        metalness: 0.8,
        roughness: 0.2,
        clearcoat: 0.3,
        clearcoatRoughness: 0.1,
        reflectivity: 0.7,
        envMap: envMap,
        envMapIntensity: 1.0,
      }), // 底
      new THREE.MeshPhysicalMaterial({
        color: DEFAULT_CONFIG.timelineBarColor,
        metalness: 0.8,
        roughness: 0.2,
        clearcoat: 0.3,
        clearcoatRoughness: 0.1,
        reflectivity: 0.7,
        envMap: envMap,
        envMapIntensity: 1.0,
      }), // 前
      new THREE.MeshPhysicalMaterial({
        color: DEFAULT_CONFIG.timelineBarColor,
        metalness: 0.8,
        roughness: 0.2,
        clearcoat: 0.3,
        clearcoatRoughness: 0.1,
        reflectivity: 0.7,
        envMap: envMap,
        envMapIntensity: 1.0,
      }), // 后
    ]

    // 创建时间轴长方体
    this.timelineBar = new THREE.Mesh(timelineGeometry, materials)

    // 设置位置 - 在审核区域上方
    this.timelineBar.position.set(
      width / 2, // X轴居中
      DEFAULT_CONFIG.timelineHeight / 2, // Y轴上浮一半高度
      DEFAULT_CONFIG.timelineDepth / 2, // Z轴位置调整为深度的一半
    )

    this.timelineBar.castShadow = true
    this.timelineBar.receiveShadow = true

    this.scene.add(this.timelineBar)
  }

  /**
   * 创建审核区域平面
   */
  private createReviewArea(width: number, depth: number): void {
    const totalRows = this.reviewers.length

    // 计算调整后的深度
    // 注意：所有行都使用reviewRowHeight（cellHeight的2倍）
    const adjustedDepth = totalRows * DEFAULT_CONFIG.reviewRowHeight

    // 使用动态计算的总宽度，确保与时间轴单元格宽度对应
    const adjustedWidth = this.getSceneWidth()

    // 创建审核区域平面几何体
    const reviewAreaGeometry = new THREE.PlaneGeometry(adjustedWidth, adjustedDepth)

    // 创建网格纹理
    const gridTexture = this.createGridTexture()

    // 创建审核区域平面材质
    const reviewAreaMaterial = new THREE.MeshStandardMaterial({
      map: gridTexture,
      color: 0x1a1f3a, // 使用头部组件渐变中间色
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      metalness: 0.4, // 增加金属感
      roughness: 0.6, // 适中的粗糙度
      emissive: 0x0a0e27, // 添加微弱的自发光，与背景色一致
      emissiveIntensity: 0.1,
    })

    // 创建审核区域平面
    this.reviewArea = new THREE.Mesh(reviewAreaGeometry, reviewAreaMaterial)

    // 设置位置和旋转 - 水平放置
    this.reviewArea.rotation.x = -Math.PI / 2
    this.reviewArea.position.set(
      adjustedWidth / 2, // X轴居中
      -1, // Y轴略微下沉1个单位，避免Z-fighting
      adjustedDepth / 2 + DEFAULT_CONFIG.timelineDepth, // Z轴居中，向后偏移时间轴的深度，避免与时间轴重叠
    )

    this.reviewArea.receiveShadow = true

    this.scene.add(this.reviewArea)

    // 添加左侧分隔线
    this.createDividerLine(adjustedWidth, adjustedDepth)

    // 添加网格线
    this.createGridLines(adjustedWidth, adjustedDepth)
  }

  /**
   * 创建左侧分隔线
   */
  private createDividerLine(width: number, depth: number): void {
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff }) // 青色分隔线

    // 计算分隔线位置 - 在左侧区域的右边界
    const dividerX = DEFAULT_CONFIG.leftOffset

    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(dividerX, 0, DEFAULT_CONFIG.timelineDepth), // 从时间轴底部开始
      new THREE.Vector3(dividerX, 0, depth + DEFAULT_CONFIG.timelineDepth),
    ])

    const dividerLine = new THREE.Line(lineGeometry, lineMaterial)
    this.scene.add(dividerLine)

    // 添加第一列与第二列的分隔线
    const firstColumnDividerX = DEFAULT_CONFIG.reviewerColumnWidth
    const firstColumnLineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(firstColumnDividerX, 0, DEFAULT_CONFIG.timelineDepth),
      new THREE.Vector3(firstColumnDividerX, 0, depth + DEFAULT_CONFIG.timelineDepth),
    ])
    const firstColumnDividerLine = new THREE.Line(firstColumnLineGeometry, lineMaterial)
    this.scene.add(firstColumnDividerLine)
  }

  /**
   * 创建审核人标签
   */
  private createReviewerLabels(): void {
    this.reviewers.forEach((reviewer, index) => {
      // 第一列显示审核人 - 使用reviewerColumnWidth的中心位置
      const x = DEFAULT_CONFIG.reviewerColumnWidth / 2
      const y = 5

      // 计算Z位置 - 所有行都使用相同的高度，并且从时间轴底部开始
      // 行高的一半 + 已经过的行数 * 行高 + 时间轴深度
      const z =
        DEFAULT_CONFIG.reviewRowHeight / 2 +
        index * DEFAULT_CONFIG.reviewRowHeight +
        DEFAULT_CONFIG.timelineDepth

      // 创建审核人标签
      const labelDiv = document.createElement('div')
      labelDiv.className = 'reviewer-label'
      labelDiv.style.cssText = `
        background: rgba(26, 31, 58, 0.95);
        color: #00ffff;
        padding: 8px 12px;
        border-radius: 6px;
        font-family: 'Microsoft YaHei', sans-serif;
        font-size: 14px;
        font-weight: bold;
        text-align: center;
        border: 1px solid #2d3561;
        min-width: 80px;
        pointer-events: none;
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
        text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
      `
      labelDiv.textContent = reviewer.name

      const label = new CSS2DObject(labelDiv)
      label.position.set(x, y, z)
      this.reviewerLabels.add(label)

      // 如果是第一行，添加"未上传文件"标签在第二列
      if (index === 0) {
        // 计算第二列的中心位置 - 审核人列宽度 + 未上传文件列宽度的一半
        const notUploadedX =
          DEFAULT_CONFIG.reviewerColumnWidth + DEFAULT_CONFIG.fileUploadColumnWidth / 2

        const notUploadedDiv = document.createElement('div')
        notUploadedDiv.className = 'not-uploaded-label'
        notUploadedDiv.style.cssText = `
          background: rgba(45, 20, 20, 0.95);
          color: #ff6464;
          padding: 8px 12px;
          border-radius: 6px;
          font-family: 'Microsoft YaHei', sans-serif;
          font-size: 14px;
          text-align: center;
          border: 1px solid #663333;
          min-width: 80px;
          pointer-events: none;
          box-shadow: 0 0 10px rgba(255, 100, 100, 0.3);
          text-shadow: 0 0 5px rgba(255, 100, 100, 0.5);
        `
        notUploadedDiv.textContent = '未上传文件'

        const notUploadedLabel = new CSS2DObject(notUploadedDiv)
        notUploadedLabel.position.set(notUploadedX, y, z)
        this.reviewerLabels.add(notUploadedLabel)
      }
    })
  }

  /**
   * 创建时间轴贴图
   * 该方法生成一个Canvas纹理，用于时间轴3D长方体的顶面
   * Canvas高度由cellHeight决定，宽度由时间间隔数量和leftOffset共同决定
   */
  private createTimelineTexture(): THREE.Texture {
    // 创建画布 - 使用更高的分辨率来提高清晰度
    const canvas = document.createElement('canvas')
    const totalWidth = this.getSceneWidth() // 使用动态计算的总宽度
    const canvasHeight = DEFAULT_CONFIG.cellHeight // 控制时间轴贴图的视觉高度

    // 提高画布分辨率，使文字更清晰
    const pixelRatio = 2 // 使用2倍像素密度
    canvas.width = totalWidth * pixelRatio
    canvas.height = canvasHeight * pixelRatio

    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return new THREE.Texture()
    }

    // 缩放绘图上下文以匹配像素比
    ctx.scale(pixelRatio, pixelRatio)

    // 绘制背景 - 深空主题渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight)
    gradient.addColorStop(0, '#1a1f3a') // 头部组件渐变中间色
    gradient.addColorStop(1, '#0a0e27') // 深空背景色
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, totalWidth, canvasHeight)

    // 绘制顶部亮线 - 增强边界视觉效果
    ctx.strokeStyle = COLORS.timelineBorder
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(totalWidth, 0)
    ctx.stroke()

    // 绘制底部分隔线 - 与审核区域的分界线
    ctx.strokeStyle = COLORS.timelineBorder
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, canvasHeight)
    ctx.lineTo(totalWidth, canvasHeight)
    ctx.stroke()

    // 绘制第一列和第二列的分隔线 - 区分审核人员、文件状态和时间点区域
    ctx.strokeStyle = COLORS.timelineBorder
    ctx.lineWidth = 1.5

    // 第一列与第二列的分隔线 - 审核人员与文件状态的分界
    ctx.beginPath()
    ctx.moveTo(DEFAULT_CONFIG.reviewerColumnWidth, 0)
    ctx.lineTo(DEFAULT_CONFIG.reviewerColumnWidth, canvasHeight)
    ctx.stroke()

    // 第二列与时间点区域的分隔线 - 固定列与时间点区域的分界
    ctx.beginPath()
    ctx.moveTo(DEFAULT_CONFIG.leftOffset, 0)
    ctx.lineTo(DEFAULT_CONFIG.leftOffset, canvasHeight)
    ctx.stroke()

    // 绘制左侧区域标题 - 使用更清晰的字体渲染
    ctx.font = FONT_HEADER
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // 应用字体平滑和抗锯齿
    ctx.shadowBlur = 0
    ctx.shadowColor = COLORS.timelineShadow

    // 第一列标题 - "审核人员"文本
    // 先绘制阴影效果，增强文字可读性
    ctx.fillStyle = COLORS.timelineShadow
    ctx.fillText('审核人员', DEFAULT_CONFIG.reviewerColumnWidth / 2 + 1, canvasHeight / 2 + 1)
    // 再绘制文字本体
    ctx.fillStyle = COLORS.timelineText
    ctx.fillText('审核人员', DEFAULT_CONFIG.reviewerColumnWidth / 2, canvasHeight / 2)

    // 第二列标题 - "文件状态"文本
    // 先绘制阴影效果，增强文字可读性
    ctx.fillStyle = COLORS.timelineShadow
    ctx.fillText(
      '文件状态',
      DEFAULT_CONFIG.reviewerColumnWidth + DEFAULT_CONFIG.fileUploadColumnWidth / 2 + 1,
      canvasHeight / 2 + 1,
    )
    // 再绘制文字本体
    ctx.fillStyle = COLORS.timelineText
    ctx.fillText(
      '文件状态',
      DEFAULT_CONFIG.reviewerColumnWidth + DEFAULT_CONFIG.fileUploadColumnWidth / 2,
      canvasHeight / 2,
    )

    // 使用timeIntervals作为日期数据源
    const timeIntervals = this.timeIntervals
    const timePoints = this.timePoints

    // 绘制日期单元格 - 每个时间点对应一个单元格
    let currentX = DEFAULT_CONFIG.leftOffset // 从左侧固定区域右边界开始

    for (let i = 0; i < timeIntervals.length; i++) {
      const timeInterval = timeIntervals[i]
      const timePointId = timeInterval.id || ''

      // 计算每个审核人在该时间点的节点数量
      const nodeCountPerReviewer = new Map<string, number>()

      // 统计每个审核人的节点数量
      for (const node of this.workflowNodes) {
        if (node.timePointId === timePointId) {
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
      const cellWidth = calculateCellWidth(maxNodesPerReviewer, DEFAULT_CONFIG.cellWidth)

      // 为交替的单元格使用不同的背景色，增强视觉区分度
      // 间隔期间使用灰色背景，非间隔期间使用交替的深浅蓝色
      const cellColor = timeInterval.isInterval
        ? COLORS.timelineCellBg.interval
        : i % 2 === 0
          ? COLORS.timelineCellBg.even
          : COLORS.timelineCellBg.odd

      ctx.fillStyle = cellColor
      ctx.fillRect(currentX, 0, cellWidth, canvasHeight)

      // 添加金属质感效果 - 顶部渐变高光，增强3D立体感
      const metalGradient = ctx.createLinearGradient(currentX, 0, currentX, canvasHeight * 0.3)
      metalGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)')
      metalGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = metalGradient
      ctx.fillRect(currentX, 0, cellWidth, canvasHeight * 0.3)

      // 绘制单元格边框 - 增强单元格之间的视觉分隔
      ctx.strokeStyle = COLORS.timelineBorder
      ctx.lineWidth = 1
      ctx.strokeRect(currentX, 0, cellWidth, canvasHeight)

      const cellCenterX = currentX + cellWidth / 2

      // 绘制日期文本 (居中显示) - 使用更清晰的字体渲染
      ctx.font = FONT_CELL

      // 先绘制阴影，增强文字可读性
      ctx.fillStyle = COLORS.timelineShadow
      ctx.fillText(timeInterval.label, cellCenterX + 1, canvasHeight / 2 + 1)

      // 再绘制文字本体，间隔期间使用灰色文本，非间隔期间使用白色文本
      ctx.fillStyle = timeInterval.isInterval ? '#cccccc' : COLORS.timelineText
      ctx.fillText(timeInterval.label, cellCenterX, canvasHeight / 2)

      // 更新当前X坐标，为下一个单元格做准备
      currentX += cellWidth
    }

    // 创建纹理并设置优化参数
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true

    // 设置更好的纹理过滤，提高文字清晰度
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter

    // 增加各向异性过滤，提高斜视角下的清晰度
    texture.anisotropy = 16

    return texture
  }

  /**
   * 获取时间间隔的真实X位置
   */
  private getTimeIntervalPosition(timeInterval: TimeInterval, index: number): number {
    // 从左侧固定区域右边界开始
    let currentX = DEFAULT_CONFIG.leftOffset

    // 计算前面所有时间点的宽度总和
    for (let i = 0; i < index; i++) {
      const prevInterval = this.timeIntervals[i]
      const prevTimePointId = prevInterval.id || ''

      // 计算每个审核人在该时间点的节点数量
      const nodeCountPerReviewer = new Map<string, number>()

      // 统计每个审核人的节点数量
      for (const node of this.workflowNodes) {
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
      const cellWidth = calculateCellWidth(maxNodesPerReviewer, DEFAULT_CONFIG.cellWidth)

      // 累加宽度
      currentX += cellWidth
    }

    return currentX
  }

  /**
   * 创建网格线
   */
  private createGridLines(width: number, depth: number): void {
    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0x335577,
      transparent: true,
      opacity: 0.4,
    })

    // 水平网格线 - 对应审核人行，所有行使用相同高度
    const linePositions: number[] = []

    // 第一行的顶部边界（从时间轴底部开始）
    linePositions.push(DEFAULT_CONFIG.timelineDepth)

    // 审核人行的分隔线
    for (let i = 0; i < this.reviewers.length; i++) {
      linePositions.push(DEFAULT_CONFIG.timelineDepth + (i + 1) * DEFAULT_CONFIG.reviewRowHeight)
    }

    // 绘制水平线
    linePositions.forEach((z) => {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, z),
        new THREE.Vector3(width, 0, z),
      ])

      const line = new THREE.Line(lineGeometry, gridMaterial)
      this.scene.add(line)
    })

    // 垂直网格线
    // 绘制第一列和第二列之间的分隔线
    const verticalLine1 = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(DEFAULT_CONFIG.reviewerColumnWidth, 0, DEFAULT_CONFIG.timelineDepth),
      new THREE.Vector3(
        DEFAULT_CONFIG.reviewerColumnWidth,
        0,
        depth + DEFAULT_CONFIG.timelineDepth,
      ),
    ])
    this.scene.add(new THREE.Line(verticalLine1, gridMaterial))

    // 绘制第二列和时间区域之间的分隔线
    const verticalLine2 = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(DEFAULT_CONFIG.leftOffset, 0, DEFAULT_CONFIG.timelineDepth),
      new THREE.Vector3(DEFAULT_CONFIG.leftOffset, 0, depth + DEFAULT_CONFIG.timelineDepth),
    ])
    this.scene.add(new THREE.Line(verticalLine2, gridMaterial))

    // 绘制时间区域的网格线，使用动态计算的单元格宽度
    // 从左侧固定区域右边界开始
    let currentX = DEFAULT_CONFIG.leftOffset

    // 绘制每个时间点的垂直线
    for (let i = 0; i <= this.timeIntervals.length; i++) {
      // 绘制当前位置的垂直线
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(currentX, 0, DEFAULT_CONFIG.timelineDepth), // 从时间轴底部开始
        new THREE.Vector3(currentX, 0, depth + DEFAULT_CONFIG.timelineDepth),
      ])
      this.scene.add(new THREE.Line(lineGeometry, gridMaterial))

      // 如果不是最后一条线，计算下一个位置
      if (i < this.timeIntervals.length) {
        const timeInterval = this.timeIntervals[i]
        const timePointId = timeInterval.id || ''

        // 计算每个审核人在该时间点的节点数量
        const nodeCountPerReviewer = new Map<string, number>()

        // 统计每个审核人的节点数量
        for (const node of this.workflowNodes) {
          if (node.timePointId === timePointId) {
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
        const cellWidth = calculateCellWidth(maxNodesPerReviewer, DEFAULT_CONFIG.cellWidth)

        // 更新当前X坐标
        currentX += cellWidth
      }
    }
  }

  /**
   * 创建网格纹理
   */
  private createGridTexture(): THREE.Texture {
    const gridSize = 2048 // 高分辨率纹理
    const gridCanvas = document.createElement('canvas')
    gridCanvas.width = gridSize
    gridCanvas.height = gridSize

    const gridCtx = gridCanvas.getContext('2d')

    if (!gridCtx) {
      return new THREE.Texture()
    }

    // 深空主题渐变背景
    const gradient = gridCtx.createLinearGradient(0, 0, 0, gridSize)
    gradient.addColorStop(0, '#1a1f3a') // 头部组件渐变中间色
    gradient.addColorStop(0.5, '#2d3561') // 头部组件渐变色
    gradient.addColorStop(1, '#0a0e27') // 深空背景色
    gridCtx.fillStyle = gradient
    gridCtx.fillRect(0, 0, gridSize, gridSize)

    // 绘制网格线 - 使用青色调，与主题色协调
    gridCtx.strokeStyle = 'rgba(0, 255, 255, 0.15)' // 青色网格线，低透明度
    gridCtx.lineWidth = 1

    // 水平网格线
    const cellHeight = gridSize / 10
    for (let y = 0; y <= gridSize; y += cellHeight) {
      gridCtx.beginPath()
      gridCtx.moveTo(0, y)
      gridCtx.lineTo(gridSize, y)
      gridCtx.stroke()
    }

    // 垂直网格线
    const cellWidth = gridSize / 10
    for (let x = 0; x <= gridSize; x += cellWidth) {
      gridCtx.beginPath()
      gridCtx.moveTo(x, 0)
      gridCtx.lineTo(x, gridSize)
      gridCtx.stroke()
    }

    // 添加主要网格线 - 更亮的青色
    gridCtx.strokeStyle = 'rgba(0, 255, 255, 0.25)'
    gridCtx.lineWidth = 2

    // 主要水平线（每5个单元格）
    for (let y = 0; y <= gridSize; y += cellHeight * 5) {
      gridCtx.beginPath()
      gridCtx.moveTo(0, y)
      gridCtx.lineTo(gridSize, y)
      gridCtx.stroke()
    }

    // 主要垂直线（每5个单元格）
    for (let x = 0; x <= gridSize; x += cellWidth * 5) {
      gridCtx.beginPath()
      gridCtx.moveTo(x, 0)
      gridCtx.lineTo(x, gridSize)
      gridCtx.stroke()
    }

    // 创建纹理并设置
    const gridTexture = new THREE.CanvasTexture(gridCanvas)
    gridTexture.wrapS = THREE.RepeatWrapping
    gridTexture.wrapT = THREE.RepeatWrapping
    gridTexture.repeat.set(1, 1)

    return gridTexture
  }

  /**
   * 创建工作流节点
   */
  private createWorkflowNodes(): void {
    // 检查是否有节点数据
    if (!this.workflowNodes || this.workflowNodes.length === 0) {
      return
    }

    // 使用节点渲染器的新方法创建节点和连接线
    this.nodeRenderer.createNodesAndConnections(this.workflowNodes)
  }

  /**
   * 处理鼠标点击事件
   */
  private onMouseClick(event: MouseEvent): void {
    // 计算鼠标在标准化设备坐标中的位置
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    // 更新射线投射器
    this.raycaster.setFromCamera(this.mouse, this.camera)

    // 检查射线与节点的交叉
    const intersects = this.raycaster.intersectObjects(this.nodeGroup.children, true)

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object
      const userData = intersectedObject.userData

      // 检查是否点击了工作流节点 - 使用 sequenceInfo.type 判断
      if (
        userData &&
        userData.sequenceInfo?.type === 'node' &&
        userData.nodeId &&
        userData.nodeData
      ) {
        const nodeId = userData.nodeId
        const nodeData = userData.nodeData

        // 调用节点渲染器的点击处理方法
        if (this.nodeRenderer && nodeData) {
          this.nodeRenderer.handleNodeClick(event, nodeId, nodeData, userData)
        }
      }
      // 检查是否点击了连接线标签（状态标签） - 使用现有的 type 字段
      else if (userData && userData.type === 'connectionLabel') {
        const labelData = userData
        const nodeData = labelData.nodeData

        // 查找上一个节点和下一个节点的数据
        const fromNodeData = this.findNodeById(labelData.fromNodeId)
        const toNodeData = this.findNodeById(labelData.toNodeId)

        console.log('点击状态标签:', {
          标签信息: labelData,
          当前连接: `${labelData.fromNodeId} -> ${labelData.toNodeId}`,
          上一个节点: fromNodeData,
          下一个节点: toNodeData,
        })

        // 触发状态标签点击事件，包含上一个和下一个节点信息
        const clickEvent = new CustomEvent('workflow-status-label-click', {
          detail: {
            labelData,
            nodeData,
            fromNodeData, // 上一个节点数据
            toNodeData, // 下一个节点数据
            connectionInfo: {
              from: labelData.fromNodeId,
              to: labelData.toNodeId,
              status: labelData.status,
            },
            originalEvent: event,
          },
        })
        document.dispatchEvent(clickEvent)
      }
      // 检查是否点击了连接线或箭头 - 使用 sequenceInfo.type 判断
      else if (userData && userData.sequenceInfo?.type === 'connection') {
        console.log('点击了连接线:', userData)
        // 可以在这里添加连接线点击的处理逻辑
      }
    }
  }

  /**
   * 根据节点ID查找节点数据
   * @param nodeId 节点ID
   * @returns 节点数据或undefined
   */
  private findNodeById(nodeId: string): WorkflowNode | undefined {
    return this.workflowNodes.find((node) => node.id === nodeId)
  }

  /**
   * 窗口大小变化事件处理
   */
  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.cssRenderer.setSize(window.innerWidth, window.innerHeight)
  }

  /**
   * 开始渲染循环
   */
  private startRenderLoop(): void {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate)
      this.controls.update()
      this.renderer.render(this.scene, this.camera)
      this.cssRenderer.render(this.scene, this.camera)
    }

    animate()
  }

  /**
   * 获取场景信息
   */
  getSceneInfo() {
    return {
      reviewerCount: this.reviewers.length,
      timePointCount: this.timePoints.length,
      nodeCount: this.workflowNodes.length,
      passCount: this.workflowNodes.filter((n) => n.status === 'pass').length,
      rejectCount: this.workflowNodes.filter((n) => n.status === 'reject').length,
      pendingCount: this.workflowNodes.filter((n) => n.status === 'pending').length,
    }
  }

  /**
   * 获取场景对象
   */
  getScene(): THREE.Scene {
    return this.scene
  }

  /**
   * 获取场景宽度
   */
  getSceneWidth(): number {
    // 初始宽度为左侧固定区域宽度
    let totalWidth = DEFAULT_CONFIG.leftOffset

    // 遍历所有时间点
    for (const timePoint of this.timePoints) {
      const nodeCountPerReviewer = new Map<string, number>()

      // 统计每个审核人的节点数量
      for (const node of this.workflowNodes) {
        if (node.timePointId === timePoint.id) {
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
      const cellWidth = calculateCellWidth(maxNodesPerReviewer, DEFAULT_CONFIG.cellWidth)

      // 累加到总宽度
      totalWidth += cellWidth
    }

    return totalWidth
  }

  /**
   * 获取场景深度
   */
  getSceneDepth(): number {
    return this.reviewers.length * DEFAULT_CONFIG.reviewRowHeight
  }
  /**
   * 获取相机对象
   */
  getCamera(): THREE.PerspectiveCamera {
    return this.camera
  }

  /**
   * 获取控制器对象
   */
  getControls(): OrbitControls {
    return this.controls
  }

  /**
   * 清理资源
   */
  dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }

    // 移除事件监听器
    this.renderer.domElement.removeEventListener('click', this.boundMouseClick)
    window.removeEventListener('resize', this.boundWindowResize)

    // 清理Three.js资源
    this.controls.dispose()
    this.scene.clear()
    this.renderer.dispose()

    // 移除DOM元素
    if (this.config.container.contains(this.renderer.domElement)) {
      this.config.container.removeChild(this.renderer.domElement)
    }
    if (this.config.cssContainer.contains(this.cssRenderer.domElement)) {
      this.config.cssContainer.removeChild(this.cssRenderer.domElement)
    }
  }

  /**
   * 创建简单的环境贴图
   * 用于增强金属材质的反射效果
   */
  private createSimpleEnvMap(): THREE.Texture {
    // 创建一个简单的渐变环境贴图
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return new THREE.Texture()
    }

    // 创建深空主题渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, size)
    gradient.addColorStop(0, '#0a0e27') // 深空背景色
    gradient.addColorStop(0.3, '#1a1f3a') // 头部组件渐变中间色
    gradient.addColorStop(0.7, '#2d3561') // 头部组件渐变色
    gradient.addColorStop(1, '#0a0e27') // 深空背景色

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)

    // 添加青色光源点，增强科技感
    ctx.fillStyle = 'rgba(0, 255, 255, 0.6)'
    ctx.beginPath()
    ctx.arc(size * 0.8, size * 0.2, size * 0.08, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'rgba(0, 255, 128, 0.4)'
    ctx.beginPath()
    ctx.arc(size * 0.2, size * 0.7, size * 0.06, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.beginPath()
    ctx.arc(size * 0.1, size * 0.1, size * 0.04, 0, Math.PI * 2)
    ctx.fill()

    // 创建纹理
    const texture = new THREE.CanvasTexture(canvas)
    texture.mapping = THREE.EquirectangularReflectionMapping

    return texture
  }

  /**
   * 获取节点渲染器实例
   */
  getNodeRenderer(): WorkflowNodeRenderer {
    return this.nodeRenderer
  }

  /**
   * 切换视角
   * @param viewType 视角类型
   */
  changeViewpoint(viewType: 'default' | 'top' | 'side' | 'front'): void {
    // 获取场景尺寸
    const sceneWidth = this.getSceneWidth()
    const sceneDepth = this.getSceneDepth()

    // 设置目标点为场景中心
    const targetX = sceneWidth / 2
    const targetY = 0
    const targetZ = sceneDepth / 2

    this.controls.target.set(targetX, targetY, targetZ)

    // 强制使用顶视图，忽略传入的视角类型
    this.camera.position.set(targetX, 800, targetZ)

    // 禁用旋转，只允许平移
    this.controls.enableRotate = false

    // 更新控制器
    this.controls.update()
  }

  private drawReviewerInfo(ctx: CanvasRenderingContext2D, width: number, depth: number): void {
    // 使用更大的字体和更好的渲染设置
    ctx.font = 'bold 20px Microsoft YaHei'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    this.reviewers.forEach((reviewer, index) => {
      const x = DEFAULT_CONFIG.reviewerColumnWidth / 2
      const y = (index + 0.5) * DEFAULT_CONFIG.reviewRowHeight

      // 绘制更大的背景卡片
      const cardWidth = DEFAULT_CONFIG.reviewerColumnWidth - 10
      const cardHeight = 50
      const cardX = x - cardWidth / 2
      const cardY = y - cardHeight / 2

      // 更明显的卡片背景
      const cardGradient = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardHeight)
      cardGradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)')
      cardGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.2)')
      cardGradient.addColorStop(1, 'rgba(0, 255, 255, 0.1)')
      ctx.fillStyle = cardGradient
      ctx.fillRect(cardX, cardY, cardWidth, cardHeight)

      // 更明显的卡片边框
      ctx.strokeStyle = '#00ffff'
      ctx.lineWidth = 2
      ctx.strokeRect(cardX, cardY, cardWidth, cardHeight)

      // 添加内部高光效果
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 1
      ctx.strokeRect(cardX + 1, cardY + 1, cardWidth - 2, cardHeight - 2)

      // 绘制更明显的文字阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'
      ctx.fillText(reviewer.name, x + 2, y + 2)

      // 绘制主文字 - 使用更亮的颜色
      ctx.fillStyle = '#ffffff'
      ctx.fillText(reviewer.name, x, y)

      // 添加文字发光效果
      ctx.shadowColor = '#00ffff'
      ctx.shadowBlur = 8
      ctx.fillStyle = '#00ffff'
      ctx.fillText(reviewer.name, x, y)

      // 重置阴影
      ctx.shadowBlur = 0

      // 添加更大的状态指示器
      ctx.fillStyle = '#00ff80'
      ctx.beginPath()
      ctx.arc(cardX + 20, y, 5, 0, Math.PI * 2)
      ctx.fill()

      // 指示器边框
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1
      ctx.stroke()
    })
  }

  private drawFileStatusInfo(ctx: CanvasRenderingContext2D, width: number, depth: number): void {
    // 使用更大的字体
    ctx.font = 'bold 18px Microsoft YaHei'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // 在文件上传区域显示状态信息
    const fileAreaX = DEFAULT_CONFIG.reviewerColumnWidth + DEFAULT_CONFIG.fileUploadColumnWidth / 2
    const fileAreaY = depth / 2

    // 绘制文件状态区域标题
    const cardWidth = DEFAULT_CONFIG.fileUploadColumnWidth - 20
    const cardHeight = 60
    const cardX = fileAreaX - cardWidth / 2
    const cardY = fileAreaY - cardHeight / 2

    // 绘制卡片背景
    const cardGradient = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardHeight)
    cardGradient.addColorStop(0, 'rgba(255, 51, 102, 0.3)')
    cardGradient.addColorStop(0.5, 'rgba(255, 51, 102, 0.2)')
    cardGradient.addColorStop(1, 'rgba(255, 51, 102, 0.1)')
    ctx.fillStyle = cardGradient
    ctx.fillRect(cardX, cardY, cardWidth, cardHeight)

    // 绘制卡片边框
    ctx.strokeStyle = '#ff3366'
    ctx.lineWidth = 2
    ctx.strokeRect(cardX, cardY, cardWidth, cardHeight)

    // 添加内部高光
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 1
    ctx.strokeRect(cardX + 1, cardY + 1, cardWidth - 2, cardHeight - 2)

    // 绘制文字阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'
    ctx.fillText('文件状态', fileAreaX + 2, fileAreaY + 2)

    // 绘制主文字
    ctx.fillStyle = '#ffffff'
    ctx.fillText('文件状态', fileAreaX, fileAreaY)

    // 添加文字发光效果
    ctx.shadowColor = '#ff3366'
    ctx.shadowBlur = 6
    ctx.fillStyle = '#ff3366'
    ctx.fillText('文件状态', fileAreaX, fileAreaY)

    // 重置阴影
    ctx.shadowBlur = 0

    // 添加状态图标 - 警告图标
    const iconSize = 8
    const iconX = cardX + cardWidth - 15
    const iconY = cardY + 15

    // 绘制警告三角形
    ctx.strokeStyle = '#ff3366'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(iconX, iconY - iconSize)
    ctx.lineTo(iconX - iconSize, iconY + iconSize)
    ctx.lineTo(iconX + iconSize, iconY + iconSize)
    ctx.closePath()
    ctx.stroke()

    // 绘制感叹号
    ctx.fillStyle = '#ff3366'
    ctx.fillRect(iconX - 1, iconY - 3, 2, 4)
    ctx.fillRect(iconX - 1, iconY + 3, 2, 2)
  }
}
/**
 * 工作流程图Hook
 */
export default function useThreeWorkflow1() {
  const workflowScene = shallowRef<WorkflowScene | null>(null)
  const isLoading = ref(false) // 添加加载状态

  /**
   * 初始化场景
   * @param container 容器元素
   * @param cssContainer CSS容器元素
   * @param data 工作流数据
   */
  const initialize = (
    container: HTMLElement,
    cssContainer: HTMLElement,
    data: {
      reviewers: Reviewer[]
      timePoints: TimePoint[]
      workflowNodes: WorkflowNode[]
    },
  ) => {
    // 如果已存在场景实例，先清理
    if (workflowScene.value) {
      cleanup()
    }

    // 创建新的场景实例，并传入数据
    workflowScene.value = new WorkflowScene({ container, cssContainer }, data)
  }

  /**
   * 清理场景
   */
  const cleanup = () => {
    if (workflowScene.value) {
      workflowScene.value.dispose()
      workflowScene.value = null
    }
  }

  /**
   * 获取场景信息
   */
  const getSceneInfo = () => {
    if (workflowScene.value) {
      return workflowScene.value.getSceneInfo()
    }
    return { reviewerCount: 0, timePointCount: 0, nodeCount: 0 }
  }

  /**
   * 切换视角
   * @param viewType 视角类型
   */
  const changeViewpoint = (viewType: 'default' | 'top' | 'side' | 'front') => {
    if (workflowScene.value) {
      workflowScene.value.changeViewpoint(viewType)
    }
  }

  const getNodeRenderer = () => {
    if (workflowScene.value) {
      return workflowScene.value.getNodeRenderer()
    }
    return null
  }

  /**
   * 切换旋转限制
   * @returns 切换后的限制状态，true表示有限制，false表示无限制
   */
  const toggleRotationLimits = (): boolean => {
    if (workflowScene.value) {
      return workflowScene.value.toggleRotationLimits()
    }
    return true
  }

  /**
   * 设置旋转限制状态
   * @param limited 是否限制旋转
   */
  const setRotationLimits = (limited: boolean): void => {
    if (workflowScene.value) {
      workflowScene.value.setRotationLimits(limited)
    }
  }

  /**
   * 获取当前旋转限制状态
   * @returns 当前旋转限制状态，true表示有限制，false表示无限制
   */
  const getRotationLimitState = (): boolean => {
    if (workflowScene.value) {
      return workflowScene.value.getRotationLimitState()
    }
    return true
  }

  return {
    initialize,
    cleanup,
    getSceneInfo,
    changeViewpoint,
    getNodeRenderer,
    toggleRotationLimits, // 添加切换旋转限制的方法
    setRotationLimits, // 添加设置旋转限制的方法
    getRotationLimitState, // 添加获取旋转限制状态的方法
    isLoading, // 暴露加载状态
  }
}
