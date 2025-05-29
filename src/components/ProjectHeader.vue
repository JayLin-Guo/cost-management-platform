<template>
  <div class="project-header">
    <!-- 背景效果 -->
    <div class="header-bg">
      <div class="bg-gradient"></div>
      <div class="bg-lines"></div>
      <div class="bg-glow"></div>
    </div>
    
    <!-- 主标题区域 -->
    <div class="main-title">
      <div class="title-icon">
        <svg viewBox="0 0 24 24" class="icon-svg">
          <path d="M3,3H21V21H3V3M7.73,18.04C8.13,18.89 8.92,19.59 10.27,19.59C11.77,19.59 12.8,18.79 12.8,17.04V11.26H11.1V17C11.1,17.86 10.75,18.08 10.2,18.08C9.62,18.08 9.38,17.68 9.11,17.21L7.73,18.04M13.71,17.86C14.21,18.84 15.22,19.59 16.8,19.59C18.4,19.59 19.6,18.76 19.6,17.23C19.6,15.82 18.79,15.19 17.35,14.57L16.93,14.39C16.2,14.08 15.89,13.87 15.89,13.37C15.89,12.96 16.2,12.64 16.7,12.64C17.18,12.64 17.5,12.85 17.79,13.37L19.1,12.5C18.55,11.54 17.77,11.17 16.7,11.17C15.19,11.17 14.22,12.13 14.22,13.4C14.22,14.78 15.03,15.43 16.25,15.95L16.67,16.13C17.45,16.47 17.91,16.68 17.91,17.26C17.91,17.74 17.46,18.09 16.76,18.09C15.93,18.09 15.45,17.66 15.09,17.06L13.71,17.86Z" />
        </svg>
      </div>
      <div class="title-text">任丘市2025年农村公路建设工程</div>
    </div>
    
    <!-- 占位空间，替代原来的任务选择器 -->
    <div class="spacer"></div>
    
    <!-- 右侧信息 -->
    <div class="header-info">
      <div class="info-item">
        <span class="info-label">项目编号:</span>
        <span class="info-value">{{ projectInfo.code }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">日期:</span>
        <span class="info-value">{{ currentDate }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">时间:</span>
        <span class="info-value">{{ currentTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'

// 项目信息
const projectInfo = reactive({
  code: 'PRJ-2025-001',
  startDate: '2025-01-01'
})

// 当前时间和日期
const currentTime = ref('00:00:00')
const currentDate = ref('2023-07-12')

// 更新时间的函数
const updateDateTime = () => {
  const now = new Date()
  
  // 格式化时间 HH:MM:SS
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  currentTime.value = `${hours}:${minutes}:${seconds}`
  
  // 格式化日期 YYYY-MM-DD
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  currentDate.value = `${year}-${month}-${day}`
}

// 定时器
let timer: number

// 组件挂载时启动定时器
onMounted(() => {
  // 立即执行一次
  updateDateTime()
  
  // 每秒更新一次
  timer = window.setInterval(updateDateTime, 1000)
})

// 组件卸载时清除定时器和事件监听
onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.project-header {
  position: relative;
  width: 100%;
  height: 60px;
  background: linear-gradient(90deg, #0a1535 0%, #152253 50%, #0a1535 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  z-index: 100;
}

/* 背景效果 */
.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(15, 25, 65, 0.9) 0%, rgba(24, 35, 89, 0.8) 50%, rgba(15, 25, 65, 0.9) 100%);
  z-index: 1;
}

.bg-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(90deg, rgba(100, 150, 255, 0.1) 1px, transparent 1px),
    linear-gradient(0deg, rgba(100, 150, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  z-index: 2;
  animation: moveBgLines 20s linear infinite;
}

.bg-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80%;
  height: 30px;
  transform: translate(-50%, -50%);
  background: radial-gradient(ellipse at center, rgba(0, 150, 255, 0.2) 0%, transparent 70%);
  filter: blur(10px);
  z-index: 3;
}

/* 主标题区域 */
.main-title {
  display: flex;
  align-items: center;
  margin-right: 20px;
  z-index: 10;
}

.title-icon {
  width: 36px;
  height: 36px;
  background: rgba(100, 150, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  box-shadow: 0 0 10px rgba(100, 150, 255, 0.5);
}

.icon-svg {
  width: 24px;
  height: 24px;
  fill: #00ccff;
}

.title-text {
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(0, 204, 255, 0.5);
}

/* 占位空间 */
.spacer {
  flex: 1;
}

/* 右侧信息 */
.header-info {
  display: flex;
  align-items: center;
  z-index: 10;
}

.info-item {
  display: flex;
  align-items: center;
  margin-left: 15px;
}

.info-label {
  color: rgba(255, 255, 255, 0.7);
  margin-right: 5px;
  font-size: 14px;
}

.info-value {
  color: #00ccff;
  font-weight: 500;
  font-size: 14px;
  text-shadow: 0 0 5px rgba(0, 204, 255, 0.5);
}

/* 动画 */
@keyframes moveBgLines {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 20px 20px;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-header {
    height: auto;
    flex-direction: column;
    padding: 10px;
  }
  
  .main-title {
    margin-bottom: 10px;
    margin-right: 0;
  }
  
  .header-info {
    margin-left: 0;
    align-items: center;
  }
}
</style> 