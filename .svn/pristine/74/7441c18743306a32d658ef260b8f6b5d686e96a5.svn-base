import { ref, shallowRef } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import useMockData from './useMockData'
import type { WorkflowRecord } from './useMockData'

// 场景配置接口
interface SceneConfig {
  container: HTMLElement
  cssContainer: HTMLElement
}

// 默认配置
const DEFAULT_CONFIG = {
  backgroundColor: 0x0c1e3a,  // 深蓝色背景
  cellWidth: 200,             // 单元格宽度
  cellHeight: 50,             // 单元格高度（改回原来的值）
  timelineHeight: 40,         // 时间轴高度
  leftOffset: 400,            // 左侧偏移（2个单元格）
  reviewAreaDepth: 400,       // 审核区域深度
  timelineBarColor: 0x1a3a7a, // 时间轴长方体颜色
  reviewRowHeight: 100        // 审核区域行高（所有行都使用cellHeight的2倍）
}

/**
 * 解析日期字符串为日期对象
 * @param dateStr 格式为 "YYYY-MM-DD" 的日期字符串
 */
function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * 格式化日期对象为字符串
 * @param date 日期对象
 * @returns 格式为 "YYYY-MM-DD" 的日期字符串
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 计算两个日期之间的间隔期间
 * @param startDateStr 开始日期字符串
 * @param endDateStr 结束日期字符串
 * @returns 格式化的间隔期间字符串
 */
function calculateDateInterval(startDateStr: string, endDateStr: string): string {
  // 解析日期
  const startDate = parseDate(startDateStr);
  const endDate = parseDate(endDateStr);

  // 如果开始日期和结束日期相同，返回单一日期
  if (startDateStr === endDateStr) {
    return startDateStr;
  }

  // 计算开始日期的后一天
  const nextDay = new Date(startDate);
  nextDay.setDate(nextDay.getDate() + 1);

  // 计算结束日期的前一天
  const prevDay = new Date(endDate);
  prevDay.setDate(prevDay.getDate() - 1);

  // 如果开始日期的后一天超过了结束日期的前一天，则返回原始区间
  if (nextDay > prevDay) {
    return `${startDateStr}-${endDateStr}`;
  }

  return `${formatDate(nextDay)}-${formatDate(prevDay)}`;
}

/**
 * 生成所有操作之间的时间间隔点
 * @param workflowRecords 工作流记录数组
 * @returns 时间点数组，包括操作时间和间隔时间
 */
