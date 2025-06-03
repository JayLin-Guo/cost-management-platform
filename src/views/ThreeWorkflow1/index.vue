<template>
  <div class="workflow-container">
    <!-- 添加项目头部 -->
    <ProjectHeader />

    <!-- 项目任务标题和管理区域 -->
    <div class="project-task-header">
      <div class="project-task-info">
        <h1 class="project-title">任丘市2025年农村公路建设工程施工第一标段 </h1>
        <div class="project-info-container">
          <div class="task-info-area">
            <div class="task-name-display">{{ currentTask?.name || '未选择任务' }}</div>
            <div class="task-actions">
              <button class="task-action-btn add-btn" @click="handleAddTask">
                <svg viewBox="0 0 24 24" class="action-icon">
                  <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                </svg>
                <span>新增</span>
              </button>
              <button
                class="task-action-btn view-btn"
                @click="handleViewTask"
                :disabled="!currentTask"
              >
                <svg viewBox="0 0 24 24" class="action-icon">
                  <path
                    d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"
                  />
                </svg>
                <span>查看</span>
              </button>
              <button
                class="task-action-btn delete-btn"
                @click="handleDeleteTask"
                :disabled="!currentTask"
              >
                <svg viewBox="0 0 24 24" class="action-icon">
                  <path
                    d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
                  />
                </svg>
                <span>删除</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 任务选择器 -->
      <div class="task-selector-container">
        <div class="task-selector">
          <div class="current-task" @click="toggleTaskList">
            <span class="task-name">{{ currentTask?.name || '选择任务' }}</span>
            <span class="task-arrow">
              <svg viewBox="0 0 24 24" class="arrow-icon">
                <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
              </svg>
            </span>
          </div>
          <div class="task-dropdown" v-if="showTaskList">
            <div
              v-for="(task, index) in tasksList"
              :key="index"
              class="task-item"
              :class="{ active: currentTask?.id === task.id }"
              @click="selectTask(task)"
            >
              {{ task.name }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加控制按钮 -->
    <div class="workflow-side-controls-panel">
      <button class="workflow-control-button" @click="toggleRotationLimits">
        {{ isRotationLimited ? '开启自由视角' : '锁定视角' }}
      </button>
    </div>

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
            :type="taskDialogType === 'delete' ? 'danger' : 'primary'"
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
import { useTask } from './useTask'
import { useInitFetch } from './useInitFetch'

// DOM引用
const threeContainer = ref<HTMLElement | null>(null)
const cssContainer = ref<HTMLElement | null>(null)

// 工作流数据
const workflowData = reactive({
  reviewers: [],
  timePoints: [],
  workflowNodes: [],
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

/* 项目任务标题和管理区域 */
.project-task-header {
  padding: 12px 20px;
  background: linear-gradient(90deg, #0a1535 0%, #152253 50%, #0a1535 100%);
  border-bottom: 1px solid rgba(100, 150, 255, 0.3);
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-task-info {
  flex: 1;
}

.project-title {
  font-size: 18px;
  margin: 0 0 5px 0;
  color: #00ccff;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(0, 200, 255, 0.5);
}

.project-info-container {
  display: flex;
  flex-direction: column;
}

.project-name {
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 5px;
}

.task-info-area {
  display: flex;
  align-items: center;
  gap: 15px;
}

.task-name-display {
  font-size: 16px;
  font-weight: 500;
  color: #00ffcc;
  text-shadow: 0 0 8px rgba(0, 255, 204, 0.5);
}

.task-actions {
  display: flex;
  gap: 10px;
}

.task-action-btn {
  display: flex;
  align-items: center;
  background: rgba(30, 40, 100, 0.5);
  border: 1px solid rgba(100, 150, 255, 0.3);
  border-radius: 4px;
  padding: 4px 10px;
  color: #ffffff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.task-action-btn:hover {
  background: rgba(40, 60, 120, 0.7);
  border-color: rgba(100, 150, 255, 0.5);
  box-shadow: 0 0 10px rgba(100, 150, 255, 0.2);
}

.task-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
  margin-right: 5px;
}

.add-btn {
  color: #00ffcc;
}

.view-btn {
  color: #00ccff;
}

.delete-btn {
  color: #ff6b6b;
}

.task-selector-container {
  min-width: 250px;
  margin-left: 20px;
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
  position: relative;
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  background: linear-gradient(90deg, #0a1535 0%, #152253 50%, #0a1535 100%);
  border-top: 1px solid rgba(100, 150, 255, 0.3);
  border-bottom: 1px solid rgba(100, 150, 255, 0.3);
  z-index: 90;
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

/* 任务选择器 */
.task-selector {
  position: relative;
  width: 100%;
  z-index: 20;
}

.current-task {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(30, 40, 100, 0.5);
  border: 1px solid rgba(100, 150, 255, 0.3);
  border-radius: 4px;
  padding: 5px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.current-task:hover {
  background: rgba(40, 50, 120, 0.5);
  border-color: rgba(100, 150, 255, 0.5);
  box-shadow: 0 0 10px rgba(100, 150, 255, 0.2);
}

.task-name {
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.arrow-icon {
  width: 16px;
  height: 16px;
  fill: #00ccff;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  margin-left: 5px;
}

.task-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: rgba(20, 30, 80, 0.95);
  border: 1px solid rgba(100, 150, 255, 0.3);
  border-radius: 4px;
  margin-top: 5px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  max-height: 200px;
  overflow-y: auto;
  z-index: 30;
  animation: fadeIn 0.2s ease-out;
}

.task-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(100, 150, 255, 0.1);
  font-size: 13px;
}

.task-item:hover {
  background: rgba(100, 150, 255, 0.2);
}

.task-item.active {
  background: rgba(100, 150, 255, 0.3);
  color: #00ccff;
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

/* 控制面板样式 - 使用唯一类名 */
.workflow-side-controls-panel {
  position: absolute;
  top: 200px; /* 使用固定的精确数值 */
  left: 30px; /* 使用固定的精确数值 */
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.workflow-control-button {
  background: rgba(40, 60, 100, 0.7);
  color: white;
  border: 1px solid rgba(100, 150, 255, 0.5);
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-family: 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  width: 100px;
  text-align: center;
}

.workflow-control-button:hover {
  background: rgba(60, 90, 150, 0.8);
  border-color: rgba(120, 180, 255, 0.8);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .task-selector-container {
    width: 100%;
    margin-left: 0;
  }

  .task-info-area {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

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
