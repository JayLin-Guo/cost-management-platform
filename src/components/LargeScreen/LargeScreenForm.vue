<template>
  <div class="large-screen-form">
    <div class="form-bg"></div>
    <div class="form-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'

interface Props {
  labelWidth?: string
  labelPosition?: 'left' | 'right' | 'top'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  labelWidth: '120px',
  labelPosition: 'left',
  disabled: false,
})

// 提供表单配置给子组件
provide('formConfig', {
  labelWidth: props.labelWidth,
  labelPosition: props.labelPosition,
  disabled: props.disabled,
})
</script>

<style scoped>
.large-screen-form {
  position: relative;
  width: 100%;
}

.form-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(26, 31, 58, 0.1) 0%,
    rgba(45, 53, 97, 0.1) 50%,
    rgba(26, 31, 58, 0.1) 100%
  );
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.form-content {
  position: relative;
  padding: 20px;
  z-index: 1;
}

/* 全局表单样式 */
:deep(.large-screen-form-item) {
  margin-bottom: 24px;
}

:deep(.large-screen-form-item:last-child) {
  margin-bottom: 0;
}
</style>
