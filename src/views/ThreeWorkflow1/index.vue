<template>
  <div class="workflow-container">
    <!-- 使用新的头部组件 -->
    <WorkflowHeader
      :project-title="'任丘市2025年农村公路建设工程施工第一标段'"
      :current-task="currentTask"
      :tasks-list="tasksList"
      :show-task-list="showTaskList"
      @add-task="handleAddTask"
      @view-task="handleViewTask"
      @delete-task="handleDeleteTask"
      @select-task="selectTask"
      @toggle-task-list="toggleTaskList"
      @user-info="handleUserInfo"
      @logout="handleLogout"
      @toggle-rotation="toggleRotationLimits"
    />

    <!-- 信息展示区域 -->
    <div class="info-panel">
      <div class="info-panel-bg"></div>

      <!-- 右侧项目信息 -->
      <div class="info-section project-info-section">
        <div class="section-header">
          <svg class="section-icon" viewBox="0 0 24 24">
            <path
              d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M6,20H15L18,20V12L14,16L12,14L6,20M8,9A2,2 0 0,0 6,11A2,2 0 0,0 8,13A2,2 0 0,0 10,11A2,2 0 0,0 8,9Z"
            />
          </svg>
          <span>任务信息</span>
        </div>
        <div class="section-content">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">任务计划结束还剩</span>
              <span class="info-value status-active"> 3天</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载中提示 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">正在加载工作流数据...</div>
    </div>

    <!-- 3D场景容器 -->
    <div v-show="!isLoading && hasData" ref="threeContainer" class="three-container"></div>

    <!-- CSS2D渲染器容器 - 用于HTML标签 -->
    <div v-show="!isLoading && hasData" ref="cssContainer" class="css-container"></div>

    <!-- 使用大屏任务管理对话框组件 -->
    <LargeScreenDialog
      v-model:visible="taskDialogVisible"
      :title="taskDialogType === 'add' ? '新建任务' : '查看任务'"
      width="800px"
      height="700px"
      :close-on-click-modal="false"
    >
      <TaskForm v-model="formData" :map-options="taskBaseDocMap" />
      <template #footer>
        <div class="dialog-footer-actions">
          <button class="large-screen-button secondary" @click="handleDialogClosed">
            <div class="button-bg"></div>
            <span class="button-text">取消</span>
            <div class="button-glow"></div>
          </button>
          <button
            v-if="taskDialogType !== 'view'"
            class="large-screen-button primary"
            @click="submitForm"
          >
            <div class="button-bg"></div>
            <span class="button-text">{{ taskDialogType === 'add' ? '保存' : '确认' }}</span>
            <div class="button-glow"></div>
          </button>
        </div>
      </template>
    </LargeScreenDialog>

    <!-- 状态详情弹窗 -->
    <StatusDetailsDialog v-model:visible="showStatusDialog" :node-data="currentStatusData" />
    
    <!-- 右键菜单管理器 -->
    <ContextMenuManager
      :camera="workflow.getCamera()"
      :renderer="workflow.getRenderer()"
      :scene="workflow.getScene()"
      :node-group="workflow.getNodeGroup()"
      :enabled="true"
      @menu-action="handleMenuAction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch, onBeforeMount } from 'vue'
import useThreeWorkflow1 from './hooks/useThreeWorkflow1'
import { getWorkflowData } from '@/api/newWorkflow' // 导入API方法、
import { ElMessage } from 'element-plus'
import TaskForm from './components/TaskForm.vue'
import WorkflowHeader from './components/WorkflowHeader.vue'
import { useTask } from './hooks/useTask'
import { useInitFetch } from './hooks/useInitFetch'
import { LargeScreenDialog } from '@/components/LargeScreen'
import StatusDetailsDialog from './components/StatusDetailsDialog.vue'
import { ContextMenuManager } from './components/ContextMenu'

// DOM引用
const threeContainer = ref<HTMLElement | null>(null)
const cssContainer = ref<HTMLElement | null>(null)

