<template>
  <div class="workflow-table">
    <!-- 表头（时间点） -->
    <div class="table-row header-row">
      <div class="table-cell user-cell">
        <div class="tech-cell-content user-header">
          <div class="tech-corner top-left"></div>
          <div class="tech-corner top-right"></div>
          <div class="tech-corner bottom-left"></div>
          <div class="tech-corner bottom-right"></div>
          <div class="cell-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
            </svg>
          </div>
          <span class="cell-title">审核人员</span>
          <div class="cell-glow"></div>
        </div>
      </div>
      <div 
        v-for="(timePoint, index) in timePoints" 
        :key="timePoint.id || index" 
        class="table-cell time-cell"
      >
        <div class="tech-cell-content time-header">
          <div class="tech-corner top-left"></div>
          <div class="tech-corner top-right"></div>
          <div class="tech-corner bottom-left"></div>
          <div class="tech-corner bottom-right"></div>
          <div class="cell-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
            </svg>
          </div>
          <div class="time-content">
            <span class="cell-title">{{ timePoint.name || `时间点${index + 1}` }}</span>
            <span v-if="timePoint.date" class="cell-subtitle">{{ timePoint.date }}</span>
          </div>
          <div class="cell-glow"></div>
          <div class="timeline-connector" v-if="index < timePoints.length - 1"></div>
        </div>
      </div>
    </div>
    
    <!-- 表格内容（用户和节点） -->
    <div 
      v-for="(reviewer, rowIndex) in reviewers" 
      :key="reviewer.id || rowIndex" 
      class="table-row"
    >
      <!-- 用户名称 -->
      <div class="table-cell user-cell">
        <div class="tech-cell-content user-info">
          <div class="tech-corner top-left"></div>
          <div class="tech-corner top-right"></div>
          <div class="tech-corner bottom-left"></div>
          <div class="tech-corner bottom-right"></div>
          <div class="user-avatar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
            </svg>
          </div>
          <div class="user-details">
            <span class="user-name">{{ reviewer.name || `审核人${rowIndex + 1}` }}</span>
            <span class="user-role">审核员</span>
          </div>
          <div class="cell-glow"></div>
        </div>
      </div>
      
      <!-- 每个时间点的单元格 -->
      <div 
        v-for="(timePoint, colIndex) in timePoints" 
        :key="`${reviewer.id || rowIndex}-${timePoint.id || colIndex}`" 
        class="table-cell node-cell"
      >
        <!-- 渲染节点 -->
        <WorkflowNode
          v-for="node in getNodesForCell(reviewer.id, timePoint.id)"
          :key="node.id"
          :node="node"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import WorkflowNode from './WorkflowNode.vue';
import type { WorkflowNode as WorkflowNodeType, Reviewer, TimePoint } from '../types';

const props = defineProps<{
  nodeData: WorkflowNodeType[];
  reviewers: Reviewer[];
  timePoints: TimePoint[];
}>();

// 获取指定单元格的节点
const getNodesForCell = (reviewerId: string, timePointId: string): WorkflowNodeType[] => {
  if (!props.nodeData || !Array.isArray(props.nodeData)) return [];
  
  return props.nodeData.filter((node: WorkflowNodeType) => 
    node.reviewerId === reviewerId && node.timePointId === timePointId
  );
};
</script>

<style scoped>
.workflow-table {
  position: relative;
  display: table;
  width: 100%;
  border-collapse: separate;
  border-spacing: 12px;
  table-layout: fixed;
  z-index: 1;
  margin-top: 20px;
}

.table-row {
  display: table-row;
}

.table-cell {
  display: table-cell;
  padding: 0;
  vertical-align: middle;
  text-align: center;
  position: relative;
  min-width: 140px;
  height: 100px;
}

