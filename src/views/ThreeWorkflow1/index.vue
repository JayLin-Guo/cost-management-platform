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
    <div ref="threeContainer" class="three-container" v-show="!isLoading && hasData"></div>

    <!-- CSS2D渲染器容器 - 用于HTML标签 -->
    <div ref="cssContainer" class="css-container" v-show="!isLoading && hasData"></div>

    <!-- 使用任务管理对话框组件 -->
    <el-dialog
      v-model="taskDialogVisible"
      :title="taskDialogType === 'add' ? '新建任务' : '查看任务'"
      width="600px"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      class="task-dialog"
    >
      <TaskForm v-model="formData" :mapOptions="taskBaseDocMap" />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClosed" class="cancel-btn">取消</el-button>
          <el-button
            v-if="taskDialogType !== 'view'"
            type="primary"
            @click="submitForm"
            class="confirm-btn"
          >
            {{ taskDialogType === 'add' ? '保存' : '确认' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch, onBeforeMount } from 'vue'
import useThreeWorkflow1 from './useThreeWorkflow1'
import ProjectHeader from '@/components/ProjectHeader.vue'
import { getWorkflowData } from '@/api/workflow' // 导入API方法、
import { ElMessage } from 'element-plus'
import TaskForm from './components/TaskForm.vue'
import WorkflowHeader from './components/WorkflowHeader.vue'
import { useTask } from './useTask'
import { useInitFetch } from './useInitFetch'

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

// 项目信息
const projectInfo = reactive({
  code: 'PRJ-2025-001',
  startDate: '2025-01-01',
})

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

// 组件卸载时清理资源
onUnmounted(() => {
  workflow.cleanup()
})
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
</style>