// 工作流数据
const workflowData = reactive({
  reviewers: [] as any[],
  timePoints: [] as any[],
  workflowNodes: [] as any[],
})

// 数据状态
const isLoading = ref(true)
const hasData = ref(false)
const loadError = ref('')


// 当前选中的任务
const currentTask = ref()

// 选择任务
const selectTask = async (task: any) => {
  currentTask.value = task
  showTaskList.value = false
  // 选择新任务后重新加载数据
  await loadWorkflowData(task.id.toString())
}

const {
  tasksList,
  taskDialogVisible,
  taskDialogType,
  formData,
  showTaskList,
  toggleTaskList,
  initLoadProjectList,
  handleAddTask,
  handleDialogClosed,
  handleViewTask,
  handleDeleteTask,
  submitForm,
} = useTask()

const { taskBaseDocMap, initialized, initAllData } = useInitFetch()

// 创建Three.js工作流渲染器
const workflow = useThreeWorkflow1()

// 旋转限制状态
const isRotationLimited = ref(true)

// 弹窗状态
const reviewNodeDialogVisible = ref(false)
const showStatusDialog = ref(false)
const currentStatusData = ref<any>(null)

// 审核操作表单数据
const reviewFormData = reactive({
  comment: '',
  status: '',
  files: [] as any[],
})

// 禁用浏览器默认右键菜单的函数
const disableContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  return false
}

// 切换旋转限制
function toggleRotationLimits() {
  isRotationLimited.value = workflow.toggleRotationLimits()
}

// 处理用户信息
function handleUserInfo() {
  ElMessage.info('个人信息功能开发中...')
}

// 处理退出登录
function handleLogout() {
  ElMessage.warning('确认退出登录？')
  // 这里可以添加实际的退出登录逻辑
}

// 加载工作流数据
async function loadWorkflowData(taskId: string) {
  try {
    // 显示加载状态
    isLoading.value = true
    hasData.value = false
    loadError.value = ''

    // 清理旧场景
    workflow.cleanup()

    // 请求API数据
    const response = await getWorkflowData(taskId)
    // 更新数据 - 使用 response.data 获取实际数据
    workflowData.reviewers = response.data.reviewers
    workflowData.timePoints = response.data.timePoints
    workflowData.workflowNodes = response.data.workflowNodes
    console.log(workflowData, 'workflowData===>>>')

    // 标记数据已加载
    hasData.value = true

    // 初始化场景
    if (threeContainer.value && cssContainer.value) {
      workflow.initialize(threeContainer.value, cssContainer.value, {
        reviewers: workflowData.reviewers,
        timePoints: workflowData.timePoints,
        workflowNodes: workflowData.workflowNodes,
      })

      // 初始化状态
      isRotationLimited.value = workflow.getRotationLimitState()
    }
  } catch (error) {
    console.error('加载工作流数据失败:', error)
    loadError.value = '数据加载失败，请稍后重试'
  } finally {
    // 无论成功或失败，都结束加载状态
    isLoading.value = false
  }
}

// 组件挂载前初始化数据
onBeforeMount(async () => {
  await initAllData()
  // 加载项目列表
  await initLoadProjectList()
  currentTask.value = tasksList.value[0]
  if (currentTask.value) {
    await loadWorkflowData(currentTask.value.id.toString())
  }
})

// 组件挂载后添加事件监听器
onMounted(() => {
  // 在整个文档上禁用右键菜单
  document.addEventListener('contextmenu', disableContextMenu)
  
  // 监听审核节点点击事件
  document.addEventListener('workflow-review-node-click', handleReviewNodeClick)
  // 监听状态节点点击事件
  document.addEventListener('workflow-status-node-click', handleStatusNodeClick)
  // 监听状态标签点击事件
  document.addEventListener('workflow-status-label-click', handleStatusLabelClick)
  
  // 注意：右键菜单现在由 ContextMenuManager 组件处理，不需要在这里添加监听器
})

