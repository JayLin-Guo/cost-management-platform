import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { ref, onMounted, onUnmounted, shallowRef } from 'vue'
import { useMockData } from './useMockData'
import type { NodeData } from './useMockData'
import { useCalendarScene } from './useCalendarScene'
import { ReviewNode, ReviewNodeStatus, createReviewNode } from './useReviewNode'
import { useNodeManager } from './useNodeManager'

// 选中对象类型
interface SelectedObjectData {
  id?: string
  type?: string
  [key: string]: any
}

export default function useThreeWorkflow() {
  // THREE.js核心对象
  const scene = shallowRef<THREE.Scene | null>(null)
  const camera = shallowRef<THREE.OrthographicCamera | null>(null)
  const renderer = shallowRef<THREE.WebGLRenderer | null>(null)
  const cssRenderer = shallowRef<CSS2DRenderer | null>(null)
  const controls = shallowRef<OrbitControls | null>(null)

  // 动画相关
  let animationFrameId: number | null = null
  const clock = new THREE.Clock() // 添加时钟来控制更新频率

  // 鼠标交互相关
  const raycaster = shallowRef<THREE.Raycaster | null>(null)
  const mouse = shallowRef<THREE.Vector2 | null>(null)

  // 当前选中的对象
  const selectedObject = ref<SelectedObjectData | null>(null)

  // 记录当前高亮的对象（避免重复设置）
  let highlightedObject: THREE.Object3D | null = null

  // 审核节点列表
  const reviewNodes: ReviewNode[] = []

  // 获取节点管理器
  const nodeManager = useNodeManager()

  // 获取模拟数据
  const { reviewers, timeline, nodeTree, dateOptions } = useMockData()

  // 日历场景相关
  const { createCalendarScene } = useCalendarScene()

  // 日历场景引用
  let calendarScene: THREE.Group | null = null

  // 是否按下鼠标中键 (用于控制翻转功能)
  const isMiddleButtonPressed = false

  // 动画路径点和文件图标相关
  const animationPathPoints: THREE.Vector3[] = []
  const animationPathStatus: string[] = []
  let fileIcon: THREE.Object3D | null = null
  let isAnimationPlaying = false
  let animationSpeed = 0.008 // 基础动画速度

  // 瞬移动画状态
  enum TeleportState {
    STAYING = 'staying', // 在节点停留
    MOVING = 'moving', // 沿路径瞬移
  }

  let currentTeleportState = TeleportState.STAYING
  const currentPathIndex = 0 // 当前在路径中的位置索引
  let stayTime = 0 // 停留时间
  let moveTimer = 0 // 移动计时器

  // 路径相关变量
  let pathPoints: THREE.Vector3[] = [] // 完整的路径点数组
  let currentStepIndex = 0 // 当前步骤索引

  /**
   * 初始化THREE.js场景
   */
  function initialize(containerElement: HTMLElement, cssContainerElement: HTMLElement) {
    if (!containerElement || !cssContainerElement) {
      return
    }

    // 创建场景
    scene.value = new THREE.Scene()
    scene.value.background = new THREE.Color(0x0c1e3a)

    // 定义基准计算单位 - 所有尺寸都基于此基准值计算，确保一致性
    const BASE_UNIT = {
      CELL_WIDTH: 140, // 单元格宽度基准值
      CELL_HEIGHT: 60, // 单元格高度基准值
      DEPTH: 400, // 深度基准值
      LEFT_CELLS: 2, // 左侧区域占用单元格数
      MIN_CELLS: 10, // 最小日历单元格数
    }

    // 计算日历尺寸 - 使用基准单位
    const cellWidth = BASE_UNIT.CELL_WIDTH // 单元格宽度
    const leftOffset = BASE_UNIT.CELL_WIDTH * BASE_UNIT.LEFT_CELLS // 左侧区域宽度（正好是两个单元格的宽度）
    const minWidth = BASE_UNIT.CELL_WIDTH * BASE_UNIT.MIN_CELLS // 最小宽度（10个单元格）

    // 计算实际宽度 - 基于单元格数量
    const totalCells = BASE_UNIT.LEFT_CELLS + timeline.value.length // 总单元格数（左侧区域 + 日历单元格）
    const totalWidth = Math.max(minWidth, totalCells * cellWidth) // 总宽度

    // 日历深度/高度
    const calendarDepth = BASE_UNIT.DEPTH

    // 创建正交相机 - 直接使用日历的实际尺寸
    camera.value = new THREE.OrthographicCamera(
      totalWidth / -2, // left
      totalWidth / 2, // right
      calendarDepth / 2, // top
      calendarDepth / -2, // bottom
      0.1, // near
      5000, // far
    )

    // 根据容器大小设置适当的缩放，保持比例
    const scaleX = containerElement.clientWidth / totalWidth
    const scaleY = containerElement.clientHeight / calendarDepth
    const scale = Math.min(scaleX, scaleY) * 0.9 // 留出一些边距

    camera.value.zoom = scale

    // 设置相机位置 - 修改为俯视视角
    camera.value.position.set(0, 500, 0) // 直接从上方俯视
    camera.value.lookAt(0, 0, 0)
    camera.value.updateProjectionMatrix()

    // 创建渲染器 - 启用像素校正
    renderer.value = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      precision: 'highp', // 高精度
      powerPreference: 'high-performance', // 高性能模式
    })
    renderer.value.setSize(containerElement.clientWidth, containerElement.clientHeight)
    renderer.value.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // 限制像素比例以提高性能
    renderer.value.shadowMap.enabled = true
    renderer.value.shadowMap.type = THREE.PCFSoftShadowMap
    containerElement.appendChild(renderer.value.domElement)

    // 创建CSS2D渲染器 - 用于HTML元素
    cssRenderer.value = new CSS2DRenderer()
    cssRenderer.value.setSize(containerElement.clientWidth, containerElement.clientHeight)
    // CSS2DRenderer会创建自己的DOM元素，我们需要将其添加到指定的容器中
    cssRenderer.value.domElement.style.position = 'absolute'
    cssRenderer.value.domElement.style.top = '0'
    cssRenderer.value.domElement.style.pointerEvents = 'none'
    cssContainerElement.appendChild(cssRenderer.value.domElement)

    // 创建控制器 - 限制相机控制
    controls.value = new OrbitControls(camera.value, renderer.value.domElement)

    // 配置控制器
    controls.value.enableDamping = true // 启用阻尼效果
    controls.value.dampingFactor = 0.05 // 阻尼系数
    controls.value.screenSpacePanning = true // 使用屏幕空间平移
    controls.value.panSpeed = 1.0 // 平移速度（增加平移速度）
    controls.value.zoomSpeed = 0.7 // 缩放速度
    controls.value.minZoom = 0.5 // 最小缩放
    controls.value.maxZoom = 2.0 // 最大缩放

    // 重新设置控制键 - 使左键平移
    controls.value.enablePan = true // 启用平移
    controls.value.mouseButtons.LEFT = THREE.MOUSE.PAN // 左键平移
    controls.value.mouseButtons.MIDDLE = THREE.MOUSE.ROTATE // 中键（滚轮按下）旋转
    controls.value.mouseButtons.RIGHT = THREE.MOUSE.ROTATE // 右键也可旋转

    // 启用旋转，但限制只能上下旋转，不能左右旋转
    controls.value.enableRotate = true
    controls.value.rotateSpeed = 0.7 // 旋转速度

    // 禁用水平方向(左右)旋转
    controls.value.minAzimuthAngle = 0 // 限制方位角最小值为0
    controls.value.maxAzimuthAngle = 0 // 限制方位角最大值为0，确保无法左右旋转

    // 限制旋转角度范围，防止过度旋转
    controls.value.maxPolarAngle = Math.PI / 2 // 最大90度，正好平视
    controls.value.minPolarAngle = 0 // 最小0度，正好俯视

    // 创建日历场景
    if (createCalendarScene) {
      calendarScene = createCalendarScene({
        width: totalWidth, // 总宽度
        depth: calendarDepth, // 总深度
        timeline: timeline.value, // 时间轴数据
        leftOffset: leftOffset, // 左侧区域宽度
        cellWidth: cellWidth, // 单元格宽度
        height: BASE_UNIT.CELL_HEIGHT / 6, // 日历条高度
      })

      if (calendarScene && scene.value) {
        // 确保日历场景正确居中
        calendarScene.position.x = 0

        // 确保所有材质使用平滑着色
        calendarScene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true
            object.receiveShadow = true

            // 如果是标准材质，确保设置平滑着色
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => {
                if (material instanceof THREE.MeshStandardMaterial) {
                  material.flatShading = false
                }
              })
            } else if (object.material instanceof THREE.MeshStandardMaterial) {
              object.material.flatShading = false
            }

            // 存储初始缩放
            object.userData.originalScale = {
              x: object.scale.x,
              y: object.scale.y,
              z: object.scale.z,
            }
          }
        })

        // 创建审核人员面板
        createReviewerPanel(leftOffset, calendarDepth)

        // 创建示例审核节点
        createExampleReviewNodes(totalWidth, calendarDepth, cellWidth)

        scene.value.add(calendarScene)
      }
    }

    // 设置光照
    setupLights()

    // 创建射线检测器和鼠标坐标
    raycaster.value = new THREE.Raycaster()
    mouse.value = new THREE.Vector2()

    // 添加事件监听
    window.addEventListener('resize', onWindowResize)
    containerElement.addEventListener('click', onMouseClick)

    // 添加键盘事件监听，使用空格键切换动画播放/暂停
    window.addEventListener('keydown', handleKeyDown)

    // 启动渲染循环
    clock.start()
    animate()

    // 在场景创建完成后启动动画
    setTimeout(() => {
      createAnimationPath()
      startFlowAnimation()
    }, 1000)
  }

  /**
   * 处理键盘事件
   */
  function handleKeyDown(event: KeyboardEvent) {
    if (event.code === 'Space') {
      event.preventDefault()
      // 替换toggleFlowAnimation为条件判断
      if (isAnimationPlaying) {
        pauseFlowAnimation()
      } else {
        resumeFlowAnimation()
      }
    } else if (event.code === 'KeyR') {
      restartAnimation()
    } else if (event.code === 'ArrowUp') {
      changeAnimationSpeed(true)
    } else if (event.code === 'ArrowDown') {
      changeAnimationSpeed(false)
    }
  }

  /**
   * 创建业务审核流程节点
   */
  function createExampleReviewNodes(totalWidth: number, calendarDepth: number, cellWidth: number) {
    if (!scene.value) {
      return
    }

    // 计算基础位置参数
    const leftOffset = cellWidth * 2 // 左侧区域宽度（2个单元格）

    // 存储所有创建的节点ID，用于后续建立连接关系
    const createdNodes: { [key: string]: { id: string; position: THREE.Vector3 } } = {}

    // 创建更真实的业务审核流程节点
    // 第一步：为每个审核人在其审核日期创建节点
    reviewers.value.forEach((reviewer, reviewerIndex) => {
      // 查找该审核人员的数据
      const reviewerData = dateOptions.value.find((r) => r.title === reviewer.name)
      if (!reviewerData || !reviewerData.timeLine) {
        return
      }

      // 当前审核人所在的Z位置
      const rowCount = reviewers.value.length
      const bottomMargin = 40 // 底部预留的间距
      const panelStartZ = -calendarDepth / 2 + 20 + 10 // 日历条下方10单位
      const availableDepth = calendarDepth - (panelStartZ + calendarDepth / 2) - bottomMargin
      const adjustedRowHeight = availableDepth / Math.max(rowCount, 1)

      // 审核人Z位置 (中心点)
      const reviewerZPosition = panelStartZ + adjustedRowHeight * (reviewerIndex + 0.5)

      // 处理该审核人的每条时间线数据
      reviewerData.timeLine.forEach((timelineItem) => {
        // 提取日期信息
        const fullDate = timelineItem.time
        const dateParts = fullDate.split('-')
        if (dateParts.length !== 3) {
          return
        }

        const month = parseInt(dateParts[1], 10)
        const day = parseInt(dateParts[2], 10)
        const shortDate = `${month}/${day}`

        // 查找日期索引
        const dateIndex = timeline.value.findIndex((date) => {
          const parts = date.split('-')
          if (parts.length !== 3) {
            return false
          }
          const m = parseInt(parts[1], 10)
          const d = parseInt(parts[2], 10)
          return `${m}/${d}` === shortDate
        })

        if (dateIndex === -1) {
          return
        }

        // 计算X位置
        const xPosition = -totalWidth / 2 + leftOffset + (dateIndex + 0.5) * cellWidth

        // 获取文档类型并设置合适的标题
        const fileType = getBusinessDocumentType(reviewer.name, shortDate)
        const status = mapStatusToEnum(timelineItem.status)
        const nodeTitle = `${getOperationByStatus(timelineItem.status)} ${fileType}`

        // 创建节点数据
        const nodeId = `${reviewer.name}_${shortDate}_${fileType.replace(/\s+/g, '_')}`
        const nodePosition = new THREE.Vector3(xPosition, 5, reviewerZPosition)

        const nodeData = {
          id: nodeId,
          title: nodeTitle,
          position: nodePosition,
          status: status,
          files: [
            { name: `${fileType}.pdf`, url: '#', size: '1.2MB' },
            { name: '审核记录.docx', url: '#', size: '0.5MB' },
          ],
          onStatusChange: handleNodeStatusChange,
          onClick: handleNodeClick,
        }

        // 创建节点并记录位置信息用于后续连接
        if (scene.value) {
          nodeManager.createNode(scene.value, nodeData)
          createdNodes[nodeId] = {
            id: nodeId,
            position: nodePosition,
          }
        }
      })
    })

    // 第二步：建立节点之间的连接关系
    if (scene.value) {
      createBusinessConnections(scene.value, createdNodes)
    }
  }

  /**
   * 创建业务审核流程中节点间的连接关系
   */
  function createBusinessConnections(
    scene: THREE.Scene,
    nodes: { [key: string]: { id: string; position: THREE.Vector3 } },
  ) {
    // 获取所有节点ID
    const nodeIds = Object.keys(nodes)

    // 定义业务流程的连接关系及对应的审核状态
    const connectionRules = [
      // 规则格式: { from: 匹配起始节点ID的正则表达式, to: 匹配目标节点ID的正则表达式, status: 审核状态 }

      // 正常流程路径
      { from: /张三.*初步成果文件$/, to: /李四.*一审送审文件$/, status: '提交一审' },
      { from: /李四.*一审送审文件$/, to: /王五.*二审结果文件/, status: '提交二审' },
      { from: /王五.*二审结果文件/, to: /赵六.*三审送审文件/, status: '提交三审' },
      { from: /赵六.*三审送审文件/, to: /张三.*最终文件/, status: '审核通过' },
      { from: /张三.*最终文件/, to: /张三.*最终文件/, status: '审核完成' },

      // 第一次修订流程路径
      { from: /张三.*初步成果文件\(修订\)/, to: /李四.*一审送审文件\(修订\)/, status: '提交一审' },
      { from: /李四.*一审送审文件\(修订\)/, to: /张三.*初步成果文件\(再修订\)/, status: '已驳回' },

      // 第二次修订流程路径
      {
        from: /张三.*初步成果文件\(再修订\)/,
        to: /李四.*一审送审文件\(再修订\)/,
        status: '提交一审',
      },
      {
        from: /李四.*一审送审文件\(再修订\)/,
        to: /李四.*一审送审文件\(再修订\)/,
        status: '审核中',
      },
    ]

    // 应用连接规则
    connectionRules.forEach((rule) => {
      // 找到符合"from"模式的所有节点
      const fromNodes = nodeIds.filter((id) => rule.from.test(id))

      // 找到符合"to"模式的所有节点
      const toNodes = nodeIds.filter((id) => rule.to.test(id))

      // 创建匹配节点之间的连接
      fromNodes.forEach((fromId) => {
        toNodes.forEach((toId) => {
          // 添加连接(如果两个节点都存在)
          if (fromId && toId && fromId !== toId) {
            // 为节点添加连接线
            const connection = nodeManager.connectNodes(scene, fromId, toId)

            // 为连接线添加标签
            if (connection) {
              // 获取状态和对应的样式
              const statusText = rule.status
              const statusColor = getStatusColor(statusText)

              // 使用节点管理器添加连接线标签，并传递状态颜色
              nodeManager.addConnectionLabel(scene, connection, statusText, statusColor)
            }
          }
        })
      })
    })
  }

  /**
   * 获取业务文档类型
   */
  function getBusinessDocumentType(reviewerName: string, date: string): string {
    // 匹配特定日期和审核人的文档类型
    // 使用硬编码方式定义业务文档类型，实际业务中可以从数据库或API获取

    const documentTypes = {
      张三: {
        '6/1': '初步成果文件',
        '6/20': '最终文件',
        '6/25': '初步成果文件(修订)',
        '7/5': '初步成果文件(再修订)',
      },
      李四: {
        '6/5': '一审送审文件',
        '6/30': '一审送审文件(修订)',
        '7/10': '一审送审文件(再修订)',
      },
      王五: {
        '6/10': '二审结果文件',
      },
      赵六: {
        '6/15': '三审送审文件',
      },
    }

    // 查找当前审核人的文档类型
    if (documentTypes[reviewerName] && documentTypes[reviewerName][date]) {
      return documentTypes[reviewerName][date]
    }

    // 若无匹配，返回默认文档类型
    return '控制价文档'
  }

  /**
   * 将状态字符串映射到ReviewNodeStatus枚举
   */
  function mapStatusToEnum(status: string): ReviewNodeStatus {
    switch (status) {
      case '审核通过':
      case '审核完成':
        return ReviewNodeStatus.APPROVED
      case '已驳回':
        return ReviewNodeStatus.REJECTED
      case '提交一审':
      case '提交二审':
      case '提交三审':
        return ReviewNodeStatus.SUBMITTED
      case '审核中':
        return ReviewNodeStatus.REVIEWING
      case '待审核':
      case '未上传':
      default:
        return ReviewNodeStatus.PENDING
    }
  }

  /**
   * 根据状态获取操作描述
   */
  function getOperationByStatus(status: string): string {
    switch (status) {
      case '审核通过':
        return '审核通过'
      case '审核完成':
        return '审核完成'
      case '已驳回':
        return '驳回审核'
      case '提交一审':
        return '提交一审'
      case '提交二审':
        return '提交二审'
      case '提交三审':
        return '提交三审'
      case '审核中':
        return '正在审核'
      case '待审核':
        return '待审核'
      case '未上传':
        return '未提交'
      default:
        return status
    }
  }

  /**
   * 处理节点状态变化
   */
  function handleNodeStatusChange(nodeId: string, newStatus: ReviewNodeStatus, comment?: string) {
    console.log(`节点 ${nodeId} 状态已更改为: ${newStatus}`)
    console.log(`审核意见: ${comment || '无'}`)

    // 这里可以添加实际的业务逻辑，例如保存到数据库或触发下一步流程
    // 如果想显示提示消息，可以使用以下方式：
    showToast(`已${newStatus === ReviewNodeStatus.APPROVED ? '通过' : '驳回'}审核: ${nodeId}`)
  }

  /**
   * 显示提示消息
   */
  function showToast(message: string) {
    // 创建提示元素
    const toast = document.createElement('div')
    toast.style.position = 'fixed'
    toast.style.bottom = '20px'
    toast.style.left = '50%'
    toast.style.transform = 'translateX(-50%)'
    toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
    toast.style.color = 'white'
    toast.style.padding = '10px 20px'
    toast.style.borderRadius = '4px'
    toast.style.zIndex = '2000'
    toast.style.fontFamily = 'Microsoft YaHei, sans-serif'
    toast.style.transition = 'opacity 0.3s ease'
    toast.textContent = message

    // 添加到页面
    document.body.appendChild(toast)

    // 3秒后自动消失
    setTimeout(() => {
      toast.style.opacity = '0'
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 300)
    }, 3000)
  }

  /**
   * 处理节点点击
   */
  function handleNodeClick(nodeId: string) {
    console.log(`节点 ${nodeId} 被点击`)

    // 显示文件信息弹窗
    const node = nodeManager.getNode(nodeId)
    if (node) {
      selectedObject.value = {
        id: nodeId,
        type: 'reviewNode',
        title: node.getMesh().userData.title,
        status: node.getMesh().userData.status,
      }
    }
  }

  /**
   * 创建审核人员面板
   * 使用Three.js原生对象创建左侧审核人员面板
   */
  function createReviewerPanel(leftOffset: number, calendarDepth: number) {
    if (!scene.value) {
      return
    }

    // 计算每个审核人员的行高
    const rowCount = reviewers.value.length
    const rowHeight = calendarDepth / Math.max(rowCount, 1)

    // 计算总宽度 - 基于与initialize函数相同的计算方式
    const cellWidth = 140 // BASE_UNIT.CELL_WIDTH
    const totalCells = 2 + timeline.value.length // BASE_UNIT.LEFT_CELLS + timeline.value.length
    const totalWidth = Math.max(140 * 10, totalCells * cellWidth) // Math.max(minWidth, totalCells * cellWidth)

    // 修改：审核人员面板只占一个单元格的宽度
    const panelWidth = cellWidth

    // 修改垂直位置常量 - 调整为日历条下方，减少间距
    // 首先获取日历条的高度和位置信息
    const calendarBarHeight = 10 // 日历条高度（来自createCalendarScene的height参数）
    // 日历条的Z位置是 -depth/2 + 20（来自useCalendarScene.ts中的calendarBar.position）
    const calendarBarZPosition = -calendarDepth / 2 + 20
    // 减少审核人员面板与日历条之间的间距 - 从40减少到10
    const panelStartZ = calendarBarZPosition + 10 // 减少间距，确保紧跟日历条

    // 计算可用空间和行高 - 保留底部间距
    // 为底部预留额外的空间，确保内容不会紧贴底部
    const bottomMargin = 40 // 底部预留的间距
    const availableDepth = calendarDepth - (panelStartZ + calendarDepth / 2) - bottomMargin
    const adjustedRowHeight = availableDepth / Math.max(rowCount, 1)

    // 添加横向虚线分割线 - 只在审核人员之间添加，不在顶部添加第一条线
    // 创建虚线材质
    const dashedLineMaterial = new THREE.LineDashedMaterial({
      color: 0x3a9adf,
      dashSize: 10,
      gapSize: 5,
      opacity: 0.7,
      transparent: true,
    })

    // 只为审核人员之间创建分割线，不包括第一条线
    // 修改循环起始值为1，不再创建第一条线
    for (let i = 1; i <= rowCount; i++) {
      const lineZ = panelStartZ + i * adjustedRowHeight

      // 创建分割线几何体 - 确保线条完全平行于X轴
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-totalWidth / 2, 0.1, lineZ),
        new THREE.Vector3(totalWidth / 2, 0.1, lineZ), // 延伸到整个宽度
      ])

      // 使用虚线材质
      const dividerLine = new THREE.Line(lineGeometry, dashedLineMaterial)
      // 计算线段长度 - 虚线材质需要这个属性
      dividerLine.computeLineDistances()

      scene.value.add(dividerLine)
    }

    // 移除底部额外的分割线，仅保留间距
    // 底部空间通过上面设置的bottomMargin变量提供

    // 为每个审核人创建面板 - 调整第一个卡片的位置，确保紧贴日历条
    reviewers.value.forEach((reviewer, index) => {
      // 调整位置计算，使第一个卡片更靠近日历条
      const zPosition = panelStartZ + adjustedRowHeight * (index + 0.5)

      // 创建审核人卡片背景 - 确保完全水平
      const cardGeometry = new THREE.PlaneGeometry(panelWidth * 0.9, adjustedRowHeight * 0.8)
      // 完全水平放置，没有倾斜
      cardGeometry.rotateX(-Math.PI / 2)

      // 获取审核状态，用于计算颜色
      const status = getReviewerStatus(reviewer)
      const cardColor = getStatusColor(status)

      // 创建审核人信息贴图
      const cardTexture = createReviewerNameTexture(reviewer, status)

      const cardMaterial = new THREE.MeshStandardMaterial({
        map: cardTexture,
        color: 0xffffff, // 白色基底，让贴图颜色保持原样
        metalness: 0.3,
        roughness: 0.7,
        transparent: true,
        side: THREE.DoubleSide,
      })

      const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial)
      // 修改位置 - 使所有卡片完全水平放置
      cardMesh.position.set(
        -totalWidth / 2 + panelWidth / 2, // X位置保持不变
        0.2, // 略微抬高以避免Z-fighting
        zPosition, // 正确的Z位置
      )
      cardMesh.castShadow = true
      cardMesh.receiveShadow = true

      // 添加用户数据，以便交互时识别
      cardMesh.userData = {
        type: 'reviewer',
        id: reviewer.id,
        name: reviewer.name,
        role: reviewer.role,
      }

      if (scene.value) {
        scene.value.add(cardMesh)
      }
    })
  }

  /**
   * 创建审核人名称贴图
   */
  function createReviewerNameTexture(reviewer: any, status: string): THREE.Texture {
    const canvas = document.createElement('canvas')
    // 调整为更合适的宽高比例，适应单个单元格显示
    canvas.width = 256
    canvas.height = 128 // 减小高度，使其更紧凑

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return new THREE.Texture()
    }

    // 背景 - 使用更优雅的渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#2d4880') // 更亮的蓝色
    gradient.addColorStop(1, '#1a2c55') // 深蓝色
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 添加边框高光效果
    ctx.strokeStyle = '#5a9aff' // 更亮的蓝色边框
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, canvas.width, canvas.height)

    // 添加内部高光
    ctx.strokeStyle = 'rgba(90, 154, 255, 0.3)' // 半透明的内边框
    ctx.lineWidth = 4
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16)

    // 绘制姓名 - 更清晰的字体和位置
    ctx.font = 'bold 40px Microsoft YaHei'
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // 添加文字描边，提高可读性
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.strokeText(reviewer.name, canvas.width / 2, canvas.height * 0.38)
    ctx.fillText(reviewer.name, canvas.width / 2, canvas.height * 0.38)

    // 绘制角色 - 调整位置和样式
    ctx.font = '20px Microsoft YaHei'
    ctx.fillStyle = '#aae0ff' // 更清晰的淡蓝色
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1
    ctx.strokeText(reviewer.role, canvas.width / 2, canvas.height * 0.7)
    ctx.fillText(reviewer.role, canvas.width / 2, canvas.height * 0.7)

    // 绘制状态指示器 - 改为右上角的小圆点
    if (status) {
      const statusColor = getStatusColor(status)

      // 绘制状态圆点
      const dotRadius = 8
      const dotX = canvas.width - 20
      const dotY = 20

      // 绘制光晕效果
      ctx.beginPath()
      ctx.arc(dotX, dotY, dotRadius * 2, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${hexToRgb(statusColor)}, 0.3)`
      ctx.fill()

      // 绘制实心圆点
      ctx.beginPath()
      ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2)
      ctx.fillStyle = statusColor
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // 创建纹理
    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = 16 // 提高倾斜视角下的清晰度

    return texture
  }

  /**
   * 辅助函数：将十六进制颜色转换为RGB格式
   */
  function hexToRgb(hex: string): string {
    // 去除可能的#前缀
    hex = hex.replace(/^#/, '')

    // 解析RGB值
    const bigint = parseInt(hex, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255

    return `${r}, ${g}, ${b}`
  }

  /**
   * 获取审核人员状态
   */
  function getReviewerStatus(reviewer: any): string {
    // 查找该审核人员的最新状态
    const reviewerData = dateOptions.value.find((r) => r.title === reviewer.name)
    if (reviewerData && reviewerData.timeLine.length > 0) {
      // 按日期排序，找到最新状态
      const latestStatus = [...reviewerData.timeLine].sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
      )[0]
      return latestStatus.status
    }
    return '暂无状态'
  }

  /**
   * 获取状态对应的颜色
   */
  function getStatusColor(status: string): string {
    switch (status) {
      case '审核通过':
        return '#00cc66' // 绿色
      case '审核完成':
        return '#00cc99' // 青绿色
      case '已驳回':
        return '#ff3366' // 红色
      case '提交一审':
        return '#00aaff' // 蓝色
      case '提交二审':
        return '#ffaa00' // 橙色
      case '提交三审':
        return '#ffcc00' // 黄色
      case '审核中':
        return '#888888' // 灰色
      case '待审核':
        return '#aaaaaa' // 浅灰色
      default:
        return '#ffffff' // 默认白色
    }
  }

  /**
   * 设置光照
   */
  function setupLights() {
    if (!scene.value) {
      return
    }

    // 环境光
    const ambientLight = new THREE.AmbientLight(0x6688cc, 0.4)
    scene.value.add(ambientLight)

    // 主平行光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
    directionalLight.position.set(100, 180, 100)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 500
    directionalLight.shadow.camera.left = -200
    directionalLight.shadow.camera.right = 200
    directionalLight.shadow.camera.top = 200
    directionalLight.shadow.camera.bottom = -200
    directionalLight.shadow.bias = -0.0005
    scene.value.add(directionalLight)

    // 半球光 - 提供从天空到地面的渐变颜色
    const hemisphereLight = new THREE.HemisphereLight(0xaaccff, 0x223366, 0.5)
    scene.value.add(hemisphereLight)

    // 添加辅助点光源 - 蓝色调
    const bluePointLight = new THREE.PointLight(0x1adfff, 1.5, 300)
    bluePointLight.position.set(0, 100, 50)
    scene.value.add(bluePointLight)
  }

  /**
   * 窗口大小调整处理
   */
  function onWindowResize() {
    if (!camera.value || !renderer.value || !cssRenderer.value) {
      return
    }

    const container = document.getElementById('three-container')
    if (!container) {
      return
    }

    // 获取容器新尺寸
    const width = container.clientWidth
    const height = container.clientHeight

    // 使用与初始化相同的基准单位
    const BASE_UNIT = {
      CELL_WIDTH: 140, // 单元格宽度基准值
      CELL_HEIGHT: 60, // 单元格高度基准值
      DEPTH: 400, // 深度基准值
      LEFT_CELLS: 2, // 左侧区域占用单元格数
      MIN_CELLS: 10, // 最小日历单元格数
    }

    // 计算日历尺寸 - 使用基准单位
    const cellWidth = BASE_UNIT.CELL_WIDTH
    const leftOffset = BASE_UNIT.CELL_WIDTH * BASE_UNIT.LEFT_CELLS
    const minWidth = BASE_UNIT.CELL_WIDTH * BASE_UNIT.MIN_CELLS

    // 计算实际宽度 - 基于单元格数量
    const totalCells = BASE_UNIT.LEFT_CELLS + timeline.value.length
    const totalWidth = Math.max(minWidth, totalCells * cellWidth)
    const calendarDepth = BASE_UNIT.DEPTH

    // 更新相机视口 - 保持与初始化时相同的设置
    if (camera.value) {
      // 视锥体保持不变，只更新缩放比例
      camera.value.left = totalWidth / -2
      camera.value.right = totalWidth / 2
      camera.value.top = calendarDepth / 2
      camera.value.bottom = calendarDepth / -2

      // 重新计算缩放比例，保持一致性
      const scaleX = width / totalWidth
      const scaleY = height / calendarDepth
      const scale = Math.min(scaleX, scaleY) * 0.9

      camera.value.zoom = scale
      camera.value.updateProjectionMatrix()
    }

    // 更新渲染器尺寸
    renderer.value.setSize(width, height)
    cssRenderer.value.setSize(width, height)
  }

  /**
   * 鼠标点击处理
   */
  function onMouseClick(event: MouseEvent) {
    if (!raycaster.value || !mouse.value || !camera.value || !scene.value) {
      return
    }

    const container = document.getElementById('three-container')
    if (!container) {
      return
    }

    // 计算鼠标在归一化设备坐标中的位置
    const rect = container.getBoundingClientRect()
    mouse.value.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1
    mouse.value.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1

    // 设置射线
    raycaster.value.setFromCamera(mouse.value, camera.value)

    // 检测与场景对象的交叉
    const intersects = raycaster.value.intersectObjects(scene.value.children, true)

    if (intersects.length > 0) {
      const selectedMesh = intersects[0].object as THREE.Mesh
      selectedObject.value = selectedMesh.userData as SelectedObjectData
      console.log('选中对象:', selectedMesh.userData)
    } else {
      selectedObject.value = null
    }
  }

  /**
   * 重置所有对象的缩放
   */
  function resetObjectsScale() {
    // 此函数保留但不执行任何操作，因为我们不再高亮对象
    highlightedObject = null
  }

  /**
   * 创建动画路径
   * 根据已创建的连接线构建一条完整的动画路径
   */
  function createAnimationPath() {
    if (!scene.value) {
      return
    }

    // 清空当前路径
    animationPathPoints.length = 0
    animationPathStatus.length = 0

    // 正常工作流程路径的节点ID序列
    const pathNodeIds = [
      '张三_6/1_初步成果文件',
      '李四_6/5_一审送审文件',
      '王五_6/10_二审结果文件',
      '赵六_6/15_三审送审文件',
      '张三_6/20_最终文件',
    ]

    // 为每对连续节点获取连接线路径点
    for (let i = 0; i < pathNodeIds.length - 1; i++) {
      const fromNodeId = pathNodeIds[i]
      const toNodeId = pathNodeIds[i + 1]

      // 获取节点
      const fromNode = nodeManager.getNode(fromNodeId)
      const toNode = nodeManager.getNode(toNodeId)

      if (fromNode && toNode) {
        // 获取连接点 - 沿着连接线的路径点
        const connection = nodeManager.getConnection(fromNodeId, toNodeId)

        if (connection && connection.points && connection.points.length > 0) {
          // 如果是第一个连接，添加起始节点的位置
          if (i === 0) {
            const startPos = fromNode.getMesh().position.clone()
            startPos.y += 5 // 稍微升高位置
            animationPathPoints.push(startPos)
          }

          // 添加连接线的所有点 (提升Y坐标使其在连接线上方)
          for (const point of connection.points) {
            const pathPoint = point.clone()
            pathPoint.y += 5 // 稍微升高位置
            animationPathPoints.push(pathPoint)
          }

          // 获取状态
          const status = findConnectionStatus(fromNodeId, toNodeId)
          animationPathStatus.push(status || '流程进行中')
        } else {
          // 如果没有找到连接，就创建一个直线路径
          console.warn(`未找到 ${fromNodeId} 到 ${toNodeId} 的连接线，使用直线代替`)

          // 如果是第一个连接，添加起始节点的位置
          if (i === 0) {
            const startPos = fromNode.getMesh().position.clone()
            startPos.y += 5
            animationPathPoints.push(startPos)
          }

          // 添加终点
          const endPos = toNode.getMesh().position.clone()
          endPos.y += 5
          animationPathPoints.push(endPos)

          // 获取状态
          const status = findConnectionStatus(fromNodeId, toNodeId)
          animationPathStatus.push(status || '流程进行中')
        }
      }
    }

    // 如果路径过短，添加最后一个节点的位置
    if (animationPathPoints.length < 2) {
      const lastNodeId = pathNodeIds[pathNodeIds.length - 1]
      const lastNode = nodeManager.getNode(lastNodeId)

      if (lastNode) {
        const lastPos = lastNode.getMesh().position.clone()
        lastPos.y += 5
        animationPathPoints.push(lastPos)
      }
    }

    console.log(`创建了${animationPathPoints.length}个动画路径点`)

    // 创建文件图标
    createFileIcon()
  }

  /**
   * 查找两个节点间的连接状态
   */
  function findConnectionStatus(fromNodeId: string, toNodeId: string): string {
    // 从连接规则中查找匹配的状态
    for (const rule of [
      { from: /张三.*初步成果文件$/, to: /李四.*一审送审文件$/, status: '提交一审' },
      { from: /李四.*一审送审文件$/, to: /王五.*二审结果文件/, status: '提交二审' },
      { from: /王五.*二审结果文件/, to: /赵六.*三审送审文件/, status: '提交三审' },
      { from: /赵六.*三审送审文件/, to: /张三.*最终文件/, status: '审核通过' },
    ]) {
      if (rule.from.test(fromNodeId) && rule.to.test(toNodeId)) {
        return rule.status
      }
    }
    return '流程进行中'
  }

  /**
   * 创建文件图标
   */
  function createFileIcon() {
    if (!scene.value || animationPathPoints.length === 0) {
      return
    }

    // 移除现有的文件图标
    if (fileIcon && scene.value) {
      ;(scene.value as THREE.Scene).remove(fileIcon as THREE.Object3D)
    }

    // 创建文件图标组
    const fileIconGroup = new THREE.Group()

    // 与审核节点完全一致的尺寸
    const boxWidth = 32
    const boxHeight = 20

    // 1. 创建主体核心 - 与审核节点相同的设计
    const coreGeometry = new THREE.BoxGeometry(boxWidth, 6, boxHeight)
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x9370db,
      emissive: 0x7b68ee,
      emissiveIntensity: 0.4,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9,
    })
    const core = new THREE.Mesh(coreGeometry, coreMaterial)
    core.position.y = 0
    core.renderOrder = 5

    // 2. 创建外层边框 - 与审核节点相同
    const outerEdgeGeometry = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(boxWidth + 4, 8, boxHeight + 4),
    )
    const outerEdgeMaterial = new THREE.LineBasicMaterial({
      color: 0xba55d3,
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
      color: 0xba55d3,
      linewidth: 2,
      transparent: true,
      opacity: 1.0,
    })
    const innerEdges = new THREE.LineSegments(innerEdgeGeometry, innerEdgeMaterial)
    innerEdges.renderOrder = 7

    // 4. 添加简单的文档图标
    const documentIconGroup = createDocumentIcon()
    documentIconGroup.position.set(0, 3.5, 0)

    // 添加到图标组
    fileIconGroup.add(core)
    fileIconGroup.add(outerEdges)
    fileIconGroup.add(innerEdges)
    fileIconGroup.add(documentIconGroup)

    // 创建详细的瞬移路径点
    createDetailedPath()

    // 设置初始位置
    if (pathPoints.length > 0) {
      fileIconGroup.position.copy(pathPoints[0])
    } else if (animationPathPoints.length > 0) {
      const initialPosition = animationPathPoints[0].clone()
      initialPosition.y += 8
      fileIconGroup.position.copy(initialPosition)
    }

    // 添加到场景
    fileIcon = fileIconGroup
    if (scene.value) {
      scene.value.add(fileIcon)
      console.log('无光晕效果的文件图标已添加到场景')
    }

    // 移除光晕效果调用
    // addFileGlow(fileIconGroup);
  }

  /**
   * 创建文档图标 - 使用Three.js几何体，与审核节点风格匹配
   */
  function createDocumentIcon(): THREE.Group {
    const iconGroup = new THREE.Group()

    // 创建文档主体 - 薄薄的白色平面
    const docGeometry = new THREE.PlaneGeometry(12, 16)
    const docMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    })
    const docMesh = new THREE.Mesh(docGeometry, docMaterial)
    docMesh.rotation.x = -Math.PI / 2 // 水平放置

    // 创建文档边框
    const docEdgeGeometry = new THREE.EdgesGeometry(docGeometry)
    const docEdgeMaterial = new THREE.LineBasicMaterial({
      color: 0xb19cd9, // 淡紫色边框
      linewidth: 1.5,
    })
    const docEdges = new THREE.LineSegments(docEdgeGeometry, docEdgeMaterial)
    docEdges.rotation.x = -Math.PI / 2 // 水平放置

    // 创建文档折角 - 使用三角形几何体
    const cornerGeometry = new THREE.BufferGeometry()
    const cornerVertices = new Float32Array([
      // 三角形三个顶点
      2, 0, 6, 6, 0, 6, 6, 0, 2,
    ])
    cornerGeometry.setAttribute('position', new THREE.BufferAttribute(cornerVertices, 3))
    const cornerMaterial = new THREE.MeshBasicMaterial({
      color: 0xe6e6fa, // 淡紫色折角
      side: THREE.DoubleSide,
    })
    const cornerMesh = new THREE.Mesh(cornerGeometry, cornerMaterial)

    // 添加文档线条 - 模拟文本行
    // 第一条横线
    const line1Geometry = new THREE.BufferGeometry()
    const line1Vertices = new Float32Array([-4, 0, 3, 4, 0, 3])
    line1Geometry.setAttribute('position', new THREE.BufferAttribute(line1Vertices, 3))
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x9370db }) // 紫色线条
    const line1 = new THREE.Line(line1Geometry, lineMaterial)

    // 第二条横线
    const line2Geometry = new THREE.BufferGeometry()
    const line2Vertices = new Float32Array([-4, 0, 0, 4, 0, 0])
    line2Geometry.setAttribute('position', new THREE.BufferAttribute(line2Vertices, 3))
    const line2 = new THREE.Line(line2Geometry, lineMaterial)

    // 第三条横线
    const line3Geometry = new THREE.BufferGeometry()
    const line3Vertices = new Float32Array([-4, 0, -3, 4, 0, -3])
    line3Geometry.setAttribute('position', new THREE.BufferAttribute(line3Vertices, 3))
    const line3 = new THREE.Line(line3Geometry, lineMaterial)

    // 将所有元素添加到图标组
    iconGroup.add(docMesh)
    iconGroup.add(docEdges)
    iconGroup.add(cornerMesh)
    iconGroup.add(line1)
    iconGroup.add(line2)
    iconGroup.add(line3)

    return iconGroup
  }

  /**
   * 为文件添加光晕效果
   */
  function addFileGlow(fileGroup: THREE.Group) {
    // 只保留主光晕 - 简单的脉冲效果
    const glowGeometry = new THREE.PlaneGeometry(40, 28)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xa177dd,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
    })

    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
    glowMesh.rotation.x = -Math.PI / 2
    glowMesh.position.y = -0.5
    glowMesh.userData.isGlow = true // 标记为光晕，用于动画
    fileGroup.add(glowMesh)

    // 启动简化的光晕动画
    startSimpleGlowAnimation(fileGroup)
  }

  /**
   * 启动简化的光晕动画
   */
  function startSimpleGlowAnimation(fileGroup: THREE.Group) {
    const startTime = Date.now()

    const animateGlow = () => {
      if (!fileGroup.parent) {
        return
      } // 如果文件组已被移除，停止动画

      const elapsed = (Date.now() - startTime) / 1000 // 转换为秒

      fileGroup.traverse((child) => {
        if (child.userData.isGlow && child instanceof THREE.Mesh) {
          // 非常轻微的光晕脉冲效果
          const pulse = Math.sin(elapsed * 1) * 0.03 + 1 // 减少频率和强度
          child.scale.set(pulse, pulse, pulse)
          child.material.opacity = 0.1 + Math.sin(elapsed * 0.8) * 0.02 // 减少透明度变化
        }
      })

      requestAnimationFrame(animateGlow)
    }

    animateGlow()
  }

  /**
   * 创建完整的路径点数组
   * 将所有连接线的点连接成一个完整的路径，并按固定距离分割
   */
  function createDetailedPath() {
    if (!scene.value || animationPathPoints.length < 2) {
      return
    }

    pathPoints = []
    const stepDistance = 80 // 增加每步移动的固定距离 - 让瞬移距离更大

    // 遍历所有路径段
    for (let i = 0; i < animationPathPoints.length - 1; i++) {
      const startPoint = animationPathPoints[i]
      const endPoint = animationPathPoints[i + 1]

      // 计算这一段的总距离
      const segmentVector = new THREE.Vector3().subVectors(endPoint, startPoint)
      const segmentLength = segmentVector.length()

      // 计算需要多少步才能走完这一段
      const steps = Math.ceil(segmentLength / stepDistance)

      // 如果是第一段，添加起始点
      if (i === 0) {
        pathPoints.push(startPoint.clone())
      }

      // 在这一段上按固定距离创建步骤点
      for (let step = 1; step <= steps; step++) {
        const progress = step / steps
        const stepPoint = new THREE.Vector3().lerpVectors(startPoint, endPoint, progress)
        stepPoint.y += 8 // 保持在连接线上方
        pathPoints.push(stepPoint)
      }
    }

    console.log(`创建了${pathPoints.length}个路径步骤点，瞬移距离: ${stepDistance}`)
  }

  /**
   * 更新文件图标动画 - 瞬移式移动，只在审核节点显示状态
   */
  function updateFileAnimation(delta: number) {
    if (!isAnimationPlaying || !fileIcon || pathPoints.length < 2) {
      return
    }

    // 检查是否到达路径终点
    if (currentStepIndex >= pathPoints.length - 1) {
      // 重新开始
      currentStepIndex = 0
      currentTeleportState = TeleportState.STAYING
      stayTime = 0
      moveTimer = 0
      showFloatingStatus('审核流程演示完成，重新开始', 2000)
      return
    }

    // 动画参数
    const moveInterval = 0.2 // 每次瞬移的间隔时间(秒) - 统一的移动间隔

    if (currentTeleportState === TeleportState.STAYING) {
      // 停留状态 - 在当前位置短暂停留
      stayTime += delta

      // 确保文件图标位置准确
      const currentPosition = pathPoints[currentStepIndex]
      fileIcon.position.copy(currentPosition)

      // 保持稳定的旋转
      fileIcon.rotation.x = 0
      fileIcon.rotation.y = 0
      fileIcon.rotation.z = 0

      // 只在审核节点显示状态信息
      const isAtImportantNode = isAtReviewNode(currentPosition)
      if (isAtImportantNode && stayTime >= 0.1 && stayTime <= 0.15) {
        // 只在停留的特定时间窗口内显示一次状态
        const statusIndex = getStatusIndexForPosition(currentPosition)
        if (statusIndex >= 0 && statusIndex < animationPathStatus.length) {
          const nodeInfo = getNodeInfoAtPosition(currentPosition)
          if (nodeInfo) {
            // 注释掉状态提示框，避免出现过于频繁
            // showFloatingStatus(`${nodeInfo.title}: ${animationPathStatus[statusIndex]}`, 2000);
            // updateFileStatusLabel(animationPathStatus[statusIndex]);
          }
        }
      }

      // 统一的移动间隔，不区分是否为审核节点
      if (stayTime >= moveInterval) {
        currentTeleportState = TeleportState.MOVING
        stayTime = 0
        moveTimer = 0
      }
    } else if (currentTeleportState === TeleportState.MOVING) {
      // 移动状态 - 瞬移到下一个位置
      moveTimer += delta

      if (moveTimer >= moveInterval) {
        // 瞬移到下一个位置
        currentStepIndex++

        if (currentStepIndex < pathPoints.length) {
          const nextPosition = pathPoints[currentStepIndex]

          // 瞬间移动到新位置 - 这里是关键的瞬移效果
          fileIcon.position.copy(nextPosition)

          // 计算朝向下一个点的方向（如果有的话）
          if (currentStepIndex < pathPoints.length - 1) {
            const direction = new THREE.Vector3()
              .subVectors(pathPoints[currentStepIndex + 1], nextPosition)
              .normalize()

            if (direction.length() > 0) {
              const angle = Math.atan2(direction.x, direction.z)
              fileIcon.rotation.y = angle
            }
          }

          // 添加瞬移特效
          addTeleportEffect(nextPosition)
        }

        // 切换回停留状态
        currentTeleportState = TeleportState.STAYING
        moveTimer = 0
        stayTime = 0
      }
    }
  }

  /**
   * 检查当前位置是否在审核节点附近
   */
  function isAtReviewNode(position: THREE.Vector3): boolean {
    const threshold = 20 // 距离阈值

    // 检查是否接近任何原始路径点（审核节点）
    for (const nodePosition of animationPathPoints) {
      const distance = position.distanceTo(nodePosition)
      if (distance < threshold) {
        return true
      }
    }

    return false
  }

  /**
   * 根据位置获取对应的状态索引
   */
  function getStatusIndexForPosition(position: THREE.Vector3): number {
    const threshold = 20

    // 查找最接近的审核节点
    for (let i = 0; i < animationPathPoints.length; i++) {
      const nodePosition = animationPathPoints[i]
      const distance = position.distanceTo(nodePosition)
      if (distance < threshold) {
        return Math.min(i, animationPathStatus.length - 1)
      }
    }

    return -1
  }

  /**
   * 根据位置获取节点信息
   */
  function getNodeInfoAtPosition(position: THREE.Vector3): { title: string; type: string } | null {
    const threshold = 20

    // 查找最接近的审核节点
    for (let i = 0; i < animationPathPoints.length; i++) {
      const nodePosition = animationPathPoints[i]
      const distance = position.distanceTo(nodePosition)
      if (distance < threshold) {
        // 返回节点信息
        return {
          title: `审核节点${i + 1}`,
          type: 'review',
        }
      }
    }

    return null
  }

  /**
   * 添加瞬移特效 - 简化版本，无光圈效果
   */
  function addTeleportEffect(position: THREE.Vector3) {
    // 移除所有瞬移特效，保持简洁
    // 不再创建任何视觉特效
    return
  }

  /**
   * 更新文件状态标签 - 使用CSS2D对象，确保在3D空间中可见
   */
  function updateFileStatusLabel(status: string) {
    if (!fileIcon || !scene.value) {
      return
    }

    // 确保fileIcon是THREE.Group类型
    const fileGroup = fileIcon as THREE.Group

    // 移除旧标签
    fileGroup.children.forEach((child) => {
      if (child.userData && child.userData.isStatusLabel) {
        fileGroup.remove(child)
      }
    })

    // 注释掉文字标签创建代码 - 不再显示文字
    /*
    // 创建状态标签元素
    const labelDiv = document.createElement('div');
    labelDiv.className = 'file-status-label';

    // 设置标签样式 - 使其在3D环境中突出显示
    labelDiv.style.backgroundColor = 'rgba(25, 45, 90, 0.95)';
    labelDiv.style.color = getStatusColor(status);
    labelDiv.style.padding = '4px 8px';
    labelDiv.style.borderRadius = '4px';
    labelDiv.style.fontFamily = 'Microsoft YaHei, sans-serif';
    labelDiv.style.fontSize = '12px';
    labelDiv.style.fontWeight = 'bold';
    labelDiv.style.textAlign = 'center';
    labelDiv.style.whiteSpace = 'nowrap';
    labelDiv.style.pointerEvents = 'none';
    labelDiv.style.border = `2px solid ${getStatusColor(status)}`;
    labelDiv.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.5)';
    labelDiv.style.minWidth = '80px';

    // 文本内容
    labelDiv.textContent = `${status}`;

    // 创建CSS2D对象 - 使用正确导入的CSS2DObject
    const labelObject = new CSS2DObject(labelDiv);
    labelObject.position.set(0, 8, 0); // 放置在文件图标上方

    // 确保标签始终面向相机
    labelObject.userData = labelObject.userData || {};
    labelObject.userData.isStatusLabel = true;

    // 添加到文件图标
    fileGroup.add(labelObject);
    */
  }

  /**
   * 显示3D空间中的浮动状态信息
   * 创建一个固定在屏幕上的状态面板，但视觉上与3D场景融合
   */
  function showFloatingStatus(message: string, duration: number = 2000) {
    // 移除现有的状态面板
    document.querySelectorAll('.floating-status-panel').forEach((element) => {
      if (document.body.contains(element)) {
        document.body.removeChild(element)
      }
    })

    // 创建浮动状态面板
    const statusPanel = document.createElement('div')
    statusPanel.className = 'floating-status-panel'

    // 设置样式 - 创建一个类似全息投影的效果
    statusPanel.style.position = 'fixed'
    statusPanel.style.bottom = '30px' // 放在底部，避免遮挡视图
    statusPanel.style.left = '50%'
    statusPanel.style.transform = 'translateX(-50%)'
    statusPanel.style.backgroundColor = 'rgba(10, 30, 70, 0.85)'
    statusPanel.style.color = '#ffffff'
    statusPanel.style.padding = '12px 20px'
    statusPanel.style.borderRadius = '8px'
    statusPanel.style.zIndex = '1000' // 确保在3D场景之上
    statusPanel.style.fontFamily = 'Microsoft YaHei, sans-serif'
    statusPanel.style.fontWeight = 'bold'
    statusPanel.style.textAlign = 'center'
    statusPanel.style.minWidth = '220px'
    statusPanel.style.backdropFilter = 'blur(5px)' // 现代浏览器支持模糊效果
    statusPanel.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.5), 0 0 15px rgba(58, 154, 223, 0.5)'
    statusPanel.style.border = '2px solid rgba(58, 154, 223, 0.7)'
    statusPanel.style.transition = 'all 0.3s ease'
    statusPanel.style.opacity = '0'
    statusPanel.style.transform = 'translateX(-50%) translateY(20px)'

    // 获取状态对应的颜色
    const statusColor = getStatusColor(message)

    // 创建标题
    const title = document.createElement('div')
    title.style.marginBottom = '8px'
    title.style.color = '#8acdff'
    title.style.fontSize = '14px'
    title.textContent = '工作流状态'

    // 创建状态指示器
    const statusIndicator = document.createElement('div')
    statusIndicator.style.height = '8px'
    statusIndicator.style.width = '40px'
    statusIndicator.style.backgroundColor = statusColor
    statusIndicator.style.borderRadius = '4px'
    statusIndicator.style.margin = '0 auto 10px auto'
    statusIndicator.style.boxShadow = `0 0 10px ${statusColor}`

    // 创建状态消息
    const statusMessage = document.createElement('div')
    statusMessage.style.fontSize = '16px'
    statusMessage.style.color = '#ffffff'
    statusMessage.textContent = message

    // 组装面板
    statusPanel.appendChild(title)
    statusPanel.appendChild(statusIndicator)
    statusPanel.appendChild(statusMessage)

    // 添加到页面
    document.body.appendChild(statusPanel)

    // 添加动画效果
    setTimeout(() => {
      statusPanel.style.opacity = '1'
      statusPanel.style.transform = 'translateX(-50%) translateY(0)'
    }, 10)

    // 一段时间后自动消失
    setTimeout(() => {
      statusPanel.style.opacity = '0'
      statusPanel.style.transform = 'translateX(-50%) translateY(20px)'
      setTimeout(() => {
        if (document.body.contains(statusPanel)) {
          document.body.removeChild(statusPanel)
        }
      }, 300)
    }, duration)
  }

  /**
   * 动画循环 - 优化渲染循环以减少抖动
   */
  function animate() {
    if (!scene.value || !camera.value || !renderer.value || !cssRenderer.value) {
      return
    }

    animationFrameId = requestAnimationFrame(animate)

    // 获取距离上次更新的时间增量
    const delta = clock.getDelta()

    // 更新控制器 - 使用时间增量确保平滑更新
    if (controls.value) {
      controls.value.update()

      // 在每一帧检查相机角度，确保不会看到底部
      if (camera.value.position.y < 50) {
        camera.value.position.y = 50
      }

      // 确保相机始终看向场景中心
      camera.value.lookAt(0, 0, 0)
    }

    // 更新文件图标动画
    updateFileAnimation(delta)

    // 渲染场景 - 使用矩阵舍入减少抖动
    if (camera.value) {
      // 舍入摄像机位置到较小的精度，以减少抖动
      camera.value.position.x = Math.round(camera.value.position.x * 100) / 100
      camera.value.position.y = Math.round(camera.value.position.y * 100) / 100
      camera.value.position.z = Math.round(camera.value.position.z * 100) / 100
    }

    // 渲染3D场景
    renderer.value.render(scene.value, camera.value)

    // 渲染CSS2D元素
    cssRenderer.value.render(scene.value, camera.value)
  }

  /**
   * 清理资源
   */
  function cleanup() {
    // 取消动画循环
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }

    // 移除事件监听
    window.removeEventListener('resize', onWindowResize)
    window.removeEventListener('keydown', handleKeyDown)

    const container = document.getElementById('three-container')
    if (container) {
      container.removeEventListener('click', onMouseClick)
    }

    // 清理场景中的审核节点
    if (scene.value) {
      // 使用节点管理器清理所有节点
      nodeManager.cleanup(scene.value)
    }

    // 清理THREE.js资源
    if (renderer.value) {
      renderer.value.dispose()
      renderer.value.forceContextLoss()
      renderer.value.domElement.remove()
    }

    if (controls.value) {
      controls.value.dispose()
    }

    // 释放引用
    scene.value = null
    camera.value = null
    renderer.value = null
    cssRenderer.value = null
    controls.value = null
    raycaster.value = null
    mouse.value = null
    calendarScene = null
    highlightedObject = null

    // 停止动画
    stopFlowAnimation()

    // 移除文件图标
    if (fileIcon && scene.value) {
      ;(scene.value as THREE.Scene).remove(fileIcon as THREE.Object3D)
      fileIcon = null
    }

    // 移除键盘事件监听器
    window.removeEventListener('keydown', handleKeyDown)

    // 移除现有的控制帮助和状态提示
    const helpElement = document.getElementById('flow-controls-help')
    if (helpElement && document.body.contains(helpElement)) {
      document.body.removeChild(helpElement)
    }

    document.querySelectorAll('.floating-status-panel').forEach((element) => {
      if (document.body.contains(element)) {
        document.body.removeChild(element)
      }
    })
  }

  /**
   * 获取节点对应的文件类型
   * 基于nodeTree数据，根据审核人和日期匹配找到对应的文件类型
   */
  function getNodeFileType(reviewerName: string, date: string): string {
    // 查找审核人ID
    const reviewer = reviewers.value.find((r) => r.name === reviewerName)
    if (!reviewer) {
      return '文档'
    }

    const reviewerId = reviewer.id

    // 转换日期格式 (从"6/1"转为"2023-06-01"格式)
    const [month, day] = date.split('/')
    const formattedDate = `2023-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

    // 从节点树中查找匹配的节点
    function findNode(node: NodeData): string | null {
      if (node.reviewerId === reviewerId && node.time === formattedDate) {
        return node.type
      }

      if (node.children) {
        for (const child of node.children) {
          const result = findNode(child)
          if (result) {
            return result
          }
        }
      }

      return null
    }

    // 确保nodeTree.value存在
    if (nodeTree.value) {
      const fileType = findNode(nodeTree.value)
      if (fileType) {
        return fileType
      }
    }

    return '文档'
  }

  /**
   * 启动流程动画
   */
  function startFlowAnimation() {
    if (animationPathPoints.length < 2) {
      return
    }

    isAnimationPlaying = true
    currentStepIndex = 0
    currentTeleportState = TeleportState.STAYING
    stayTime = 0
    moveTimer = 0

    showFloatingStatus('开始演示审核流程', 2500)

    // 显示控制帮助
    showControlsHelp()
  }

  /**
   * 停止流程动画
   */
  function stopFlowAnimation() {
    if (!isAnimationPlaying) {
      return
    }

    isAnimationPlaying = false
    showFloatingStatus('已停止审核流程动画', 2000)
  }

  /**
   * 暂停流程动画
   */
  function pauseFlowAnimation() {
    if (!isAnimationPlaying) {
      return
    }

    isAnimationPlaying = false
    showFloatingStatus('已暂停审核流程动画', 2000)
  }

  /**
   * 继续流程动画
   */
  function resumeFlowAnimation() {
    if (isAnimationPlaying) {
      return
    }

    isAnimationPlaying = true
    showFloatingStatus('继续播放审核流程', 2000)
  }

  /**
   * 重新开始动画
   */
  function restartAnimation() {
    currentStepIndex = 0
    currentTeleportState = TeleportState.STAYING
    stayTime = 0
    moveTimer = 0
    if (!isAnimationPlaying) {
      isAnimationPlaying = true
    }
    showFloatingStatus('重新开始审核流程演示', 2000)
  }

  /**
   * 调整动画速度
   */
  function changeAnimationSpeed(increase: boolean) {
    if (increase) {
      animationSpeed = Math.min(animationSpeed * 1.5, 0.03) // 限制最大速度
      showFloatingStatus(`播放速度增加: ${Math.round((animationSpeed / 0.008) * 100)}%`, 1500)
    } else {
      animationSpeed = Math.max(animationSpeed * 0.6, 0.002) // 限制最小速度
      showFloatingStatus(`播放速度降低: ${Math.round((animationSpeed / 0.008) * 100)}%`, 1500)
    }
  }

  /**
   * 显示控制帮助信息 - 改进版本
   */
  function showControlsHelp() {
    // 移除已存在的帮助面板
    const existingHelp = document.getElementById('flow-controls-help')
    if (existingHelp && document.body.contains(existingHelp)) {
      document.body.removeChild(existingHelp)
    }

    // 创建帮助提示元素
    const helpDiv = document.createElement('div')
    helpDiv.style.position = 'fixed'
    helpDiv.style.bottom = '20px'
    helpDiv.style.right = '20px'
    helpDiv.style.backgroundColor = 'rgba(10, 30, 70, 0.85)'
    helpDiv.style.color = 'white'
    helpDiv.style.padding = '12px'
    helpDiv.style.borderRadius = '8px'
    helpDiv.style.zIndex = '1500'
    helpDiv.style.fontFamily = 'Microsoft YaHei, sans-serif'
    helpDiv.style.fontSize = '12px'
    helpDiv.style.maxWidth = '180px'
    helpDiv.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)'
    helpDiv.style.backdropFilter = 'blur(5px)'
    helpDiv.style.border = '1px solid rgba(58, 154, 223, 0.5)'
    helpDiv.style.transition = 'all 0.3s ease'
    helpDiv.style.opacity = '0'
    helpDiv.style.transform = 'translateY(20px)'
    helpDiv.id = 'flow-controls-help'

    // 帮助内容 - 更精美的格式
    helpDiv.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px; color: #8acdff; font-size: 13px;">审核流程控制:</div>
      <div style="border-bottom: 1px solid rgba(58, 154, 223, 0.3); margin: 5px 0;"></div>
      <div style="display: flex; align-items: center; margin: 5px 0;">
        <div style="background: #ffffff; color: #0a1e46; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 10px; margin-right: 8px;">空格</div>
        <div>播放/暂停</div>
      </div>
      <div style="display: flex; align-items: center; margin: 5px 0;">
        <div style="background: #ffffff; color: #0a1e46; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 10px; margin-right: 8px;">R</div>
        <div>重新开始</div>
      </div>
      <div style="display: flex; align-items: center; margin: 5px 0;">
        <div style="background: #ffffff; color: #0a1e46; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 10px; margin-right: 8px;">↑</div>
        <div>加快速度</div>
      </div>
      <div style="display: flex; align-items: center; margin: 5px 0;">
        <div style="background: #ffffff; color: #0a1e46; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 10px; margin-right: 8px;">↓</div>
        <div>减慢速度</div>
      </div>
    `

    // 添加到页面
    document.body.appendChild(helpDiv)

    // 添加淡入效果
    setTimeout(() => {
      helpDiv.style.opacity = '0.9'
      helpDiv.style.transform = 'translateY(0)'
    }, 10)

    // 添加悬停效果
    helpDiv.addEventListener('mouseenter', () => {
      helpDiv.style.opacity = '1'
    })

    helpDiv.addEventListener('mouseleave', () => {
      helpDiv.style.opacity = '0.9'
    })

    // 10秒后淡出
    setTimeout(() => {
      helpDiv.style.opacity = '0'
      helpDiv.style.transform = 'translateY(20px)'
      setTimeout(() => {
        if (document.body.contains(helpDiv)) {
          document.body.removeChild(helpDiv)
        }
      }, 300)
    }, 10000)
  }

  /**
   * 切换流程动画播放/暂停状态
   */
  function toggleFlowAnimation() {
    if (isAnimationPlaying) {
      pauseFlowAnimation()
    } else {
      resumeFlowAnimation()
    }
  }

  // 返回公开API
  return {
    initialize,
    cleanup,
    selectedObject,
    startFlowAnimation,
    stopFlowAnimation,
    isAnimationPlaying,
    toggleFlowAnimation,
  }
}
