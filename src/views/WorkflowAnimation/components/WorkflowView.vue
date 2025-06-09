<template>
  <div class="workflow-view">
    <!-- 背景网格 -->
    <div class="tech-background">
      <div class="grid-pattern"></div>
    </div>
    
    <div class="workflow-table">
      <!-- 表头（时间点） -->
      <div class="table-row header-row">
        <div class="table-cell user-cell">
          <div class="tech-cell-content">
            <div class="tech-corner top-left"></div>
            <div class="tech-corner top-right"></div>
            <div class="tech-corner bottom-left"></div>
            <div class="tech-corner bottom-right"></div>
          </div>
        </div>
        <div 
          v-for="(timePoint, index) in timePoints" 
          :key="timePoint.id || index" 
          class="table-cell time-cell"
        >
          <div class="tech-cell-content">
            <div class="tech-corner top-left"></div>
            <div class="tech-corner top-right"></div>
            <div class="tech-corner bottom-left"></div>
            <div class="tech-corner bottom-right"></div>
            <span>{{ timePoint.name || timePoint.date || `时间点${index + 1}` }}</span>
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
          <div class="tech-cell-content">
            <div class="tech-corner top-left"></div>
            <div class="tech-corner top-right"></div>
            <div class="tech-corner bottom-left"></div>
            <div class="tech-corner bottom-right"></div>
            <span>{{ reviewer.name || `审核人${rowIndex + 1}` }}</span>
          </div>
        </div>
        
        <!-- 每个时间点的单元格 -->
        <div 
          v-for="(timePoint, colIndex) in timePoints" 
          :key="`${reviewer.id || rowIndex}-${timePoint.id || colIndex}`" 
          class="table-cell node-cell"
        >
          <!-- 在此单元格中查找对应的节点 -->
          <template v-for="node in getNodesForCell(reviewer.id, timePoint.id)" :key="node.id">
            <div 
              class="workflow-node"
              :data-node-id="node.id"
            >
              <div class="node-glow"></div>
              <div class="node-content">
                <div class="node-title">{{ node.title }}</div>
                <div v-if="node.stateInfo" class="node-state">{{ node.stateInfo }}</div>
              </div>
              <div class="node-corner top-left"></div>
              <div class="node-corner top-right"></div>
              <div class="node-corner bottom-left"></div>
              <div class="node-corner bottom-right"></div>
            </div>
          </template>
        </div>
      </div>
    </div>
    
    <!-- 连接线层，使用SVG绘制 -->
    <svg class="connections-layer" ref="connectionsLayer">
      <defs>
        <!-- 箭头定义 -->
        <marker 
          id="arrowhead" 
          markerWidth="10" 
          markerHeight="7" 
          refX="9" 
          refY="3.5" 
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#3aa0ff" />
        </marker>
        
        <!-- 发光连接线 -->
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        <!-- 流动动画 -->
        <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(58, 160, 255, 0.1)" />
          <stop offset="50%" stop-color="rgba(58, 160, 255, 0.6)" />
          <stop offset="100%" stop-color="rgba(58, 160, 255, 0.1)" />
          <animate attributeName="x1" from="-100%" to="100%" dur="3s" repeatCount="indefinite" />
          <animate attributeName="x2" from="0%" to="200%" dur="3s" repeatCount="indefinite" />
        </linearGradient>
      </defs>
      
      <!-- 每条连接线单独绘制，不合并分组 -->
      <g v-for="connection in processedConnections" :key="connection.id" class="connection-group">
        <!-- 发光底层 -->
        <path 
          :d="connection.path" 
          :stroke="connection.color" 
          :stroke-width="connection.width + 2" 
          :stroke-dasharray="connection.dashArray" 
          stroke-opacity="0.3"
          fill="none" 
          filter="url(#glow)"
        />
        
        <!-- 主连接线 -->
        <path 
          :d="connection.path" 
          :stroke="connection.color" 
          :stroke-width="connection.width" 
          :stroke-dasharray="connection.dashArray" 
          fill="none" 
          marker-end="url(#arrowhead)"
        />
        
        <!-- 流动效果 -->
        <path 
          :d="connection.path" 
          stroke="url(#flow-gradient)" 
          :stroke-width="connection.width" 
          :stroke-dasharray="connection.dashArray" 
          fill="none" 
          stroke-opacity="0.7"
        />
      </g>
    </svg>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="tech-loading">
        <div class="loading-circle"></div>
        <div class="loading-text">加载中...</div>
      </div>
    </div>
    
    <!-- 控制按钮 -->
    <div class="controls">
      <el-button type="primary" size="small" @click="resetView" class="tech-button">
        <span class="button-text">重置视图</span>
        <span class="button-glow"></span>
      </el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch, nextTick } from 'vue';

// 定义接口
interface Reviewer {
  id: string;
  name: string;
  [key: string]: any;
}

interface TimePoint {
  id: string;
  name?: string;
  date?: string;
  [key: string]: any;
}

