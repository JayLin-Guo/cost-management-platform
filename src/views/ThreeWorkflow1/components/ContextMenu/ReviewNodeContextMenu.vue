<template>
  <div
    v-if="visible"
    class="review-context-menu"
    :style="menuStyle"
    @click.stop
    @contextmenu.prevent
  >
    <div class="menu-header">
      <div class="menu-title">
        <i class="header-icon"></i>
        <span>审核操作</span>
      </div>
      <div class="node-info">
        {{ nodeData?.name || nodeData?.title || '审核节点' }}
      </div>
    </div>
    
    <div class="menu-items">
      <!-- 主要操作 -->
      <div class="menu-group">
        <div class="menu-item primary" @click="handleApprove">
          <i class="menu-icon approve-icon"></i>
          <span class="menu-text">通过审核</span>
          <div class="menu-shortcut">A</div>
        </div>
        
        <div class="menu-item danger" @click="handleReject">
          <i class="menu-icon reject-icon"></i>
          <span class="menu-text">驳回审核</span>
          <div class="menu-shortcut">R</div>
        </div>
      </div>
      
      <div class="menu-divider"></div>
      
      <!-- 查看操作 -->
      <div class="menu-group">
        <div class="menu-item" @click="handleViewDetails">
          <i class="menu-icon view-icon"></i>
          <span class="menu-text">查看详情</span>
        </div>
        
        <div class="menu-item" @click="handleViewHistory">
          <i class="menu-icon history-icon"></i>
          <span class="menu-text">查看历史</span>
        </div>
      </div>
      
      <div class="menu-divider"></div>
      
      <!-- 管理操作 -->
      <div class="menu-group">
        <div class="menu-item" @click="handleAddComment">
          <i class="menu-icon comment-icon"></i>
          <span class="menu-text">添加备注</span>
        </div>
        
        <div class="menu-item" @click="handleAssignReviewer">
          <i class="menu-icon assign-icon"></i>
          <span class="menu-text">指派审核人</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'

interface Props {
  visible: boolean
  x: number
  y: number
  nodeData?: any
}

interface Emits {
  (e: 'close'): void
  (e: 'approve', nodeData: any): void
  (e: 'reject', nodeData: any): void
  (e: 'view-details', nodeData: any): void
  (e: 'add-comment', nodeData: any): void
  (e: 'assign-reviewer', nodeData: any): void
  (e: 'view-history', nodeData: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 计算菜单位置样式
const menuStyle = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
}))

// 键盘快捷键处理
function handleKeydown(event: KeyboardEvent) {
  if (!props.visible) return
  
  switch (event.key.toLowerCase()) {
    case 'a':
      event.preventDefault()
      handleApprove()
      break
    case 'r':
      event.preventDefault()
      handleReject()
      break
    case 'escape':
      emit('close')
      break
  }
}

// 菜单项点击处理
const handleApprove = () => {
  emit('approve', props.nodeData)
  emit('close')
}

const handleReject = () => {
  emit('reject', props.nodeData)
  emit('close')
}

const handleViewDetails = () => {
  emit('view-details', props.nodeData)
  emit('close')
}

const handleAddComment = () => {
  emit('add-comment', props.nodeData)
  emit('close')
}

const handleAssignReviewer = () => {
  emit('assign-reviewer', props.nodeData)
  emit('close')
}

const handleViewHistory = () => {
  emit('view-history', props.nodeData)
  emit('close')
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
.review-context-menu {
  position: fixed;
  z-index: 9999;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  border: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 8px;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(59, 130, 246, 0.2);
  min-width: 200px;
  backdrop-filter: blur(10px);
  animation: menuFadeIn 0.2s ease-out;
  user-select: none;

  .menu-header {
    padding: 12px 16px 8px;
    border-bottom: 1px solid rgba(59, 130, 246, 0.3);
    
    .menu-title {
      display: flex;
      align-items: center;
      color: #60a5fa;
      font-size: 14px;
      font-weight: 600;
      text-shadow: 0 0 5px rgba(96, 165, 250, 0.5);
      margin-bottom: 4px;
      
      .header-icon {
        width: 16px;
        height: 16px;
        margin-right: 8px;
        background: linear-gradient(45deg, #60a5fa, #3b82f6);
        border-radius: 3px;
      }
    }
    
    .node-info {
      color: #cbd5e1;
      font-size: 12px;
      opacity: 0.8;
    }
  }

  .menu-items {
    padding: 8px 0;
  }

  .menu-group {
    margin-bottom: 4px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  .menu-item {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    color: #e2e8f0;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    
    &:hover {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
      transform: translateX(2px);
    }

    &.primary:hover {
      background: rgba(34, 197, 94, 0.2);
      color: #4ade80;
    }

    &.danger:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
    }

    .menu-icon {
      width: 16px;
      height: 16px;
      margin-right: 12px;
      border-radius: 3px;
      
      &.approve-icon {
        background: linear-gradient(45deg, #10b981, #059669);
      }
      
      &.reject-icon {
        background: linear-gradient(45deg, #ef4444, #dc2626);
      }
      
      &.view-icon {
        background: linear-gradient(45deg, #3b82f6, #2563eb);
      }
      
      &.comment-icon {
        background: linear-gradient(45deg, #f59e0b, #d97706);
      }
      
      &.assign-icon {
        background: linear-gradient(45deg, #8b5cf6, #7c3aed);
      }
      
      &.history-icon {
        background: linear-gradient(45deg, #6b7280, #4b5563);
      }
    }

    .menu-text {
      flex: 1;
    }

    .menu-shortcut {
      font-size: 11px;
      color: #94a3b8;
      background: rgba(148, 163, 184, 0.1);
      padding: 2px 6px;
      border-radius: 3px;
      margin-left: 8px;
    }
  }

  .menu-divider {
    height: 1px;
    background: rgba(59, 130, 246, 0.3);
    margin: 4px 12px;
  }
}

@keyframes menuFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .review-context-menu {
    min-width: 180px;
    
    .menu-item {
      padding: 12px 16px;
      font-size: 14px;
    }
  }
}
</style> 