// 组件卸载时清理资源
onUnmounted(() => {
  workflow.cleanup()
  
  // 移除禁用右键菜单的事件监听器
  document.removeEventListener('contextmenu', disableContextMenu)
  
  // 移除事件监听器
  document.removeEventListener('workflow-review-node-click', handleReviewNodeClick)
  document.removeEventListener('workflow-status-node-click', handleStatusNodeClick)
  document.removeEventListener('workflow-status-label-click', handleStatusLabelClick)
  
  // 注意：右键菜单现在由 ContextMenuManager 组件处理，不需要在这里移除监听器
})

// 处理审核节点点击
function handleReviewNodeClick(event: any) {
  const { nodeData, userData } = event.detail
  console.log('审核节点被点击:', nodeData)
  console.log('审核节点被点击userData:', userData)

  currentStatusData.value = nodeData
  reviewFormData.comment = ''
  reviewFormData.status = ''
  reviewFormData.files = nodeData.reviewData?.files || []
  // reviewNodeDialogVisible.value = true
  window.open('https://www.baidu.com', '_blank')
}

// 处理状态节点点击
function handleStatusNodeClick(event: any) {
  console.log('状态节点点击事件:', event.detail)

  const { nodeData, fromNodeData, toNodeData, connectionInfo } = event.detail

  console.log('节点数据:', nodeData)
  console.log('前一个节点数据:', fromNodeData)
  console.log('后一个节点数据:', toNodeData)
  console.log('连接信息:', connectionInfo)

  // 准备状态对话框数据
  currentStatusData.value = {
    ...nodeData,
    fromNodeData,
    toNodeData,
    connectionInfo,
  }

  showStatusDialog.value = true
}

// 处理状态标签点击
function handleStatusLabelClick(event: any) {
  const { labelData, nodeData, fromNodeData, toNodeData, connectionInfo } = event.detail

  console.log('状态标签被点击 - 详细信息:', {
    标签数据: labelData,
    当前节点数据: nodeData,
    上一个节点数据: fromNodeData,
    下一个节点数据: toNodeData,
    连接信息: connectionInfo,
  })

  // 构建扩展的节点数据，包含上一个和下一个节点信息
  const extendedNodeData = {
    ...nodeData,
    connectionDetails: {
      previousNode: fromNodeData,
      nextNode: toNodeData,
      connectionStatus: connectionInfo?.status,
      connectionFrom: connectionInfo?.from,
      connectionTo: connectionInfo?.to,
    },
  }

  currentStatusData.value = extendedNodeData
  showStatusDialog.value = true
}

// 节点数据查找函数
function findNodeDataById(nodeId: string) {
  return workflowData.workflowNodes.find(node => node.id === nodeId)
}

// 菜单操作处理
function handleMenuAction(action: string, nodeData: any) {
  console.log(`执行菜单操作: ${action}`, nodeData)
  
  switch (action) {
    case 'approve':
      handleApproveNode(nodeData)
      break
    case 'reject':
      handleRejectNode(nodeData)
      break
    case 'view-details':
      handleViewNodeDetails(nodeData)
      break
    case 'add-comment':
      handleAddNodeComment(nodeData)
      break
    case 'assign-reviewer':
      handleAssignNodeReviewer(nodeData)
      break
    case 'view-history':
      handleViewNodeHistory(nodeData)
      break
    default:
      console.warn('未知的菜单操作:', action)
  }
}

// 审核通过
function handleApproveNode(nodeData: any) {
  ElMessage.success(`审核节点 "${nodeData?.name || nodeData?.title || '未知节点'}" 已通过`)
  // 这里可以调用 API 来更新节点状态
  // await approveReviewNode(nodeData.id)
}