interface WorkflowNode {
  id: string;
  title: string;
  status: string;
  stateInfo?: string;
  reviewerId: string;
  timePointId: string;
  connections?: Connection[];
  [key: string]: any;
}

interface Connection {
  id?: string;
  toNodeId: string;
  style?: {
    type?: string;
    color?: string;
    width?: number;
  };
  [key: string]: any;
}

interface ProcessedConnection {
  id: string;
  path: string;
  color: string;
  width: number;
  dashArray: string;
}

export default defineComponent({
  name: 'WorkflowView',
  props: {
    nodeData: {
      type: Array as () => WorkflowNode[],
      default: () => []
    },
    reviewers: {
      type: Array as () => Reviewer[],
      default: () => []
    },
    timePoints: {
      type: Array as () => TimePoint[],
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    // 连接线层引用
    const connectionsLayer = ref<SVGElement | null>(null);
    
    // 处理后的连接线数据
    const processedConnections = ref<ProcessedConnection[]>([]);
    
    // 获取指定单元格的节点
    const getNodesForCell = (reviewerId: string, timePointId: string): WorkflowNode[] => {
      if (!props.nodeData || !Array.isArray(props.nodeData)) return [];
      
      return props.nodeData.filter((node: WorkflowNode) => 
        node.reviewerId === reviewerId && node.timePointId === timePointId
      );
    };
    
    // 判断节点是否变更
    const isNodeChanged = (node: WorkflowNode): boolean => {
      // 由于不需要特殊标记驳回状态，这里返回false
      return false;
    };
    
    // 计算连接线
    const calculateConnections = () => {
      processedConnections.value = [];
      
      if (!props.nodeData || !Array.isArray(props.nodeData)) return;
      
      // 创建节点ID到DOM元素的映射
      const nodeElements = new Map<string, Element>();
      
      // 记录连接的节点对，用于避免重叠
      // 格式为: "较小ID-较大ID" -> [连接数量]
      const connectionPairs = new Map<string, number>();
      
      // 等待DOM更新完成
      nextTick(() => {
        // 收集所有节点元素
        document.querySelectorAll('.workflow-node').forEach((el: Element) => {
          const nodeId = el.getAttribute('data-node-id');
          if (nodeId) {
            nodeElements.set(nodeId, el);
          }
        });
        
        // 处理每个节点的连接
        props.nodeData.forEach((node: WorkflowNode) => {
          if (!node.connections || !Array.isArray(node.connections)) return;
          
          const fromElement = nodeElements.get(node.id);
          if (!fromElement) return;
          
          node.connections.forEach((connection: Connection) => {
            const toElement = nodeElements.get(connection.toNodeId);
            if (!toElement) return;
            
            // 计算连接线起点和终点
            const fromRect = fromElement.getBoundingClientRect();
            const toRect = toElement.getBoundingClientRect();
            
            const fromCenterX = fromRect.left + fromRect.width / 2;
            const fromCenterY = fromRect.top + fromRect.height / 2;
            const toCenterX = toRect.left + toRect.width / 2;
            const toCenterY = toRect.top + toRect.height / 2;
            
            // 判断连接方向
            const isHorizontal = Math.abs(toCenterX - fromCenterX) > Math.abs(toCenterY - fromCenterY);
            
            // 为了确保相同节点对使用相同的键，将ID排序
            const [id1, id2] = [node.id, connection.toNodeId].sort();
            const nodePairKey = `${id1}-${id2}`;
            
            // 获取当前连接对的计数，如果没有则为0
            let connectionCount = connectionPairs.get(nodePairKey) || 0;
            
            // 更新连接计数
            connectionPairs.set(nodePairKey, connectionCount + 1);
            
            // 确定当前连接在节点对中的位置（第几条）
            const currentConnectionIndex = connectionCount;
            
            // 计算偏移量
            let offsetX = 0;
            let offsetY = 0;
            
            // 只有当不是第一条连接时才添加偏移
            if (currentConnectionIndex > 0) {
              const offsetAmount = 20 * currentConnectionIndex; // 5px 偏移量
              
              if (isHorizontal) {
                // 水平连接，添加垂直偏移
                offsetY = offsetAmount;
              } else {
                // 垂直连接，添加水平偏移
                offsetX = offsetAmount;
              }
            }
            
            let startX: number, startY: number, endX: number, endY: number;
            
            if (isHorizontal) {
              // 水平连接
              startX = fromCenterX + (fromCenterX < toCenterX ? fromRect.width / 2 : -fromRect.width / 2);
              startY = fromCenterY + offsetY;
              endX = toCenterX + (toCenterX < fromCenterX ? toRect.width / 2 : -toRect.width / 2);
              endY = toCenterY + offsetY;
            } else {
              // 垂直连接
              startX = fromCenterX + offsetX;
              startY = fromCenterY + (fromCenterY < toCenterY ? fromRect.height / 2 : -fromRect.height / 2);
              endX = toCenterX + offsetX;
              endY = toCenterY + (toCenterY < fromCenterY ? toRect.height / 2 : -toRect.height / 2);
            }
            
            // 获取连接样式
            const isDashed = connection.style?.type === 'dashed';
            // 修改颜色为科技蓝
            const color = connection.style?.color || '#3aa0ff';
            const width = connection.style?.width || 1.5;
            
            // 调整SVG坐标系
            const svgRect = connectionsLayer.value?.getBoundingClientRect();
            if (svgRect) {
              startX -= svgRect.left;
              startY -= svgRect.top;
              endX -= svgRect.left;
              endY -= svgRect.top;
            }
            
            // 添加到处理后的连接线
            processedConnections.value.push({
              id: connection.id || `${node.id}-${connection.toNodeId}-${currentConnectionIndex}`,
              path: `M ${startX} ${startY} L ${endX} ${endY}`,
              color,
              width,
              dashArray: isDashed ? '5,3' : 'none'
            });
          });
        });
      });
    };
    
    // 重置视图
    const resetView = () => {
      calculateConnections();
    };
    
    // 监听数据变化
    watch(() => [props.nodeData, props.reviewers, props.timePoints], () => {
      calculateConnections();
    }, { deep: true });
    
    // 组件挂载后计算连接线
    onMounted(() => {
      calculateConnections();
      
      // 监听窗口大小变化
      window.addEventListener('resize', calculateConnections);
      
      // 组件卸载时移除事件监听
      return () => {
        window.removeEventListener('resize', calculateConnections);
      };
    });
    
    return {
      connectionsLayer,
      processedConnections,
      getNodesForCell,
      isNodeChanged,
      calculateConnections,
      resetView
    };
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

/* 科技感背景 */
.tech-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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

.workflow-table {
  position: relative;
  display: table;
  width: 100%;
  border-collapse: separate;
  border-spacing: 8px;
  table-layout: fixed;
  z-index: 1;
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
  min-width: 120px;
  height: 100px;
}

.tech-cell-content {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: rgba(12, 30, 56, 0.7);
  border: 1px solid rgba(58, 160, 255, 0.3);
  box-shadow: 0 0 8px rgba(58, 160, 255, 0.2);
  border-radius: 4px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.tech-cell-content:hover {
  border-color: rgba(58, 160, 255, 0.6);
  box-shadow: 0 0 12px rgba(58, 160, 255, 0.3);
}

.tech-corner {
  position: absolute;
  width: 8px;
  height: 8px;
  border-color: rgba(58, 160, 255, 0.7);
  z-index: 2;
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

.header-row .table-cell {
  height: 50px;
}

.user-cell {
  width: 100px;
}

.node-cell {
  position: relative;
  transition: background-color 0.3s ease;
}

.workflow-node {
  position: relative;
  margin: 0 auto;
  padding: 10px;
  background-color: rgba(13, 41, 77, 0.9);
  border: 1px solid rgba(58, 160, 255, 0.5);
  box-shadow: 0 0 15px rgba(58, 160, 255, 0.2);
  border-radius: 4px;
  width: 80%;
  max-width: 120px;
  min-height: 60px;
  z-index: 2;
  overflow: hidden;
  transition: all 0.3s ease;
}

.workflow-node:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 20px rgba(58, 160, 255, 0.4);
}

.node-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at center, rgba(58, 160, 255, 0.15) 0%, rgba(13, 41, 77, 0) 70%);
  pointer-events: none;
  z-index: -1;
}

.node-corner {
  position: absolute;
  width: 6px;
  height: 6px;
  border-color: rgba(58, 160, 255, 0.8);
  z-index: 3;
}

.node-corner.top-left {
  top: 0;
  left: 0;
  border-top: 2px solid;
  border-left: 2px solid;
}

.node-corner.top-right {
  top: 0;
  right: 0;
  border-top: 2px solid;
  border-right: 2px solid;
}

.node-corner.bottom-left {
  bottom: 0;
  left: 0;
  border-bottom: 2px solid;
  border-left: 2px solid;
}

.node-corner.bottom-right {
  bottom: 0;
  right: 0;
  border-bottom: 2px solid;
  border-right: 2px solid;
}

.node-content {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 3;
}

.node-title {
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 5px rgba(58, 160, 255, 0.8);
}

.node-state {
  font-size: 12px;
  margin-top: 5px;
  color: rgba(224, 240, 255, 0.7);
}

.connections-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
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
  z-index: 10;
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

.controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 5;
}

.tech-button {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0c3764, #061525);
  border: 1px solid rgba(58, 160, 255, 0.6);
  box-shadow: 0 0 10px rgba(58, 160, 255, 0.3);
  transition: all 0.3s ease;
}

.tech-button:hover {
  border-color: rgba(58, 160, 255, 0.9);
  box-shadow: 0 0 15px rgba(58, 160, 255, 0.5);
}

.button-text {
  position: relative;
  z-index: 2;
  color: #3aa0ff;
}

.button-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(58, 160, 255, 0.2),
    transparent
  );
  animation: button-glow 2s ease-in-out infinite;
  z-index: 1;
}

@keyframes button-glow {
  0% {
    left: -100%;
  }
  100% {
    left: 200%;
  }
}
</style>