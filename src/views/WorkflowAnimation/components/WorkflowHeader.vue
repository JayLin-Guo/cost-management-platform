<template>
  <div class="workflow-header">
    <!-- 背景动画层 -->
    <div class="header-bg">
      <div class="bg-gradient"></div>
    
      <div class="bg-grid"></div>
    </div>

    <!-- 主要内容 -->
    <div class="header-content">
      <!-- 左侧：项目标题区域 -->
      <div class="left-section">
        <div class="project-title-container" title="工作流程动画展示系统">
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

        <!-- 下部分：系统状态和动画控制 -->
        <div class="bottom-controls">
          <!-- 系统状态显示 -->
          <div class="status-section">
            <div class="status-display">
              <div class="status-glow"></div>
              <div class="status-content">
                <div class="status-item">
                  <div class="status-icon active">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                      <path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <span class="status-text">系统运行中</span>
                </div>
                <div class="status-divider"></div>
                <div class="status-item">
                  <div class="status-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" 
                            stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <span class="status-text">{{ nodeCount }} 个节点</span>
                </div>
                <div class="status-divider"></div>
                <div class="status-item">
                  <div class="status-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" 
                            stroke="currentColor" stroke-width="2"/>
                      <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                      <path d="m22 21-3-3m0 0a2 2 0 0 0 0-4 2 2 0 0 0 0 4z" 
                            stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <span class="status-text">{{ reviewerCount }} 位审核员</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 动画控制按钮组 -->
          <div class="animation-controls">
            <button
              class="action-btn reset-btn"
              title="重置动画到初始状态"
              @click="$emit('reset-animation')"
            >
              <div class="btn-glow"></div>
              <svg class="btn-icon" viewBox="0 0 24 24">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" 
                      stroke="currentColor" stroke-width="2"/>
                <path d="M21 3v5h-5" stroke="currentColor" stroke-width="2"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" 
                      stroke="currentColor" stroke-width="2"/>
                <path d="M8 16H3v5" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>

            <button
              class="action-btn play-btn"
              :class="{ active: isPlaying }"
              title="播放/暂停动画"
              @click="$emit('toggle-animation')"
            >
              <div class="btn-glow special-glow"></div>
              <svg class="btn-icon" viewBox="0 0 24 24">
                <polygon v-if="!isPlaying" points="5,3 19,12 5,21" fill="currentColor"/>
                <rect v-else x="6" y="4" width="4" height="16" fill="currentColor"/>
                <rect v-else x="14" y="4" width="4" height="16" fill="currentColor"/>
              </svg>
            </button>

            <!-- 分隔线 -->
            <div class="action-separator"></div>

            <!-- 视图模式切换按钮 -->
            <button
              class="action-btn view-btn"
              title="切换视图模式"
              @click="$emit('toggle-view')"
            >
              <div class="btn-glow"></div>
              <svg class="btn-icon" viewBox="0 0 24 24">
                <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Props
interface Props {
  projectTitle?: string
  nodeCount?: number
  reviewerCount?: number
  isPlaying?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  projectTitle: '工作流程动画展示系统',
  nodeCount: 0,
  reviewerCount: 0,
  isPlaying: false,
})

// Emits
const emit = defineEmits<{
  'user-info': []
  'logout': []
  'reset-animation': []
  'toggle-animation': []
  'toggle-view': []
}>()

// 时间显示
const currentTime = ref('')
const currentDate = ref('')

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false })
  currentDate.value = now.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  })
}

let timeInterval: NodeJS.Timeout

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
  min-width: 500px;
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

.control-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 255, 255, 0.3);
  border-color: rgba(0, 255, 255, 0.6);
}

/* 下部分：系统状态和动画控制 */
.bottom-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

/* 系统状态显示 */
.status-section {
  flex: 1;
}

.status-display {
  position: relative;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: rgba(20, 30, 60, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 4px;
  backdrop-filter: blur(10px);
}

.status-glow {
  position: absolute;
  top: -5px;
  left: -10px;
  right: -10px;
  bottom: -5px;
  background: radial-gradient(circle, rgba(0, 255, 255, 0.1), transparent);
  border-radius: 8px;
  filter: blur(10px);
}

.status-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-icon {
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.7);
}

.status-icon.active {
  color: #00ff80;
}

.status-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.status-divider {
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.3);
}

/* 动画控制按钮组 */
.animation-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
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

.btn-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.reset-btn {
  border-color: rgba(255, 140, 22, 0.3);
  color: #ff8c16;
}

.reset-btn:hover {
  box-shadow: 0 6px 20px rgba(255, 140, 22, 0.3);
  border-color: rgba(255, 140, 22, 0.6);
}

.play-btn {
  border-color: rgba(0, 255, 128, 0.3);
  color: #00ff80;
}

.play-btn:hover {
  box-shadow: 0 6px 20px rgba(0, 255, 128, 0.3);
  border-color: rgba(0, 255, 128, 0.6);
}

.play-btn.active {
  background: rgba(0, 255, 128, 0.1);
  border-color: rgba(0, 255, 128, 0.6);
  box-shadow: 0 0 15px rgba(0, 255, 128, 0.3);
}

.view-btn {
  border-color: rgba(0, 200, 255, 0.3);
  color: #00c8ff;
}

.view-btn:hover {
  box-shadow: 0 6px 20px rgba(0, 200, 255, 0.3);
  border-color: rgba(0, 200, 255, 0.6);
}

.special-glow {
  background: linear-gradient(90deg, transparent, rgba(0, 255, 128, 0.3), transparent);
}

.action-separator {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.3);
}

/* 动画 */
@keyframes particleFloat {
  0%, 100% {
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

/* 响应式设计 */
@media (max-width: 1024px) {
  .right-section {
    min-width: 420px;
  }
}

@media (max-width: 768px) {
  .workflow-header {
    height: 100px;
  }
  
  .header-content {
    padding: 10px 20px;
  }
  
  .project-title {
    font-size: 18px;
  }
  
  .right-section {
    min-width: 350px;
  }
}
</style> 