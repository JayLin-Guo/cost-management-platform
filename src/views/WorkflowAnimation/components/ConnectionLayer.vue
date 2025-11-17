<template>
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
    
    <!-- 每条连接线单独绘制 -->
    <g v-for="connection in connections" :key="connection.id" class="connection-group">
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
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ProcessedConnection } from '../types';

defineProps<{
  connections: ProcessedConnection[];
}>();

const connectionsLayer = ref<SVGElement | null>(null);

defineExpose({
  connectionsLayer
});
</script>

<style scoped>
.connections-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}
</style> 