// 审核驳回
function handleRejectNode(nodeData: any) {
  ElMessage.warning(`审核节点 "${nodeData?.name || nodeData?.title || '未知节点'}" 已驳回`)
  // 这里可以调用 API 来更新节点状态
  // await rejectReviewNode(nodeData.id)
}

// 查看详情
function handleViewNodeDetails(nodeData: any) {
  currentStatusData.value = nodeData
  showStatusDialog.value = true
}

// 添加备注
function handleAddNodeComment(nodeData: any) {
  ElMessage.info('添加备注功能开发中...')
  // 这里可以打开备注对话框
}

// 指派审核人
function handleAssignNodeReviewer(nodeData: any) {
  ElMessage.info('指派审核人功能开发中...')
  // 这里可以打开指派对话框
}

// 查看历史
function handleViewNodeHistory(nodeData: any) {
  ElMessage.info('查看历史功能开发中...')
  // 这里可以打开历史记录对话框
}

</script>

<style scoped>
.workflow-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #1a2d7a;
  display: flex;
  flex-direction: column;
}

/* 加载中样式 */
.loading-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(10, 20, 50, 0.9);
  z-index: 100;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 5px solid rgba(100, 150, 255, 0.2);
  border-top-color: #00ccff;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-text {
  color: #00ccff;
  font-size: 18px;
  font-weight: 500;
  text-shadow: 0 0 10px rgba(0, 200, 255, 0.5);
  letter-spacing: 1px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 信息展示区域 */
