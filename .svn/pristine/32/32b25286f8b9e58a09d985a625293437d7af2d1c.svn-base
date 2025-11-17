<template>
  <div class="workflow-header">
    <!-- 背景动画层 -->
    <div class="header-bg">
      <div class="bg-gradient"></div>
      <div class="bg-particles"></div>
      <div class="bg-grid"></div>
    </div>

    <!-- 主要内容 -->
    <div class="header-content">
      <!-- 左侧：项目标题区域 -->
      <div class="left-section">
        <div class="project-title-container" title="当前项目：{{ projectTitle }}">
          <div class="title-glow"></div>
          <h1 class="project-title">{{ projectTitle }}</h1>
          <div class="title-underline"></div>
        </div>
      </div>

      <!-- 右侧：功能区域 -->
      <div class="right-section">
        <!-- 上部分：时间、个人信息、退出登录 -->
        <div class="top-controls">
          <!-- 时间显示 -->
          <div class="time-display" title="当前系统时间，每秒自动更新">
            <div class="time-glow"></div>
            <div class="time-content">
              <span class="current-time">{{ currentTime }}</span>
              <span class="time-separator">|</span>
              <span class="current-date">{{ currentDate }}</span>
            </div>
          </div>

          <!-- 用户操作区 -->
          <div class="user-controls">
            <button
              class="control-btn user-info-btn"
              title="查看个人信息和账户设置"
              @click="$emit('user-info')"
            >
              <div class="btn-glow"></div>
              <svg class="btn-icon" viewBox="0 0 24 24">
                <path
                  d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"
                />
              </svg>
              <span>个人信息</span>
            </button>

            <button
              class="control-btn logout-btn"
              title="安全退出当前账户"
              @click="$emit('logout')"
            >
              <div class="btn-glow"></div>
              <svg class="btn-icon" viewBox="0 0 24 24">
                <path
                  d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"
                />
              </svg>
              <span>退出登录</span>
            </button>
          </div>
        </div>

        <!-- 下部分：任务选择和操作按钮 -->
        <div class="bottom-controls">
          <!-- 任务选择器 -->
          <div class="task-selector-section">
            <div class="selector-container">
              <div class="selector-glow"></div>
              <div
                class="task-selector"
                title="点击选择不同的工作任务，当前任务将影响3D场景显示的内容"
                @click="toggleTaskList"
              >
                <div class="selector-content">
                  <span class="selector-label">当前任务</span>
                  <span class="selected-task">{{
                    currentTask?.name || currentTask?.title || '选择任务'
                  }}</span>
                  <svg
                    class="selector-arrow"
                    :class="{ rotated: showTaskList }"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                  </svg>
                </div>
              </div>

              <!-- 下拉列表 -->
              <transition name="dropdown">
                <div v-if="showTaskList" class="task-dropdown">
                  <div class="dropdown-bg"></div>
                  <div v-if="!tasksList || tasksList.length === 0" class="task-option">
                    <span>暂无任务数据</span>
                  </div>
                  <div
                    v-for="(task, index) in tasksList"
                    :key="task.id || index"
                    class="task-option"
                    :class="{ active: currentTask?.id === task.id }"
                    @click="selectTask(task)"
                  >
                    <div class="option-glow"></div>
                    <span>{{ task.name || task.title || '未命名任务' }}</span>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <!-- 任务操作按钮组 -->
          <div class="task-actions">
            <button
              class="action-btn add-btn"
              title="创建新的工作任务 (Ctrl+N)"
              @click="$emit('add-task')"
            >
              <div class="btn-glow"></div>
              <svg class="btn-icon" viewBox="0 0 24 24">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
            </button>

            <button
              class="action-btn view-btn"
              :disabled="!currentTask"
              title="查看当前任务的详细信息 (Ctrl+I)"
              @click="$emit('view-task')"
            >
              <div class="btn-glow"></div>
              <svg class="btn-icon" viewBox="0 0 24 24">
                <path
                  d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"
                />
              </svg>
            </button>

            <button
              class="action-btn delete-btn"
              :disabled="!currentTask"
              title="删除当前选中的任务 (Delete)"
              @click="$emit('delete-task')"
            >
              <div class="btn-glow"></div>
              <svg class="btn-icon" viewBox="0 0 24 24">
                <path
                  d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
                />
              </svg>
            </button>

            <!-- 分隔线 -->
            <div class="action-separator"></div>

            <!-- 视角控制按钮 -->
            <button
              class="action-btn rotation-btn"
              title="切换3D视角控制模式：自由视角 ⇄ 锁定视角 (Space)"
              @click="$emit('toggle-rotation')"
            >
              <div class="btn-glow special-glow"></div>
              <svg class="btn-icon" viewBox="0 0 24 24">
                <path
                  d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props