.tech-cell-content {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

/* 用户头部样式 */
.user-header {
  background: linear-gradient(135deg, 
    rgba(58, 160, 255, 0.15) 0%, 
    rgba(13, 41, 77, 0.9) 50%, 
    rgba(58, 160, 255, 0.1) 100%);
  border: 2px solid rgba(58, 160, 255, 0.4);
  box-shadow: 
    0 0 20px rgba(58, 160, 255, 0.3),
    inset 0 0 20px rgba(58, 160, 255, 0.1);
  flex-direction: column;
  gap: 8px;
}

.user-header:hover {
  border-color: rgba(58, 160, 255, 0.7);
  box-shadow: 
    0 0 30px rgba(58, 160, 255, 0.5),
    inset 0 0 30px rgba(58, 160, 255, 0.15);
  transform: translateY(-2px);
}

/* 时间头部样式 */
.time-header {
  background: linear-gradient(135deg, 
    rgba(255, 140, 22, 0.15) 0%, 
    rgba(77, 41, 13, 0.9) 50%, 
    rgba(255, 140, 22, 0.1) 100%);
  border: 2px solid rgba(255, 140, 22, 0.4);
  box-shadow: 
    0 0 20px rgba(255, 140, 22, 0.3),
    inset 0 0 20px rgba(255, 140, 22, 0.1);
  flex-direction: column;
  gap: 6px;
  position: relative;
}

.time-header:hover {
  border-color: rgba(255, 140, 22, 0.7);
  box-shadow: 
    0 0 30px rgba(255, 140, 22, 0.5),
    inset 0 0 30px rgba(255, 140, 22, 0.15);
  transform: translateY(-2px);
}

/* 用户信息样式 */
.user-info {
  background: linear-gradient(135deg, 
    rgba(58, 160, 255, 0.08) 0%, 
    rgba(12, 30, 56, 0.9) 100%);
  border: 1px solid rgba(58, 160, 255, 0.3);
  box-shadow: 0 0 15px rgba(58, 160, 255, 0.2);
  flex-direction: row;
  gap: 12px;
  justify-content: flex-start;
  text-align: left;
}

.user-info:hover {
  border-color: rgba(58, 160, 255, 0.5);
  box-shadow: 0 0 20px rgba(58, 160, 255, 0.3);
}

.cell-icon {
  color: rgba(58, 160, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 5px rgba(58, 160, 255, 0.5));
}

.time-header .cell-icon {
  color: rgba(255, 140, 22, 0.8);
  filter: drop-shadow(0 0 5px rgba(255, 140, 22, 0.5));
}

.cell-title {
  font-weight: 600;
  color: #fff;
  text-shadow: 0 0 8px rgba(58, 160, 255, 0.8);
  font-size: 14px;
  letter-spacing: 0.5px;
}

.time-header .cell-title {
  text-shadow: 0 0 8px rgba(255, 140, 22, 0.8);
}

.cell-subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
}

.time-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(58, 160, 255, 0.2), rgba(58, 160, 255, 0.05));
  border: 2px solid rgba(58, 160, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(58, 160, 255, 0.9);
  box-shadow: 0 0 15px rgba(58, 160, 255, 0.3);
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  color: #fff;
  text-shadow: 0 0 5px rgba(58, 160, 255, 0.6);
  font-size: 14px;
}

.user-role {
  font-size: 11px;
  color: rgba(58, 160, 255, 0.7);
  font-weight: 400;
}

.cell-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at center, 
    rgba(58, 160, 255, 0.1) 0%, 
    transparent 70%);
  pointer-events: none;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tech-cell-content:hover .cell-glow {
  opacity: 1;
}

.time-header .cell-glow {
  background: radial-gradient(ellipse at center, 
    rgba(255, 140, 22, 0.1) 0%, 
    transparent 70%);
}

.timeline-connector {
  position: absolute;
  top: 50%;
  right: -14px;
  width: 12px;
  height: 2px;
  background: linear-gradient(90deg, 
    rgba(255, 140, 22, 0.6) 0%, 
    rgba(255, 140, 22, 0.2) 100%);
  transform: translateY(-50%);
  z-index: 1;
}

.timeline-connector::after {
  content: '';
  position: absolute;
  right: -4px;
  top: 50%;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 140, 22, 0.8);
  transform: translateY(-50%);
  box-shadow: 0 0 8px rgba(255, 140, 22, 0.5);
}

.tech-corner {
  position: absolute;
  width: 10px;
  height: 10px;
  border-color: rgba(58, 160, 255, 0.6);
  z-index: 2;
  transition: all 0.3s ease;
}

.time-header .tech-corner {
  border-color: rgba(255, 140, 22, 0.6);
}

.tech-corner.top-left {
  top: -1px;
  left: -1px;
  border-top: 2px solid;
  border-left: 2px solid;
}

.tech-corner.top-right {
  top: -1px;
  right: -1px;
  border-top: 2px solid;
  border-right: 2px solid;
}

.tech-corner.bottom-left {
  bottom: -1px;
  left: -1px;
  border-bottom: 2px solid;
  border-left: 2px solid;
}

.tech-corner.bottom-right {
  bottom: -1px;
  right: -1px;
  border-bottom: 2px solid;
  border-right: 2px solid;
}

.tech-cell-content:hover .tech-corner {
  border-color: rgba(58, 160, 255, 0.9);
  filter: drop-shadow(0 0 5px rgba(58, 160, 255, 0.5));
}

.time-header:hover .tech-corner {
  border-color: rgba(255, 140, 22, 0.9);
  filter: drop-shadow(0 0 5px rgba(255, 140, 22, 0.5));
}

.header-row .table-cell {
  height: 70px;
}

.user-cell {
  width: 160px;
}

.node-cell {
  position: relative;
  transition: background-color 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .table-cell {
    min-width: 120px;
  }
  
  .user-cell {
    width: 140px;
  }
}

@media (max-width: 768px) {
  .workflow-table {
    border-spacing: 8px;
  }
  
  .table-cell {
    min-width: 100px;
    height: 80px;
  }
  
  .header-row .table-cell {
    height: 60px;
  }
  
  .user-cell {
    width: 120px;
  }
  
  .tech-cell-content {
    padding: 8px;
  }
  
  .cell-title {
    font-size: 12px;
  }
  
  .user-name {
    font-size: 12px;
  }
}
</style> 