.info-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  background: linear-gradient(90deg, #0a1535 0%, #152253 50%, #0a1535 100%);
  border-top: 1px solid rgba(100, 150, 255, 0.3);
  border-bottom: 1px solid rgba(100, 150, 255, 0.3);
  z-index: 190;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.info-panel-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(90deg, rgba(0, 100, 255, 0.05) 1px, transparent 1px),
    linear-gradient(0deg, rgba(0, 100, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  z-index: -1;
  animation: moveInfoBg 30s linear infinite;
}

@keyframes moveInfoBg {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: 20px 20px;
  }
}

.info-section {
  display: flex;
  align-items: center;
  color: #ffffff;
  height: 100%;
}

.section-header {
  display: flex;
  align-items: center;
  margin-right: 15px;
  position: relative;
}

.section-header::after {
  content: '';
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 70%;
  background: linear-gradient(to bottom, transparent, rgba(0, 200, 255, 0.8), transparent);
}

.section-icon {
  width: 20px;
  height: 20px;
  fill: #00ccff;
  margin-right: 5px;
  filter: drop-shadow(0 0 3px rgba(0, 200, 255, 0.5));
}

.section-header span {
  font-size: 14px;
  font-weight: bold;
  color: #00ccff;
  text-shadow: 0 0 5px rgba(0, 200, 255, 0.5);
}

.section-content {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

/* 场景容器 */
.three-container {
  flex: 1;
  width: 100%;
}

.css-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .info-panel {
    height: auto;
    flex-direction: column;
    padding: 10px;
  }
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 大屏对话框按钮样式 */
.dialog-footer-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.large-screen-button {
  position: relative;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Microsoft YaHei', sans-serif;
  transition: all 0.3s ease;
  overflow: hidden;
  min-width: 120px;
}

.button-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: all 0.3s ease;
}

.button-text {
  position: relative;
  z-index: 2;
}

.button-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

/* 主要按钮 */
.large-screen-button.primary .button-bg {
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
}

.large-screen-button.primary .button-text {
  color: #000000;
}

.large-screen-button.primary:hover .button-glow {
  opacity: 1;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
}

/* 次要按钮 */
.large-screen-button.secondary .button-bg {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.large-screen-button.secondary .button-text {
  color: #ffffff;
}

.large-screen-button.secondary:hover .button-glow {
  opacity: 1;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

/* 弹窗内容样式 */
.review-dialog-content,
.status-dialog-content {
  padding: 20px;
  color: #ffffff;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #00ccff;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 200, 255, 0.3);
  text-shadow: 0 0 5px rgba(0, 200, 255, 0.5);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0, 50, 100, 0.2);
  border-radius: 6px;
  border: 1px solid rgba(0, 200, 255, 0.2);
}

.info-item .label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin-right: 8px;
  min-width: 80px;
}

.info-item .value {
  font-size: 13px;
  color: #ffffff;
  font-weight: 500;
}

.info-item .value.status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.info-item .value.status.pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.info-item .value.status.in-progress,
.info-item .value.status.reviewing {
  background: rgba(0, 123, 255, 0.2);
  color: #007bff;
  border: 1px solid rgba(0, 123, 255, 0.3);
}

.info-item .value.status.completed,
.info-item .value.status.approved,
.info-item .value.status.success {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.info-item .value.status.rejected,
.info-item .value.status.failed {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.3);
}

.info-item .value.status.cancelled {
  background: rgba(108, 117, 125, 0.2);
  color: #6c757d;
  border: 1px solid rgba(108, 117, 125, 0.3);
}

.comment-section {
  margin-bottom: 20px;
}

.comment-textarea {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  background: rgba(0, 50, 100, 0.2);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 6px;
  color: #ffffff;
  font-size: 14px;
  resize: vertical;
  outline: none;
  transition: border-color 0.3s ease;
}

.comment-textarea:focus {
  border-color: #00ccff;
  box-shadow: 0 0 10px rgba(0, 200, 255, 0.3);
}

.comment-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.files-section {
  margin-bottom: 20px;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(0, 50, 100, 0.2);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 6px;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  font-size: 13px;
  color: #ffffff;
  font-weight: 500;
}

.file-size {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.download-btn {
  padding: 4px 12px;
  background: rgba(0, 200, 255, 0.2);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 4px;
  color: #00ccff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.download-btn:hover {
  background: rgba(0, 200, 255, 0.3);
  box-shadow: 0 0 8px rgba(0, 200, 255, 0.4);
}

.history-section {
  margin-top: 20px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  padding: 12px;
  background: rgba(0, 50, 100, 0.2);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 6px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-header .author {
  font-size: 13px;
  color: #00ccff;
  font-weight: 500;
}

.history-header .time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.history-header .comment-type {
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: bold;
}

.history-header .comment-type.approve {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.history-header .comment-type.reject {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.3);
}

.history-content {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

/* 滚动条样式 */
.history-list::-webkit-scrollbar {
  width: 6px;
}

.history-list::-webkit-scrollbar-track {
  background: rgba(0, 50, 100, 0.2);
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb {
  background: rgba(0, 200, 255, 0.3);
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 200, 255, 0.5);
}

/* 连接关系样式 */
.connection-info-section {
  margin-top: 20px;
  margin-bottom: 20px;
}

.connection-flow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(26, 31, 58, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(0, 204, 255, 0.3);
}

.connection-node {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: rgba(0, 204, 255, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(0, 204, 255, 0.3);
}

.node-header {
  font-size: 12px;
  font-weight: bold;
  color: #00ccff;
  margin-bottom: 8px;
  text-align: center;
}

.node-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.node-id {
  font-size: 13px;
  color: #ffffff;
  font-weight: bold;
  text-align: center;
}

.node-title {
  font-size: 11px;
  color: #cccccc;
  text-align: center;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  text-align: center;
}

.connection-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 16px;
  min-width: 80px;
}

.arrow-line {
  width: 40px;
  height: 2px;
  background: #00ccff;
  margin-bottom: 4px;
}

.arrow-head {
  font-size: 16px;
  color: #00ccff;
  margin-bottom: 4px;
}

.connection-status {
  font-size: 10px;
  color: #ffffff;
  font-weight: 500;
  text-align: center;
  background: rgba(255, 193, 7, 0.2);
  padding: 2px 6px;
  border-radius: 8px;
  border: 1px solid rgba(255, 193, 7, 0.5);
}
</style>