interface Props {
  projectTitle?: string
  currentTask?: any
  tasksList?: any[]
  showTaskList?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  projectTitle: '任丘市2025年农村公路建设工程施工第一标段',
  tasksList: () => [],
  showTaskList: false,
})

// Emits
const emit = defineEmits<{
  'add-task': []
  'view-task': []
  'delete-task': []
  'select-task': [task: any]
  'toggle-task-list': []
  'user-info': []
  logout: []
  'toggle-rotation': []
}>()

// 时间相关
const currentTime = ref('')
const currentDate = ref('')

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// 定时器
let timeInterval: ReturnType<typeof setInterval> | null = null

// 方法
const toggleTaskList = () => {
  emit('toggle-task-list')
}

const selectTask = (task: any) => {
  emit('select-task', task)
}

// 生命周期
onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.workflow-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  z-index: 200;
}

/* 背景层 */
.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    #0a0e27 0%,
    #1a1f3a 25%,
    #2d3561 50%,
    #1a1f3a 75%,
    #0a0e27 100%
  );
  opacity: 0.95;
}

.bg-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 0, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(0, 255, 128, 0.1) 0%, transparent 50%);
  animation: particleFloat 20s ease-in-out infinite;
}

.bg-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 30s linear infinite;
}

/* 主要内容 */
.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  height: 100%;
  padding: 12px 30px;
}

/* 左侧：项目标题区域 */
.left-section {
  flex: 1;
  display: flex;
  align-items: center;
  padding-right: 30px;
}

.project-title-container {
  position: relative;
  width: 100%;
}

