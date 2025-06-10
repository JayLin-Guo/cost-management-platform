<template>
  <div class="workflow-view" ref="workflowViewRef">
    <!-- 顶级头部区域 -->
    <div class="workflow-header">
      <div class="header-background">
        <div class="header-glow"></div>
        <div class="header-pattern"></div>
      </div>
      
      <div class="header-content">
        <!-- 左侧标题区域 -->
        <div class="header-left">
          <div class="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
                    fill="currentColor" opacity="0.8"/>
              <path d="M12 6v12l-4.24 2.22.94-4.72L5 12l4.72-.69L12 6z" 
                    fill="currentColor"/>
            </svg>
          </div>
          <div class="header-title-group">
            <h1 class="header-title">工作流程动画展示</h1>
            <p class="header-subtitle">实时审核流程可视化系统</p>
          </div>
        </div>
        
        <!-- 中间状态区域 -->
        <div class="header-center">
          <div class="status-indicators">
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
              <span class="status-text">{{ nodeData.length }} 个节点</span>
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
              <span class="status-text">{{ reviewers.length }} 位审核员</span>
            </div>
          </div>
        </div>
        
        <!-- 右侧操作区域 -->
        <div class="header-right">
          <div class="header-actions">
            <button class="action-btn secondary" @click="resetView">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" 
                      stroke="currentColor" stroke-width="2"/>
                <path d="M21 3v5h-5" stroke="currentColor" stroke-width="2"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" 
                      stroke="currentColor" stroke-width="2"/>
                <path d="M8 16H3v5" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>重置</span>
            </button>
            <button class="action-btn primary" @click="toggleAnimation">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <polygon v-if="!animationNodeVisible" points="5,3 19,12 5,21" fill="currentColor"/>
                <rect v-else x="6" y="4" width="4" height="16" fill="currentColor"/>
                <rect v-else x="14" y="4" width="4" height="16" fill="currentColor"/>
              </svg>
              <span>{{ animationNodeVisible ? '暂停' : '播放' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 背景网格 -->
    <div class="tech-background">
      <div class="grid-pattern"></div>
    </div>
    
    <!-- 工作流表格 -->
    <WorkflowTable
      :nodeData="nodeData"
      :reviewers="reviewers"
      :timePoints="timePoints"
    />
    
    <!-- 连接线层 -->
    <ConnectionLayer
      ref="connectionLayerRef"
      :connections="processedConnections"
    />
    
    <!-- 动画节点 -->
    <div 
      v-if="animationNodeVisible"
      class="animation-node workflow-node" 
      :style="{ 
        left: `${animationNodePosition.x}px`, 
        top: `${animationNodePosition.y}px`,
        transform: `translate(-50%, -50%) scale(1.1)`
      }"
    >
      <div class="node-glow animation-glow"></div>
      <div class="node-content">
        <div class="node-title">审核流转</div>
      </div>
      <div class="node-corner top-left"></div>
      <div class="node-corner top-right"></div>
      <div class="node-corner bottom-left"></div>
      <div class="node-corner bottom-right"></div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="tech-loading">
        <div class="loading-circle"></div>
        <div class="loading-text">加载中...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import WorkflowTable from './WorkflowTable.vue';
import ConnectionLayer from './ConnectionLayer.vue';
import { useConnectionCalculator } from '../hooks/useConnectionCalculator';
import { useWorkflowAnimation } from '../hooks/useWorkflowAnimation';
import type { WorkflowNode, Reviewer, TimePoint } from '../types';

// 定义 props
const props = defineProps<{
  nodeData: WorkflowNode[];
  reviewers: Reviewer[];
  timePoints: TimePoint[];
  loading?: boolean;
}>();

// 组件引用
const workflowViewRef = ref<HTMLElement | null>(null);
const connectionLayerRef = ref<InstanceType<typeof ConnectionLayer> | null>(null);

// 使用自定义 hooks
const { processedConnections, calculateConnections } = useConnectionCalculator();
const { 
  animationNodePosition, 
  animationNodeVisible, 
  shouldRestart,
  isEndStatus,
  buildAnimationPath, 
  startAnimation,
  stopAnimation,
  resetAnimation,
  checkAndClearRestartFlag,
  restartAnimation
} = useWorkflowAnimation();

// 重置视图
const resetView = () => {
  resetAnimation(); // 重置动画状态
  const connectionsLayer = connectionLayerRef.value?.connectionsLayer;
  calculateConnections(props.nodeData, connectionsLayer);
};

// 切换动画状态
const toggleAnimation = () => {
  if (animationNodeVisible.value) {
    stopAnimation();
  } else {
    // 重新开始动画，使用新的restartAnimation函数
    restartAnimation(props.nodeData, processedConnections.value);
  }
};

// 处理滚动事件
const handleScroll = () => {
  if (animationNodeVisible.value) {
    nextTick(() => {
      buildAnimationPath(props.nodeData, processedConnections.value);
    });
  }
};

// 监听重新开始标志
watch(shouldRestart, (newValue) => {
  if (newValue) {
    console.log('检测到需要重新开始动画');
    // 清除标志并重新开始动画
    checkAndClearRestartFlag();
    // 延迟一下再重新开始，确保重置完成
    setTimeout(() => {
      restartAnimation(props.nodeData, processedConnections.value);
    }, 500);
  }
});

// 监听数据变化
watch(() => [props.nodeData, props.reviewers, props.timePoints], () => {
  nextTick(() => {
    const connectionsLayer = connectionLayerRef.value?.connectionsLayer;
    calculateConnections(props.nodeData, connectionsLayer);
  });
}, { deep: true });

// 监听连接线变化，构建动画路径
watch(processedConnections, () => {
  nextTick(() => {
    buildAnimationPath(props.nodeData, processedConnections.value);
  });
}, { deep: true });

// 组件挂载后初始化
onMounted(() => {
  nextTick(() => {
    const connectionsLayer = connectionLayerRef.value?.connectionsLayer;
    calculateConnections(props.nodeData, connectionsLayer);
  });
  
  // 监听窗口大小变化和滚动事件
  window.addEventListener('resize', resetView);
  const workflowView = workflowViewRef.value;
  if (workflowView) {
    workflowView.addEventListener('scroll', handleScroll);
  }
});

// 组件卸载前清理
onBeforeUnmount(() => {
  stopAnimation();
  
  // 移除事件监听
  window.removeEventListener('resize', resetView);
  const workflowView = workflowViewRef.value;
  if (workflowView) {
    workflowView.removeEventListener('scroll', handleScroll);
  }
});
</script>

<style scoped>
.workflow-view {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: #061525;
  font-family: "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
  color: #e0f0ff;
}

/* 工作流头部 */
.workflow-header {
  position: relative;
  height: 80px;
  background: linear-gradient(135deg, 
    rgba(6, 21, 37, 0.95) 0%, 
    rgba(12, 30, 56, 0.9) 50%, 
    rgba(6, 21, 37, 0.95) 100%);
  border-bottom: 2px solid rgba(58, 160, 255, 0.3);
  backdrop-filter: blur(10px);
  z-index: 10;
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.header-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(58, 160, 255, 0.1) 50%, 
    transparent 100%);
  animation: header-glow 4s ease-in-out infinite;
}

