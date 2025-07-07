<template>
  <Icon 
    :icon="icon" 
    :width="computedWidth" 
    :height="computedHeight" 
    :style="computedStyle"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

interface Props {
  icon: string;
  width?: string | number;
  height?: string | number;
  size?: string | number;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  width: '1em',
  height: '1em'
});

// 计算实际的宽高
const computedWidth = computed(() => {
  if (props.size) {
    return typeof props.size === 'number' ? `${props.size}px` : props.size;
  }
  return typeof props.width === 'number' ? `${props.width}px` : props.width;
});

const computedHeight = computed(() => {
  if (props.size) {
    return typeof props.size === 'number' ? `${props.size}px` : props.size;
  }
  return typeof props.height === 'number' ? `${props.height}px` : props.height;
});

// 计算样式
const computedStyle = computed(() => {
  const style: Record<string, any> = {};
  
  if (props.color) {
    style.color = props.color;
  }
  
  return style;
});
</script>

<style scoped>
/* 图标默认样式 */
:deep(.iconify) {
  display: inline-block;
  vertical-align: middle;
}
</style> 