.title-glow {
  position: absolute;
  top: -5px;
  left: -10px;
  right: -10px;
  bottom: -5px;
  background: linear-gradient(45deg, #00ffff, #ff00ff, #00ff80);
  border-radius: 8px;
  filter: blur(10px);
  opacity: 0.3;
  animation: titleGlow 3s ease-in-out infinite alternate;
}

.project-title {
  position: relative;
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #00ffff, #ffffff, #00ff80);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
  letter-spacing: 1px;
  line-height: 1.2;
}

.title-underline {
  height: 2px;
  background: linear-gradient(90deg, #00ffff, #ff00ff, #00ff80, #00ffff);
  background-size: 200% 100%;
  border-radius: 1px;
  margin-top: 6px;
  animation: underlineFlow 2s linear infinite;
}

/* 右侧：功能区域 */
.right-section {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 420px;
  gap: 8px;
}

/* 上部分：时间、个人信息、退出登录 */
.top-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

/* 时间显示 */
.time-display {
  position: relative;
  text-align: left;
}

.time-glow {
  position: absolute;
  top: -5px;
  left: -10px;
  right: -10px;
  bottom: -5px;
  background: radial-gradient(circle, rgba(0, 255, 255, 0.2), transparent);
  border-radius: 8px;
  filter: blur(10px);
  animation: timeGlow 2s ease-in-out infinite alternate;
}

.time-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Courier New', monospace;
}

.current-time {
  font-size: 16px;
  font-weight: 700;
  color: #00ffff;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
}

.time-separator {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.current-date {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

/* 用户操作区 */
.user-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(20, 30, 60, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.control-btn .btn-icon {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.user-info-btn {
  border-color: rgba(0, 200, 255, 0.3);
  color: #00c8ff;
}

.user-info-btn:hover {
  box-shadow: 0 6px 20px rgba(0, 200, 255, 0.3);
  border-color: rgba(0, 200, 255, 0.6);
  transform: translateY(-1px);
}

.logout-btn {
  border-color: rgba(255, 150, 100, 0.3);
  color: #ff9664;
}

.logout-btn:hover {
  box-shadow: 0 6px 20px rgba(255, 150, 100, 0.3);
  border-color: rgba(255, 150, 100, 0.6);
  transform: translateY(-1px);
}

/* 下部分：任务选择和操作按钮 */
.bottom-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* 任务选择器 */
.task-selector-section {
  flex: 1;
  max-width: 240px;
}

.selector-container {
  position: relative;
}

.selector-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #00ffff, #ff00ff);
  border-radius: 8px;
  filter: blur(8px);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.task-selector:hover .selector-glow {
  opacity: 0.4;
}

.task-selector {
  position: relative;
  background: rgba(20, 30, 60, 0.9);
  border: 2px solid rgba(0, 255, 255, 0.4);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(15px);
}

.task-selector:hover {
  border-color: rgba(0, 255, 255, 0.7);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
}

.selector-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  gap: 8px;
}

.selector-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  white-space: nowrap;
}

.selected-task {
  font-size: 13px;
  font-weight: 700;
  color: #00ff80;
  text-shadow: 0 0 10px rgba(0, 255, 128, 0.5);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 8px;
}

.selector-arrow {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  fill: #00ffff;
  transition: transform 0.3s ease;
}

.selector-arrow.rotated {
  transform: translateY(-50%) rotate(180deg);
}

/* 任务操作按钮组 */
.task-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 分隔线 */
.action-separator {
  width: 1px;
  height: 24px;
  background: linear-gradient(to bottom, transparent, rgba(0, 255, 255, 0.5), transparent);
  margin: 0 4px;
}

.action-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: rgba(20, 30, 60, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.btn-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.action-btn:hover .btn-glow {
  left: 100%;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 255, 255, 0.3);
  border-color: rgba(0, 255, 255, 0.6);
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.add-btn {
  border-color: rgba(0, 255, 128, 0.3);
  color: #00ff80;
}

.add-btn:hover {
  box-shadow: 0 6px 20px rgba(0, 255, 128, 0.3);
  border-color: rgba(0, 255, 128, 0.6);
}

.view-btn {
  border-color: rgba(0, 200, 255, 0.3);
  color: #00c8ff;
}

.view-btn:hover {
  box-shadow: 0 6px 20px rgba(0, 200, 255, 0.3);
  border-color: rgba(0, 200, 255, 0.6);
}

.delete-btn {
  border-color: rgba(255, 100, 100, 0.3);
  color: #ff6464;
}

.delete-btn:hover {
  box-shadow: 0 6px 20px rgba(255, 100, 100, 0.3);
  border-color: rgba(255, 100, 100, 0.6);
}

.rotation-btn {
  border-color: rgba(255, 165, 0, 0.4);
  color: #ffa500;
  position: relative;
}

.rotation-btn::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #ffa500, #ff6b35, #ffa500);
  border-radius: 6px;
  z-index: -1;
  opacity: 0.3;
  animation: rotationGlow 2s ease-in-out infinite alternate;
}

.rotation-btn:hover {
  box-shadow: 0 6px 20px rgba(255, 165, 0, 0.4);
  border-color: rgba(255, 165, 0, 0.7);
  transform: translateY(-1px) scale(1.05);
}

.special-glow {
  background: linear-gradient(90deg, transparent, rgba(255, 165, 0, 0.3), transparent);
}

@keyframes rotationGlow {
  0% {
    opacity: 0.2;
    transform: scale(1);
  }
  100% {
    opacity: 0.5;
    transform: scale(1.02);
  }
}

/* 下拉列表 */
.task-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 6px;
  background: rgba(15, 25, 50, 0.95);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  backdrop-filter: blur(20px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  max-height: 180px;
  overflow-y: auto;
  z-index: 300;
}

.dropdown-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.05), rgba(255, 0, 255, 0.05));
  border-radius: 6px;
}

.task-option {
  position: relative;
  padding: 10px 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
  font-size: 13px;
  color: #ffffff;
}

.option-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.task-option:hover .option-glow {
  opacity: 1;
}

.task-option.active {
  background: rgba(0, 255, 255, 0.1);
  color: #00ffff;
}

/* 动画 */
@keyframes particleFloat {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(180deg);
  }
}

@keyframes gridMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

@keyframes titleGlow {
  0% {
    opacity: 0.2;
    filter: blur(10px);
  }
  100% {
    opacity: 0.4;
    filter: blur(15px);
  }
}

@keyframes underlineFlow {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}

@keyframes timeGlow {
  0% {
    opacity: 0.3;
  }
  100% {
    opacity: 0.6;
  }
}

/* 过渡动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .right-section {
    min-width: 380px;
  }

  .task-selector-section {
    max-width: 200px;
  }
}

@media (max-width: 768px) {
  .workflow-header {
    height: 100px;
  }

  .header-content {
    flex-direction: column;
    padding: 10px 20px;
    gap: 10px;
  }

  .left-section {
    padding-right: 0;
  }

  .right-section {
    min-width: auto;
    gap: 8px;
  }

  .top-controls {
    flex-direction: column;
    gap: 8px;
  }

  .bottom-controls {
    flex-direction: column;
    gap: 8px;
  }

  .task-selector-section {
    max-width: none;
  }

  .task-actions {
    flex-wrap: wrap;
    gap: 6px;
  }
}
</style>