.header-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(45deg, rgba(58, 160, 255, 0.05) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(58, 160, 255, 0.05) 25%, transparent 25%);
  background-size: 20px 20px;
  background-position: 0 0, 10px 10px;
}

@keyframes header-glow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}

.header-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 24px;
  z-index: 2;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(58, 160, 255, 0.2), rgba(58, 160, 255, 0.05));
  border: 2px solid rgba(58, 160, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(58, 160, 255, 0.9);
  box-shadow: 0 0 20px rgba(58, 160, 255, 0.3);
  animation: icon-pulse 3s ease-in-out infinite;
}

@keyframes icon-pulse {
  0%, 100% { 
    box-shadow: 0 0 20px rgba(58, 160, 255, 0.3);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 30px rgba(58, 160, 255, 0.5);
    transform: scale(1.05);
  }
}

.header-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 0 10px rgba(58, 160, 255, 0.6);
  margin: 0;
  letter-spacing: 0.5px;
}

.header-subtitle {
  font-size: 14px;
  color: rgba(58, 160, 255, 0.8);
  margin: 0;
  font-weight: 400;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 500px;
}

.status-indicators {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 24px;
  background: rgba(12, 30, 56, 0.6);
  border: 1px solid rgba(58, 160, 255, 0.2);
  border-radius: 25px;
  backdrop-filter: blur(5px);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(58, 160, 255, 0.6);
  transition: all 0.3s ease;
}

.status-icon.active {
  color: rgba(34, 197, 94, 0.9);
  background: rgba(34, 197, 94, 0.1);
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
  animation: status-pulse 2s ease-in-out infinite;
}

@keyframes status-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.status-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.status-divider {
  width: 1px;
  height: 16px;
  background: rgba(58, 160, 255, 0.2);
}

