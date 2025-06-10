<template>
  <div 
    class="workflow-node"
    :data-node-id="node.id"
    :class="{ 'node-changed': isNodeChanged }"
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

<script setup lang="ts">
import { computed } from 'vue';
import type { WorkflowNode } from '../types';

const props = defineProps<{
  node: WorkflowNode;
}>();

// 判断节点是否变更
const isNodeChanged = computed(() => {
  // 根据业务逻辑判断节点是否为变更状态
  return props.node.status === 'rejected' || props.node.status === 'changed';
});
</script>

<style scoped>
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

.node-changed {
  border-color: rgba(255, 140, 22, 0.5);
  box-shadow: 0 0 15px rgba(255, 140, 22, 0.2);
}

.node-changed:hover {
  box-shadow: 0 5px 20px rgba(255, 140, 22, 0.4);
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
  font-size: 12px;
  text-align: center;
}

.node-state {
  font-size: 10px;
  margin-top: 5px;
  color: rgba(224, 240, 255, 0.7);
  text-align: center;
}
</style> 