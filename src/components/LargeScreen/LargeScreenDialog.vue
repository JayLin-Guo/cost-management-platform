<template>
  <teleport to="body">
    <transition name="dialog-fade">
      <div v-if="visible" class="large-screen-dialog-overlay" @click="handleOverlayClick">
        <div class="large-screen-dialog" :style="dialogStyle" @click.stop>
          <!-- 弹窗头部 -->
          <div class="dialog-header">
            <div class="header-bg"></div>
            <div class="header-content">
              <div class="title-section">
                <div class="title-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />
                  </svg>
                </div>
                <h3 class="dialog-title">{{ title }}</h3>
              </div>
              <button class="close-btn" @click="handleClose">
                <svg viewBox="0 0 24 24">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 弹窗内容 -->
          <div class="dialog-body">
            <div class="body-bg"></div>
            <div class="body-content">
              <slot></slot>
            </div>
          </div>

          <!-- 弹窗底部 -->
          <div v-if="$slots.footer" class="dialog-footer">
            <div class="footer-bg"></div>
            <div class="footer-content">
              <slot name="footer"></slot>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  visible: boolean
  title: string
  width?: string | number
  height?: string | number
  closeOnClickModal?: boolean
  destroyOnClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '800px',
  height: 'auto',
  closeOnClickModal: true,
  destroyOnClose: false
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'close': []
  'closed': []
}>()

// 计算弹窗样式
const dialogStyle = computed(() => {
  const width = typeof props.width === 'number' ? `${props.width}px` : props.width
  const height = typeof props.height === 'number' ? `${props.height}px` : props.height
  
  return {
    width,
    height: height !== 'auto' ? height : undefined,
    maxHeight: height === 'auto' ? '90vh' : undefined
  }
})

// 处理关闭
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

// 处理遮罩点击
const handleOverlayClick = () => {
  if (props.closeOnClickModal) {
    handleClose()
  }
}
</script>

<style scoped>
.large-screen-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 14, 39, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.large-screen-dialog {
  position: relative;
  background: transparent;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 
    0 0 50px rgba(0, 255, 255, 0.3),
    0 0 100px rgba(0, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  max-width: 95vw;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
}

/* 头部样式 */
.dialog-header {
  position: relative;
  padding: 0;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(26, 31, 58, 0.95) 0%,
    rgba(45, 53, 97, 0.95) 50%,
    rgba(26, 31, 58, 0.95) 100%);
  backdrop-filter: blur(10px);
}

.header-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 30px;
  z-index: 1;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  width: 24px;
  height: 24px;
  color: #00ffff;
  filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.6));
}

.title-icon svg {
  width: 100%;
  height: 100%;
  fill: currentColor;
}

.dialog-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  font-family: 'Microsoft YaHei', sans-serif;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.close-btn:hover {
  background: rgba(255, 51, 102, 0.2);
  border-color: #ff3366;
  color: #ff3366;
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(255, 51, 102, 0.4);
}

.close-btn svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

/* 内容样式 */
.dialog-body {
  position: relative;
  flex: 1;
  overflow: visible;
}

.body-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg,
    rgba(10, 14, 39, 0.95) 0%,
    rgba(16, 20, 45, 0.95) 50%,
    rgba(10, 14, 39, 0.95) 100%);
  backdrop-filter: blur(10px);
}

.body-content {
  position: relative;
  padding: 30px;
  z-index: 1;
  height: 100%;
  overflow-y: auto;
  overflow-x: visible;
}

/* 底部样式 */
.dialog-footer {
  position: relative;
  border-top: 1px solid rgba(0, 255, 255, 0.2);
}

.footer-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
    rgba(26, 31, 58, 0.95) 0%,
    rgba(45, 53, 97, 0.95) 50%,
    rgba(26, 31, 58, 0.95) 100%);
  backdrop-filter: blur(10px);
}

.footer-content {
  position: relative;
  padding: 20px 30px;
  z-index: 1;
  display: flex;
  justify-content: center;
  gap: 15px;
}

/* 动画效果 */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: all 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.dialog-fade-enter-to,
.dialog-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}

/* 滚动条样式 */
.body-content::-webkit-scrollbar {
  width: 8px;
}

.body-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.body-content::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  transition: background 0.3s ease;
}

.body-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .large-screen-dialog {
    margin: 10px;
    max-width: calc(100vw - 20px);
    max-height: calc(100vh - 20px);
  }
  
  .header-content,
  .body-content,
  .footer-content {
    padding: 20px;
  }
  
  .dialog-title {
    font-size: 18px;
  }
}
</style> 