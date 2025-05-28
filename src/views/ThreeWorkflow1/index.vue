<template>
  <div class="workflow-container">
    <!-- 3D场景容器 -->
    <div ref="threeContainer" class="three-container"></div>

    <!-- CSS2D渲染器容器 - 用于HTML标签 -->
    <div ref="cssContainer" class="css-container"></div>

    <!-- 视角控制按钮 -->
    <div class="view-controls">
      <button @click="changeView('default')" class="view-btn">默认视角</button>
      <button @click="changeView('top')" class="view-btn">顶视图</button>
      <button @click="changeView('side')" class="view-btn">侧视图</button>
      <button @click="changeView('front')" class="view-btn">正视图</button>
    </div>

    <!-- 信息面板切换按钮 -->
    <div class="info-toggle" @click="toggleInfoPanel">
      <i :class="['info-icon', showInfoPanel ? 'icon-hide' : 'icon-show']"></i>
      <span>{{ showInfoPanel ? '隐藏信息' : '显示信息' }}</span>
    </div>

    <!-- 信息面板 -->
    <div class="info-panel" :class="{ 'info-panel-hidden': !showInfoPanel }">
      <h3>工作流程图信息</h3>
      <div class="info-content">
        <div class="info-item">
          <span class="info-label">审核人数量:</span>
          <span class="info-value">{{ reviewerCount }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">时间点数量:</span>
          <span class="info-value">{{ timePointCount }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">节点总数:</span>
          <span class="info-value">{{ nodeCount }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">实际节点数:</span>
          <span class="info-value">{{ actualNodeCount }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">虚拟节点数:</span>
          <span class="info-value">{{ virtualNodeCount }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">连接线数量:</span>
          <span class="info-value">{{ connectionCount }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">主流程数:</span>
          <span class="info-value">{{ mainFlowCount }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">重试流程数:</span>
          <span class="info-value">{{ retryFlowCount }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">通过数量:</span>
          <span class="info-value">{{ passCount }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">驳回数量:</span>
          <span class="info-value">{{ rejectCount }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">等待数量:</span>
          <span class="info-value">{{ pendingCount }}</span>
        </div>
      </div>

      <div class="color-legend">
        <div class="legend-item">
          <div class="color-box" style="background-color: #4caf50;"></div>
          <span>通过 (主流程)</span>
        </div>
        <div class="legend-item">
          <div class="color-box" style="background-color: #f44336;"></div>
          <span>驳回</span>
        </div>
        <div class="legend-item">
          <div class="color-box" style="background-color: #ffc107;"></div>
          <span>重试流程</span>
        </div>
        <div class="legend-item">
          <div class="color-box" style="background-color: #9e9e9e;"></div>
          <span>等待中</span>
        </div>
        <div class="legend-item">
          <div class="color-box" style="background-color: rgba(255, 255, 255, 0.7); border: 1px dashed #9e9e9e;"></div>
          <span>虚拟节点</span>
        </div>
      </div>

      <h4>操作提示</h4>
      <ul class="control-tips">
        <li>鼠标左键拖动: 旋转视图</li>
        <li>鼠标右键拖动: 平移视图</li>
        <li>鼠标滚轮: 缩放视图</li>
        <li>点击节点: 显示详细信息</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import useThreeWorkflow1 from './useThreeWorkflow1'

// 场景信息
const reviewerCount = ref(0)
const timePointCount = ref(0)
const mainFlowCount = ref(0)
const retryFlowCount = ref(0)
const passCount = ref(0)
const rejectCount = ref(0)
const nodeCount = ref(0)
const actualNodeCount = ref(0)
const virtualNodeCount = ref(0)
const connectionCount = ref(0)
const pendingCount = ref(0)

// 控制信息面板显示/隐藏
const showInfoPanel = ref(false)

// DOM引用
const threeContainer = ref(null)
const cssContainer = ref(null)

// 使用Three.js工作流
const { initialize, cleanup, getSceneInfo, changeViewpoint } = useThreeWorkflow1()

// 组件挂载时初始化3D场景
onMounted(() => {
  if (threeContainer.value && cssContainer.value) {
    // 初始化场景
    initialize(threeContainer.value, cssContainer.value)

    // 获取并更新场景信息
    const sceneInfo = getSceneInfo()
    reviewerCount.value = sceneInfo.reviewerCount
    timePointCount.value = sceneInfo.timePointCount
    nodeCount.value = sceneInfo.nodeCount
    actualNodeCount.value = sceneInfo.actualNodeCount
    virtualNodeCount.value = sceneInfo.virtualNodeCount
    connectionCount.value = sceneInfo.connectionCount
    pendingCount.value = sceneInfo.pendingCount

    // 使用类型断言，因为我们知道完整的场景信息包含这些属性
    if ('mainFlowCount' in sceneInfo) {
      mainFlowCount.value = sceneInfo.mainFlowCount
      retryFlowCount.value = sceneInfo.retryFlowCount
      passCount.value = sceneInfo.passCount
      rejectCount.value = sceneInfo.rejectCount
    }
  }
})

// 视角切换函数
const changeView = (viewType: 'default' | 'top' | 'side' | 'front') => {
  changeViewpoint(viewType)
}

// 切换信息面板显示/隐藏
const toggleInfoPanel = () => {
  showInfoPanel.value = !showInfoPanel.value
}

// 组件卸载时清理资源
onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.workflow-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #1a2d7a;
}

.three-container {
  width: 100%;
  height: 100%;
}

.css-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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

.info-toggle {
  position: absolute;
  top: 20px;
  left: 20px;
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
  z-index: 101;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-toggle:hover {
  background: rgba(40, 80, 130, 0.9);
  border-color: rgba(0, 255, 255, 0.6);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.info-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  position: relative;
}

.icon-show::before {
  content: '';
  position: absolute;
  top: 7px;
  left: 0;
  width: 16px;
  height: 2px;
  background-color: white;
}

.icon-show::after {
  content: '';
  position: absolute;
  top: 0;
  left: 7px;
  width: 2px;
  height: 16px;
  background-color: white;
}

.icon-hide::before {
  content: '';
  position: absolute;
  top: 7px;
  left: 0;
  width: 16px;
  height: 2px;
  background-color: white;
}

.info-panel {
  position: absolute;
  top: 70px;
  left: 20px;
  background: rgba(10, 20, 40, 0.85);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  padding: 20px;
  color: white;
  font-family: 'Microsoft YaHei', sans-serif;
  min-width: 280px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 100;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.info-panel-hidden {
  transform: translateX(-120%);
  opacity: 0;
  pointer-events: none;
}

.info-panel h3 {
  margin: 0 0 15px 0;
  color: #00ffff;
  font-size: 18px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.info-panel h4 {
  margin-top: 15px;
  margin-bottom: 10px;
  font-size: 16px;
  color: #00ccff;
}

.info-content {
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-label {
  color: #aaccff;
}

.info-value {
  font-weight: bold;
  color: white;
}

.control-tips {
  border-top: 1px solid rgba(0, 255, 255, 0.2);
  padding-top: 15px;
  padding-left: 20px;
  margin: 10px 0;
  color: #aaccff;
}

.control-tips li {
  margin-bottom: 5px;
}

.color-legend {
  margin-top: 15px;
  padding: 10px;
  background-color: rgba(20, 40, 80, 0.5);
  border-radius: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: white;
}

.color-box {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  margin-right: 8px;
}

/* 添加动画效果 */
.info-panel {
  animation: fadeInLeft 0.8s ease-out;
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .info-panel {
    top: 70px;
    left: 10px;
    right: 10px;
    min-width: auto;
    padding: 15px;
  }
  
  .info-toggle {
    top: 10px;
    left: 10px;
  }
}
</style>
