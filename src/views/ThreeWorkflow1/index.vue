<template>
  <div class="workflow-container">
    <!-- 添加项目头部 -->
    <ProjectHeader />
    
    <!-- 信息展示区域 -->
    <div class="info-panel">
      <div class="info-panel-bg"></div>
      
      <!-- 左侧任务选择器 -->
      <div class="info-section task-selector-section">
        <div class="section-header">
          <svg class="section-icon" viewBox="0 0 24 24">
            <path d="M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M7,7H17V5H19V19H5V5H7V7Z" />
          </svg>
          <span>项目选择</span>
        </div>
        <div class="section-content">
          <div class="task-selector">
            <div class="current-task" @click="toggleTaskList">
              <span class="task-name">{{ currentTask.name }}</span>
              <span class="task-arrow">
                <svg viewBox="0 0 24 24" class="arrow-icon">
                  <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                </svg>
              </span>
            </div>
            <div class="task-dropdown" v-if="showTaskList">
              <div 
                v-for="(task, index) in tasks" 
                :key="index" 
                class="task-item"
                :class="{ 'active': currentTask.id === task.id }"
                @click="selectTask(task)"
              >
                {{ task.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧项目信息 -->
      <div class="info-section project-info-section">
        <div class="section-header">
          <svg class="section-icon" viewBox="0 0 24 24">
            <path d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M6,20H15L18,20V12L14,16L12,14L6,20M8,9A2,2 0 0,0 6,11A2,2 0 0,0 8,13A2,2 0 0,0 10,11A2,2 0 0,0 8,9Z" />
          </svg>
          <span>项目信息</span>
        </div>
        <div class="section-content">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">项目编号:</span>
              <span class="info-value">{{ projectInfo.code }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">开始日期:</span>
              <span class="info-value">{{ projectInfo.startDate }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">当前阶段:</span>
              <span class="info-value status-active">施工中</span>
            </div>
            <div class="info-item">
              <span class="info-label">完成度:</span>
              <span class="info-value">65%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 3D场景容器 -->
    <div ref="threeContainer" class="three-container"></div>

    <!-- CSS2D渲染器容器 - 用于HTML标签 -->
    <div ref="cssContainer" class="css-container"></div>

    <!-- 视角控制按钮 -->
    <!-- <div class="view-controls">
      <button @click="changeView('default')" class="view-btn">默认视角</button>
      <button @click="changeView('top')" class="view-btn">顶视图</button>
      <button @click="changeView('side')" class="view-btn">侧视图</button>
      <button @click="changeView('front')" class="view-btn">正视图</button>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import useThreeWorkflow1 from './useThreeWorkflow1'
import ProjectHeader from '../../components/ProjectHeader.vue'

// DOM引用
const threeContainer = ref(null)
const cssContainer = ref(null)

// 项目信息
const projectInfo = reactive({
  code: 'PRJ-2025-001',
  startDate: '2025-01-01'
})

// 任务列表
const tasks = ref([
  { id: 1, name: '任丘市2025年农村公路建设工程施工第一标段' },
  { id: 2, name: '城市道路改造工程-2025' },
  { id: 3, name: '高速公路扩建工程-东段' },
  { id: 4, name: '桥梁维修加固工程-2025' },
  { id: 5, name: '隧道施工工程-北段' }
])

// 当前选中的任务
const currentTask = ref(tasks.value[0])

// 是否显示任务列表
const showTaskList = ref(false)

// 切换任务列表显示状态
const toggleTaskList = () => {
  showTaskList.value = !showTaskList.value
}

// 选择任务
const selectTask = (task: any) => {
  currentTask.value = task
  showTaskList.value = false
}

// 在组件外部点击时关闭任务列表
const handleClickOutside = (event: MouseEvent) => {
  const taskSelector = document.querySelector('.task-selector')
  if (taskSelector && !taskSelector.contains(event.target as Node)) {
    showTaskList.value = false
  }
}

// 使用Three.js工作流
const { initialize, cleanup, changeViewpoint } = useThreeWorkflow1()

// 组件挂载时初始化3D场景
onMounted(() => {
  if (threeContainer.value && cssContainer.value) {
    // 初始化场景
    initialize(threeContainer.value, cssContainer.value)
  }
  
  // 添加全局点击事件监听器
  document.addEventListener('click', handleClickOutside)
})

// 视角切换函数
const changeView = (viewType: 'default' | 'top' | 'side' | 'front') => {
  changeViewpoint(viewType)
}

// 组件卸载时清理资源
onUnmounted(() => {
  cleanup()
  document.removeEventListener('click', handleClickOutside)
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
.task-selector-section {
  flex: 1;
  max-width: 600px;
}

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
  padding: 2px 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  max-width: 400px;
}

.current-task:hover {
  background: rgba(40, 50, 120, 0.5);
  border-color: rgba(100, 150, 255, 0.5);
  box-shadow: 0 0 10px rgba(100, 150, 255, 0.2);
}

.task-name {
  font-size: 12px;
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
  padding: 8px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(100, 150, 255, 0.1);
  font-size: 12px;
}

.task-item:hover {
  background: rgba(100, 150, 255, 0.2);
}

.task-item.active {
  background: rgba(100, 150, 255, 0.3);
  color: #00ccff;
}

/* 项目信息 */
.project-info-section {
  display: flex;
  align-items: center;
}

.info-grid {
  display: flex;
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-label {
  color: rgba(255, 255, 255, 0.7);
  margin-right: 5px;
  font-size: 12px;
}

.info-value {
  color: #00ccff;
  font-weight: 500;
  font-size: 12px;
  text-shadow: 0 0 5px rgba(0, 204, 255, 0.5);
}

.status-active {
  color: #00ff00;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
}

.three-container {
  flex: 1;
  width: 100%;
  height: calc(100% - 100px); /* 减去头部和信息面板高度 */
}

.css-container {
  position: absolute;
  top: 100px; /* 头部和信息面板高度 */
  left: 0;
  width: 100%;
  height: calc(100% - 100px); /* 减去头部和信息面板高度 */
  pointer-events: none;
}

.view-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 100;
}

.view-btn {
  background: rgba(30, 60, 100, 0.8);
  color: white;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;
  font-family: 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.view-btn:hover {
  background: rgba(40, 80, 130, 0.9);
  border-color: rgba(0, 255, 255, 0.6);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
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

/* 响应式设计 */
@media (max-width: 768px) {
  .info-panel {
    height: auto;
    flex-direction: column;
    padding: 10px;
  }
  
  .info-section {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .view-controls {
    bottom: 10px;
    gap: 5px;
  }
  
  .view-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