function generateTimeIntervals(workflowRecords: WorkflowRecord[]): {date: string, label: string, isInterval: boolean}[] {
  if (!workflowRecords || workflowRecords.length === 0) {
    return [];
  }

  // 收集所有操作时间点
  const allDates = new Set<string>();
  workflowRecords.forEach(record => {
    allDates.add(record.startTime);
    allDates.add(record.endTime);
  });

  // 排序时间点
  const sortedDates = Array.from(allDates).sort();

  // 生成结果数组
  const result: {date: string, label: string, isInterval: boolean}[] = [];

  // 添加所有操作时间点
  sortedDates.forEach(date => {
    // 将日期格式化为更友好的显示格式：月份-日期
    const dateObj = new Date(date);
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const formattedDate = `${month}月${day}日`;

    result.push({
      date,
      label: formattedDate,
      isInterval: false
    });
  });

  // 添加操作之间的间隔
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const currentDate = parseDate(sortedDates[i]);
    const nextDate = parseDate(sortedDates[i + 1]);

    // 如果两个日期不相邻，添加间隔
    const oneDayInMs = 24 * 60 * 60 * 1000;
    if (nextDate.getTime() - currentDate.getTime() > oneDayInMs) {
      const intervalDates = calculateDateInterval(sortedDates[i], sortedDates[i + 1]);

      // 计算日期范围的友好显示形式
      const startObj = new Date(parseDate(sortedDates[i]));
      startObj.setDate(startObj.getDate() + 1); // 后一天
      const startMonth = startObj.getMonth() + 1;
      const startDay = startObj.getDate();

      const endObj = new Date(parseDate(sortedDates[i + 1]));
      endObj.setDate(endObj.getDate() - 1); // 前一天
      const endMonth = endObj.getMonth() + 1;
      const endDay = endObj.getDate();

      const intervalLabel = `${startMonth}月${startDay}日-${endMonth}月${endDay}日`;

      result.push({
        date: `interval_${i}`, // 使用唯一标识符
        label: intervalLabel,
        isInterval: true
      });
    }
  }

  // 按日期排序（间隔放在对应的位置）
  result.sort((a, b) => {
    if (a.isInterval && !b.isInterval) {
      // 找到a对应的前一个日期
      const intervalIndex = parseInt(a.date.split('_')[1]);
      return parseDate(sortedDates[intervalIndex]).getTime() - parseDate(b.date).getTime() + 1; // 确保间隔在正确日期后面
    }
    if (!a.isInterval && b.isInterval) {
      // 找到b对应的前一个日期
      const intervalIndex = parseInt(b.date.split('_')[1]);
      return parseDate(a.date).getTime() - parseDate(sortedDates[intervalIndex]).getTime() - 1;
    }
    if (!a.isInterval && !b.isInterval) {
      return parseDate(a.date).getTime() - parseDate(b.date).getTime();
    }
    return 0;
  });

  return result;
}

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

  // 数据相关
  private mockData = useMockData()
  private timeIntervals: {date: string, label: string, isInterval: boolean}[] = []
  private timePoints = this.mockData.getTimePoints()
  private reviewers = this.mockData.reviewers.value
  private workflowRecords = this.mockData.workflowRecords.value

  // 事件处理
  private raycaster: THREE.Raycaster
  private mouse: THREE.Vector2
  private boundMouseClick: (event: MouseEvent) => void
  private boundWindowResize: () => void

  constructor(config: SceneConfig) {
    this.config = config

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
    this.timeIntervals = generateTimeIntervals(this.workflowRecords);

    // 初始化场景
    this.init()
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
    // 计算场景尺寸
    const sceneWidth = this.timeIntervals.length * DEFAULT_CONFIG.cellWidth + DEFAULT_CONFIG.leftOffset
    const totalRows = this.reviewers.length;
    const sceneDepth = totalRows * DEFAULT_CONFIG.reviewRowHeight;

    // 设置相机位置 - 从上方俯视
    this.camera.position.set(sceneWidth / 2, 500, sceneDepth + 300)
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
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.minDistance = 200
    this.controls.maxDistance = 2000
    this.controls.maxPolarAngle = Math.PI / 2 - 0.1 // 限制不要完全水平视角
    this.controls.minPolarAngle = 0.1 // 限制不要完全垂直视角
    this.controls.enablePan = true
    this.controls.enableZoom = true
    this.controls.enableRotate = true

    // 设置初始视角
    this.controls.update()
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
    // 环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    this.scene.add(ambientLight)

    // 方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(500, 500, 200)
    directionalLight.castShadow = true
    this.scene.add(directionalLight)
  }

  /**
   * 创建工作流布局
   */
  private createWorkflowLayout(): void {
    // 计算场景尺寸
    const sceneWidth = this.timeIntervals.length * DEFAULT_CONFIG.cellWidth + DEFAULT_CONFIG.leftOffset
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
    // 创建时间轴长方体几何体
    const timelineGeometry = new THREE.BoxGeometry(width, DEFAULT_CONFIG.timelineHeight, DEFAULT_CONFIG.reviewRowHeight)

    // 创建时间轴贴图
    const timelineTexture = this.createTimelineTexture()

    // 创建材质数组 - 为每个面指定不同材质
    const materials = [
      new THREE.MeshStandardMaterial({ color: DEFAULT_CONFIG.timelineBarColor, metalness: 0.7, roughness: 0.3 }), // 右
      new THREE.MeshStandardMaterial({ color: DEFAULT_CONFIG.timelineBarColor, metalness: 0.7, roughness: 0.3 }), // 左
      new THREE.MeshStandardMaterial({ map: timelineTexture, roughness: 0.3, metalness: 0.6 }), // 顶部 - 使用贴图
      new THREE.MeshStandardMaterial({ color: DEFAULT_CONFIG.timelineBarColor, metalness: 0.7, roughness: 0.3 }), // 底
      new THREE.MeshStandardMaterial({ color: DEFAULT_CONFIG.timelineBarColor, metalness: 0.7, roughness: 0.3 }), // 前
      new THREE.MeshStandardMaterial({ color: DEFAULT_CONFIG.timelineBarColor, metalness: 0.7, roughness: 0.3 })  // 后
    ]

    // 创建时间轴长方体
    this.timelineBar = new THREE.Mesh(timelineGeometry, materials)

    // 设置位置 - 在审核区域上方
    this.timelineBar.position.set(
      width / 2,  // X轴居中
      DEFAULT_CONFIG.timelineHeight / 2,  // Y轴上浮一半高度
      DEFAULT_CONFIG.reviewRowHeight / 2  // Z轴对应第一行中心
    )

    this.timelineBar.castShadow = true
    this.timelineBar.receiveShadow = true

    this.scene.add(this.timelineBar)
  }

  /**
   * 创建审核区域平面
   */
  private createReviewArea(width: number, depth: number): void {
    const totalRows = this.reviewers.length;

    // 计算调整后的深度
    // 注意：所有行都使用reviewRowHeight（cellHeight的2倍）
    const adjustedDepth = totalRows * DEFAULT_CONFIG.reviewRowHeight;

    // 创建审核区域平面几何体
    const reviewAreaGeometry = new THREE.PlaneGeometry(width, adjustedDepth)

    // 创建网格纹理
    const gridTexture = this.createGridTexture()

    // 创建审核区域平面材质
    const reviewAreaMaterial = new THREE.MeshStandardMaterial({
      map: gridTexture,
      color: 0x3a5787,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
      metalness: 0.3,
      roughness: 0.7
    })

    // 创建审核区域平面
    this.reviewArea = new THREE.Mesh(reviewAreaGeometry, reviewAreaMaterial)

    // 设置位置和旋转 - 水平放置
    this.reviewArea.rotation.x = -Math.PI / 2
    this.reviewArea.position.set(
      width / 2,                         // X轴居中
      -1,                                // Y轴略微下沉1个单位，避免Z-fighting
      adjustedDepth / 2 + DEFAULT_CONFIG.reviewRowHeight  // Z轴居中，向后偏移一个行高，避免与时间轴重叠
    )

    this.reviewArea.receiveShadow = true

    this.scene.add(this.reviewArea)

    // 添加左侧分隔线
    this.createDividerLine(width, adjustedDepth)

    // 添加网格线
    this.createGridLines(width, adjustedDepth)
  }

  /**
   * 创建左侧分隔线
   */
  private createDividerLine(width: number, depth: number): void {
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x55aaff })

    // 计算分隔线位置 - 在左侧区域的右边界
    const dividerX = DEFAULT_CONFIG.leftOffset

    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(dividerX, 0, DEFAULT_CONFIG.reviewRowHeight), // 从时间轴底部开始
      new THREE.Vector3(dividerX, 0, depth + DEFAULT_CONFIG.reviewRowHeight)
    ])

    const dividerLine = new THREE.Line(lineGeometry, lineMaterial)
    this.scene.add(dividerLine)
  }

  /**
   * 创建审核人标签
   */
  private createReviewerLabels(): void {
    this.reviewers.forEach((reviewer, index) => {
      // 第一列显示审核人
      const x = DEFAULT_CONFIG.cellWidth / 2
      const y = 5

      // 计算Z位置 - 所有行都使用相同的高度，并且从时间轴底部开始
      // 行高的一半 + 已经过的行数 * 行高 + 时间轴高度
      const z = DEFAULT_CONFIG.reviewRowHeight / 2 + index * DEFAULT_CONFIG.reviewRowHeight + DEFAULT_CONFIG.reviewRowHeight;

      // 创建审核人标签
      const labelDiv = document.createElement('div')
      labelDiv.className = 'reviewer-label'
      labelDiv.style.cssText = `
        background: rgba(50, 50, 80, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-family: 'Microsoft YaHei', sans-serif;
        font-size: 14px;
        font-weight: bold;
        text-align: center;
        border: 1px solid #666;
        min-width: 80px;
        pointer-events: none;
      `
      labelDiv.textContent = reviewer.name

      const label = new CSS2DObject(labelDiv)
      label.position.set(x, y, z)
      this.reviewerLabels.add(label)

      // 如果是第一行，添加"未上传文件"标签在第二列
      if (index === 0) {
        const notUploadedX = DEFAULT_CONFIG.cellWidth + DEFAULT_CONFIG.cellWidth / 2

        const notUploadedDiv = document.createElement('div')
        notUploadedDiv.className = 'not-uploaded-label'
        notUploadedDiv.style.cssText = `
          background: rgba(80, 50, 50, 0.9);
          color: #ffcccc;
          padding: 8px 12px;
          border-radius: 4px;
          font-family: 'Microsoft YaHei', sans-serif;
          font-size: 14px;
          text-align: center;
          border: 1px solid #996666;
          min-width: 80px;
          pointer-events: none;
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
   */
  private createTimelineTexture(): THREE.Texture {
    // 创建画布
    const canvas = document.createElement('canvas')
    const totalWidth = this.timeIntervals.length * DEFAULT_CONFIG.cellWidth + DEFAULT_CONFIG.leftOffset
    const canvasHeight = DEFAULT_CONFIG.cellHeight

    canvas.width = totalWidth
    canvas.height = canvasHeight

    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return new THREE.Texture()
    }

    // 绘制背景
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#2c4470')
    gradient.addColorStop(1, '#1e3055')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制顶部亮线
    ctx.strokeStyle = '#3a9adf'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(canvas.width, 0)
    ctx.stroke()

    // 绘制底部分隔线
    ctx.strokeStyle = '#3a9adf'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, canvas.height)
    ctx.lineTo(canvas.width, canvas.height)
    ctx.stroke()

    // 绘制左侧分隔线
    ctx.strokeStyle = '#3a9adf'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(DEFAULT_CONFIG.leftOffset, 0)
    ctx.lineTo(DEFAULT_CONFIG.leftOffset, canvas.height)
    ctx.stroke()

    // 绘制左侧区域标题
    ctx.font = 'bold 18px Microsoft YaHei'
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('审核人员', DEFAULT_CONFIG.leftOffset / 2, canvasHeight / 2)

    // 使用timeIntervals作为日期数据源
    const timeIntervals = this.timeIntervals;

    // 绘制日期单元格
    for (let i = 0; i < timeIntervals.length; i++) {
      const x = DEFAULT_CONFIG.leftOffset + i * DEFAULT_CONFIG.cellWidth
      const timeInterval = timeIntervals[i]
      const cellWidth = DEFAULT_CONFIG.cellWidth

      // 为交替的单元格使用不同的背景色
      // 间隔期间使用灰色背景
      const cellColor = timeInterval.isInterval
        ? 'rgba(120, 120, 120, 0.3)'
        : (i % 2 === 0 ? 'rgba(40, 80, 160, 0.3)' : 'rgba(30, 60, 120, 0.3)');

      ctx.fillStyle = cellColor
      ctx.fillRect(x, 0, cellWidth, canvasHeight)

      // 绘制单元格边框
      ctx.strokeStyle = '#1a5ad1'
      ctx.lineWidth = 1
      ctx.strokeRect(x, 0, cellWidth, canvasHeight)

      const cellCenterX = x + cellWidth / 2

      // 绘制日期文本 (居中显示)
      ctx.font = 'bold 14px Microsoft YaHei'
      ctx.fillStyle = timeInterval.isInterval ? '#cccccc' : '#ffffff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(timeInterval.label, cellCenterX, canvasHeight / 2)
    }

    // 创建纹理
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true

    return texture
  }

  /**
   * 获取时间间隔的真实X位置
   */
  private getTimeIntervalPosition(timeInterval: {date: string, label: string, isInterval: boolean}, index: number): number {
    return DEFAULT_CONFIG.leftOffset + index * DEFAULT_CONFIG.cellWidth;
  }

  /**
   * 创建网格线
   */
  private createGridLines(width: number, depth: number): void {
    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x335577, transparent: true, opacity: 0.4 })

    // 水平网格线 - 对应审核人行，所有行使用相同高度
    let linePositions: number[] = [];

    // 第一行的顶部边界（从时间轴底部开始）
    linePositions.push(DEFAULT_CONFIG.reviewRowHeight);

    // 审核人行的分隔线
    for (let i = 0; i < this.reviewers.length; i++) {
      linePositions.push(DEFAULT_CONFIG.reviewRowHeight + (i + 1) * DEFAULT_CONFIG.reviewRowHeight);
    }

    // 绘制水平线
    linePositions.forEach(z => {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, z),
        new THREE.Vector3(width, 0, z)
      ]);

      const line = new THREE.Line(lineGeometry, gridMaterial);
      this.scene.add(line);
    });

    // 垂直网格线
    // 绘制左侧区域的网格线
    for (let i = 0; i <= 2; i++) {
      const x = i * DEFAULT_CONFIG.cellWidth;

      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, 0, DEFAULT_CONFIG.reviewRowHeight), // 从时间轴底部开始
        new THREE.Vector3(x, 0, depth + DEFAULT_CONFIG.reviewRowHeight)
      ]);

      const line = new THREE.Line(lineGeometry, gridMaterial);
      this.scene.add(line);
    }

    // 绘制时间区域的网格线，包括所有时间间隔点
    for (let i = 0; i < this.timeIntervals.length; i++) {
      const x = this.getTimeIntervalPosition(this.timeIntervals[i], i);

      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, 0, DEFAULT_CONFIG.reviewRowHeight), // 从时间轴底部开始
        new THREE.Vector3(x, 0, depth + DEFAULT_CONFIG.reviewRowHeight)
      ]);

      const line = new THREE.Line(lineGeometry, gridMaterial);
      this.scene.add(line);
    }

    // 添加最后一个垂直线
    const lastX = this.getTimeIntervalPosition(this.timeIntervals[this.timeIntervals.length - 1], this.timeIntervals.length);
    const lastLineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(lastX, 0, DEFAULT_CONFIG.reviewRowHeight), // 从时间轴底部开始
      new THREE.Vector3(lastX, 0, depth + DEFAULT_CONFIG.reviewRowHeight)
    ]);

    const lastLine = new THREE.Line(lastLineGeometry, gridMaterial);
    this.scene.add(lastLine);
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

    // 蓝色渐变背景
    const gradient = gridCtx.createLinearGradient(0, 0, 0, gridSize)
    gradient.addColorStop(0, '#2c4470')
    gradient.addColorStop(1, '#1e3055')
    gridCtx.fillStyle = gradient
    gridCtx.fillRect(0, 0, gridSize, gridSize)

    // 绘制网格线
    gridCtx.strokeStyle = 'rgba(83, 122, 188, 0.3)'
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
    if (!this.workflowRecords || this.workflowRecords.length === 0) {
      return
    }

    this.workflowRecords.forEach(record => {
      // 获取开始和结束时间在timeIntervals中的索引
      const startTimeIndex = this.timeIntervals.findIndex(t => !t.isInterval && t.date === record.startTime);
      const endTimeIndex = this.timeIntervals.findIndex(t => !t.isInterval && t.date === record.endTime);

      if (startTimeIndex === -1 || endTimeIndex === -1) {
        return // 跳过无效的时间点
      }

      // 查找实际的位置索引，考虑中间的间隔
      const startX = this.getTimeIntervalPosition(this.timeIntervals[startTimeIndex], startTimeIndex);

      // 结束索引可能是下一个实际时间点，所以需要找到对应的结束X位置
      const endX = this.getTimeIntervalPosition(this.timeIntervals[endTimeIndex], endTimeIndex) + DEFAULT_CONFIG.cellWidth;

      const width = endX - startX;

      // 计算节点的Y位置（高度）
      const y = 3 // 略高于审核区域，贴合时间轴

      // 计算节点的Z位置（对应审核人）
      const position = record.fromReviewer.position;
      // 所有行都使用相同的高度计算方式，并且从时间轴底部开始
      const fromZ = DEFAULT_CONFIG.reviewRowHeight / 2 + position * DEFAULT_CONFIG.reviewRowHeight + DEFAULT_CONFIG.reviewRowHeight;

      // 创建节点几何体 - 所有行使用相同高度
      const nodeHeight = DEFAULT_CONFIG.reviewRowHeight * 0.7; // 节点高度为行高的70%

      // 创建节点几何体
      const nodeGeometry = new THREE.BoxGeometry(width, 6, nodeHeight);

      // 根据状态和流程类型设置颜色
      let nodeColor = 0x4caf50 // 默认绿色（通过）

      if (record.status === 'reject') {
        nodeColor = 0xf44336 // 红色（驳回）
      } else if (record.flowType === 'retry') {
        nodeColor = 0xffc107 // 黄色（重试流程）
      }

      // 创建节点材质
      const nodeMaterial = new THREE.MeshStandardMaterial({
        color: nodeColor,
        metalness: 0.3,
        roughness: 0.5,
        transparent: true,
        opacity: 0.85
      })

      // 创建节点网格
      const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial)

      // 设置节点位置
      nodeMesh.position.set(
        startX + width / 2, // X轴居中
        y,                  // Y轴略高于审核区域
        fromZ               // Z轴对应审核人位置
      )

      // 设置节点的用户数据（用于点击交互）
      nodeMesh.userData = {
        type: 'workflowNode',
        record: record
      }

      // 添加到场景
      this.nodeGroup.add(nodeMesh)

      // 添加节点标签
      this.createNodeLabel(record, startX + width / 2, y + 10, fromZ)

      // 如果是主流程且状态为通过，添加连接线
      if (record.flowType === 'main' && record.status === 'pass') {
        this.createConnectionLine(record, startX + width, y, fromZ)
      }
    })
  }

  /**
   * 创建节点标签
   */
  private createNodeLabel(record: WorkflowRecord, x: number, y: number, z: number): void {
    // 创建标签容器
    const labelDiv = document.createElement('div')
    labelDiv.className = 'node-label'
    labelDiv.textContent = record.title

    // 设置样式
    labelDiv.style.cssText = `
      background: rgba(255, 255, 255, 0.9);
      color: #333;
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: normal;
      text-align: center;
      white-space: pre-line;
      max-width: 180px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      pointer-events: none;
    `

    // 创建CSS2D标签
    const nodeLabel = new CSS2DObject(labelDiv)
    nodeLabel.position.set(x, y, z)

    this.scene.add(nodeLabel)
  }

  /**
   * 创建连接线
   */
  private createConnectionLine(record: WorkflowRecord, startX: number, y: number, fromZ: number): void {
    // 计算终点Z坐标（目标审核人位置）
    const toPosition = record.toReviewer.position;
    // 所有行使用相同的高度计算方式，并且从时间轴底部开始
    const toZ = DEFAULT_CONFIG.reviewRowHeight / 2 + toPosition * DEFAULT_CONFIG.reviewRowHeight + DEFAULT_CONFIG.reviewRowHeight;

    // 创建连接线几何体
    const points: THREE.Vector3[] = []
    points.push(new THREE.Vector3(startX, y, fromZ))
    points.push(new THREE.Vector3(startX + 20, y, fromZ))
    points.push(new THREE.Vector3(startX + 20, y, toZ))
    points.push(new THREE.Vector3(startX + 40, y, toZ))

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)

    // 创建连接线材质
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x4caf50,
      linewidth: 2
    })

    // 创建连接线
    const line = new THREE.Line(lineGeometry, lineMaterial)

    // 添加到场景
    this.nodeGroup.add(line)

    // 添加箭头
    this.createArrowHead(startX + 40, y, toZ, 0)
  }

  /**
   * 创建箭头头部
   */
  private createArrowHead(x: number, y: number, z: number, rotation: number): void {
    // 创建箭头几何体
    const arrowGeometry = new THREE.ConeGeometry(5, 10, 8)

    // 创建箭头材质
    const arrowMaterial = new THREE.MeshBasicMaterial({
      color: 0x4caf50
    })

    // 创建箭头网格
    const arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial)

    // 设置箭头位置和旋转
    arrowMesh.position.set(x, y, z)
    arrowMesh.rotation.y = Math.PI / 2 // 旋转90度，使箭头指向右侧

    // 添加到场景
    this.nodeGroup.add(arrowMesh)
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

      // 检查是否点击了工作流节点
      if (intersectedObject.userData && intersectedObject.userData.type === 'workflowNode') {
        const record = intersectedObject.userData.record as WorkflowRecord

        // 显示节点信息
        this.showNodeInfo(record)
      }
    }
  }

  /**
   * 显示节点信息
   */
  private showNodeInfo(record: WorkflowRecord): void {
    // 创建信息面板
    const infoPanel = document.createElement('div')
    infoPanel.className = 'node-info-panel'
    infoPanel.style.position = 'absolute'
    infoPanel.style.top = '10px'
    infoPanel.style.right = '10px'
    infoPanel.style.width = '300px'
    infoPanel.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'
    infoPanel.style.borderRadius = '8px'
    infoPanel.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
    infoPanel.style.padding = '15px'
    infoPanel.style.zIndex = '1000'
    infoPanel.style.fontFamily = 'Arial, sans-serif'
    infoPanel.style.fontSize = '14px'
    infoPanel.style.color = '#333'

    // 设置面板内容
    infoPanel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 style="margin: 0; font-size: 16px;">${record.title}</h3>
        <span class="close-btn" style="cursor: pointer; font-weight: bold; font-size: 18px;">&times;</span>
      </div>
      <div style="margin-bottom: 5px;"><strong>状态：</strong> ${record.status === 'pass' ? '通过' : '驳回'}</div>
      <div style="margin-bottom: 5px;"><strong>流程类型：</strong> ${record.flowType === 'main' ? '主流程' : '重试流程'}</div>
      <div style="margin-bottom: 5px;"><strong>发起人：</strong> ${record.fromReviewer.name}</div>
      <div style="margin-bottom: 5px;"><strong>接收人：</strong> ${record.toReviewer.name}</div>
      <div style="margin-bottom: 5px;"><strong>开始时间：</strong> ${record.startTime}</div>
      <div style="margin-bottom: 5px;"><strong>结束时间：</strong> ${record.endTime}</div>
    `

    // 移除现有的信息面板（如果有）
    const existingPanel = document.querySelector('.node-info-panel')
    if (existingPanel) {
      existingPanel.remove()
    }

    // 添加到DOM
    document.body.appendChild(infoPanel)

    // 添加关闭按钮事件
    const closeBtn = infoPanel.querySelector('.close-btn')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        infoPanel.remove()
      })
    }

    // 自动关闭（10秒后）
    setTimeout(() => {
      if (document.body.contains(infoPanel)) {
        infoPanel.remove()
      }
    }, 10000)
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
      recordCount: this.workflowRecords.length,
      nodeCount: this.nodeGroup.children.length,
      mainFlowCount: this.workflowRecords.filter(r => r.flowType === 'main').length,
      retryFlowCount: this.workflowRecords.filter(r => r.flowType === 'retry').length,
      passCount: this.workflowRecords.filter(r => r.status === 'pass').length,
      rejectCount: this.workflowRecords.filter(r => r.status === 'reject').length
    }
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
}

/**
 * 工作流程图Hook
 */
export default function useThreeWorkflow1() {
  const workflowScene = shallowRef<WorkflowScene>()

  /**
   * 初始化场景
   */
  const initialize = (container: HTMLElement, cssContainer: HTMLElement) => {
    workflowScene.value = new WorkflowScene({
      container,
      cssContainer
    })
  }

  /**
   * 清理场景
   */
  const cleanup = () => {
    if (workflowScene.value) {
      workflowScene.value.dispose()
    }
  }

  /**
   * 获取场景信息
   */
  const getSceneInfo = () => {
    if (!workflowScene.value) {
      return { reviewerCount: 0, timePointCount: 0, recordCount: 0 }
    }
    return workflowScene.value.getSceneInfo()
  }

  return {
    initialize,
    cleanup,
    getSceneInfo
  }
}