.header-right {
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.action-btn.primary {
  background: linear-gradient(135deg, rgba(58, 160, 255, 0.8), rgba(58, 160, 255, 0.6));
  color: #fff;
  border: 1px solid rgba(58, 160, 255, 0.4);
  box-shadow: 0 0 15px rgba(58, 160, 255, 0.3);
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, rgba(58, 160, 255, 0.9), rgba(58, 160, 255, 0.7));
  box-shadow: 0 0 20px rgba(58, 160, 255, 0.5);
  transform: translateY(-2px);
}

.action-btn.secondary {
  background: rgba(12, 30, 56, 0.8);
  color: rgba(58, 160, 255, 0.9);
  border: 1px solid rgba(58, 160, 255, 0.3);
}

.action-btn.secondary:hover {
  background: rgba(12, 30, 56, 0.9);
  border-color: rgba(58, 160, 255, 0.5);
  color: #fff;
  transform: translateY(-2px);
}

/* 科技感背景 */
.tech-background {
  position: absolute;
  top: 80px;
  left: 0;
  width: 100%;
  height: calc(100% - 80px);
  pointer-events: none;
  z-index: 0;
}

.grid-pattern {
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(58, 160, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(58, 160, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  background-position: center center;
  z-index: 0;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(6, 21, 37, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 15;
}

.tech-loading {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid rgba(58, 160, 255, 0.2);
  border-top: 3px solid #3aa0ff;
  box-shadow: 0 0 20px rgba(58, 160, 255, 0.5);
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  font-size: 16px;
  color: #3aa0ff;
  text-shadow: 0 0 5px rgba(58, 160, 255, 0.5);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animation-node {
  position: absolute;
  margin: 0;
  background-color: rgba(77, 13, 77, 0.9);
  border: 1px solid rgba(255, 58, 255, 0.5);
  box-shadow: 0 0 15px rgba(255, 58, 255, 0.4), 0 0 30px rgba(255, 58, 255, 0.2);
  z-index: 5;
  width: 120px;
  height: 60px;
  cursor: pointer;
  transition: none;
  animation: node-pulse 2s infinite;
  border-radius: 4px;
  overflow: hidden;
}

.animation-node .node-corner {
  position: absolute;
  width: 6px;
  height: 6px;
  border-color: rgba(255, 58, 255, 0.8);
  z-index: 3;
}

.animation-node .node-corner.top-left {
  top: 0;
  left: 0;
  border-top: 2px solid;
  border-left: 2px solid;
}

.animation-node .node-corner.top-right {
  top: 0;
  right: 0;
  border-top: 2px solid;
  border-right: 2px solid;
}

.animation-node .node-corner.bottom-left {
  bottom: 0;
  left: 0;
  border-bottom: 2px solid;
  border-left: 2px solid;
}

.animation-node .node-corner.bottom-right {
  bottom: 0;
  right: 0;
  border-bottom: 2px solid;
  border-right: 2px solid;
}

.animation-node .node-content {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 3;
  height: 100%;
  padding: 10px;
}

.animation-node .node-title {
  color: #ffddff;
  text-shadow: 0 0 5px rgba(255, 58, 255, 0.8);
  font-weight: bold;
}

.animation-glow {
  background: radial-gradient(ellipse at center, rgba(255, 58, 255, 0.25) 0%, rgba(77, 13, 77, 0) 70%);
}

@keyframes node-pulse {
  0% {
    box-shadow: 0 0 15px rgba(255, 58, 255, 0.4), 0 0 30px rgba(255, 58, 255, 0.2);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 58, 255, 0.6), 0 0 40px rgba(255, 58, 255, 0.3);
  }
  100% {
    box-shadow: 0 0 15px rgba(255, 58, 255, 0.4), 0 0 30px rgba(255, 58, 255, 0.2);
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header-content {
    padding: 0 16px;
  }
  
  .status-indicators {
    gap: 16px;
    padding: 10px 20px;
  }
  
  .header-title {
    font-size: 20px;
  }
}

@media (max-width: 768px) {
  .workflow-header {
    height: 120px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }
  
  .header-left {
    gap: 12px;
  }
  
  .header-icon {
    width: 40px;
    height: 40px;
  }
  
  .header-title {
    font-size: 18px;
  }
  
  .header-subtitle {
    font-size: 12px;
  }
  
  .status-indicators {
    gap: 12px;
    padding: 8px 16px;
  }
  
  .status-text {
    font-size: 12px;
  }
  
  .action-btn {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .tech-background {
    top: 120px;
    height: calc(100% - 120px);
  }
}
</style>