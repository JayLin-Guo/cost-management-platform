<template>
  <teleport to="body">
    <!-- 审核节点右键菜单 -->
    <ReviewNodeContextMenu
      v-if="currentMenu.type === 'review'"
      :visible="currentMenu.visible"
      :x="currentMenu.x"
      :y="currentMenu.y"
      :node-data="currentMenu.nodeData"
      @close="closeMenu"
      @approve="handleApprove"
      @reject="handleReject"
      @view-details="handleViewDetails"
      @add-comment="handleAddComment"
      @assign-reviewer="handleAssignReviewer"
      @view-history="handleViewHistory"
    />
    
    <!-- 可以继续添加其他类型的菜单 -->
  </teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ReviewNodeContextMenu from './ReviewNodeContextMenu.vue'
import { useContextMenuDetector } from '../../hooks/useContextMenuDetector'
import { useContextMenuPositioning } from '../../hooks/useContextMenuPositioning'

export interface ContextMenuState {
  visible: boolean
  type: 'review' | 'status' | null
  x: number
  y: number
  nodeData: any
}

interface Props {
  // Three.js 相关对象
  camera?: any
  renderer?: any
  scene?: any
  nodeGroup?: any
  // 节点数据查找函数
  nodeDataFinder?: (nodeId: string) => any
  // 是否启用右键菜单
  enabled?: boolean
}

interface Emits {
  (e: 'menu-action', action: string, nodeData: any): void
}

const props = withDefaults(defineProps<Props>(), {
  enabled: true
})

const emit = defineEmits<Emits>()

// 当前菜单状态
const currentMenu = ref<ContextMenuState>({
  visible: false,
  type: null,
  x: 0,
  y: 0,
  nodeData: null
})

// 使用检测器和定位器
const { detectClickedNode } = useContextMenuDetector()
const { calculateMenuPosition } = useContextMenuPositioning()

// 右键事件处理
function handleContextMenu(event: MouseEvent) {
  console.log('右键事件触发:', {
    enabled: props.enabled,
    camera: props.camera,
    renderer: props.renderer,
    scene: props.scene,
    nodeGroup: props.nodeGroup,
    nodeDataFinder: props.nodeDataFinder
  })
  
  if (!props.enabled) {
    console.log('右键菜单被禁用')
    return
  }
  
  event.preventDefault()
  
  console.log('开始检测点击的节点...')
  // 在运行时传递 Three.js 对象，包括节点组
  const nodeInfo = detectClickedNode(event, props.nodeDataFinder, props.scene, props.camera, props.renderer, props.nodeGroup)
  console.log('节点检测结果:', nodeInfo)
  
  if (nodeInfo && nodeInfo.type === 'review') {
    console.log('检测到审核节点，计算菜单位置...')
    const position = calculateMenuPosition(
      event, 
      nodeInfo, 
      undefined, // 使用默认菜单配置
      props.camera, 
      props.renderer
    )
    
    currentMenu.value = {
      visible: true,
      type: 'review',
      x: position.x,
      y: position.y,
      nodeData: nodeInfo.data
    }
    
    console.log('显示审核节点右键菜单:', {
      position,
      nodeData: nodeInfo.data,
      menuState: currentMenu.value
    })
  } else {
    console.log('未检测到审核节点，关闭菜单')
    closeMenu()
  }
}

// 关闭菜单
function closeMenu() {
  currentMenu.value.visible = false
  currentMenu.value.type = null
  currentMenu.value.nodeData = null
}

// 键盘事件处理
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && currentMenu.value.visible) {
    closeMenu()
  }
}

// 菜单操作处理
function handleApprove(nodeData: any) {
  console.log('通过审核:', nodeData)
  emit('menu-action', 'approve', nodeData)
}

function handleReject(nodeData: any) {
  console.log('驳回审核:', nodeData)
  emit('menu-action', 'reject', nodeData)
}

function handleViewDetails(nodeData: any) {
  console.log('查看详情:', nodeData)
  emit('menu-action', 'view-details', nodeData)
}

function handleAddComment(nodeData: any) {
  console.log('添加备注:', nodeData)
  emit('menu-action', 'add-comment', nodeData)
}

function handleAssignReviewer(nodeData: any) {
  console.log('指派审核人:', nodeData)
  emit('menu-action', 'assign-reviewer', nodeData)
}

function handleViewHistory(nodeData: any) {
  console.log('查看历史:', nodeData)
  emit('menu-action', 'view-history', nodeData)
}

// 生命周期管理
onMounted(() => {
  console.log('ContextMenuManager 组件挂载，设置事件监听器')
  
  // 等待 Three.js 渲染器准备就绪
  const setupEventListeners = () => {
    if (props.renderer && props.renderer.domElement) {
      console.log('在 Three.js 渲染器 DOM 元素上设置右键事件监听器')
      
      // 在 Three.js 渲染器的 DOM 元素上监听右键事件
      props.renderer.domElement.addEventListener('contextmenu', handleContextMenu)
      
      // 在整个文档上监听点击和键盘事件（用于关闭菜单）
      document.addEventListener('click', closeMenu)
      document.addEventListener('keydown', handleKeydown)
    } else {
      console.log('Three.js 渲染器尚未准备就绪，延迟设置事件监听器')
      // 如果渲染器还没准备好，延迟一点再试
      setTimeout(setupEventListeners, 100)
    }
  }
  
  setupEventListeners()
})

onUnmounted(() => {
  console.log('ContextMenuMenuManager 组件卸载，移除事件监听器')
  
  // 移除 Three.js 渲染器上的事件监听器
  if (props.renderer && props.renderer.domElement) {
    props.renderer.domElement.removeEventListener('contextmenu', handleContextMenu)
  }
  
  // 移除文档上的事件监听器
  document.removeEventListener('click', closeMenu)
  document.removeEventListener('keydown', handleKeydown)
})

// 暴露方法供外部调用
defineExpose({
  showMenu: (type: string, x: number, y: number, nodeData: any) => {
    currentMenu.value = { 
      visible: true, 
      type: type as 'review' | 'status', 
      x, 
      y, 
      nodeData 
    }
  },
  closeMenu,
  isMenuVisible: () => currentMenu.value.visible
})
</script>

<style scoped>
/* 这里可以添加一些全局的菜单样式，如果需要的话 */
</style> 