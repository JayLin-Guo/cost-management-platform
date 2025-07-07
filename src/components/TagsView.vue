<template>
  <div class="tags-view">
    <div class="tags-container">
      <div class="tags-list" ref="tagsListRef">
        <div 
          v-for="tag in visitedTags" 
          :key="tag.path"
          class="tag-item"
          :class="{ active: isActive(tag) }"
          @click="clickTag(tag)"
        >
          <IconifyIcon :icon="tag.icon" size="14" />
          <span class="tag-title">{{ tag.title }}</span>
          <button 
            v-if="!isAffix(tag)"
            class="tag-close"
            @click.stop="closeTag(tag)"
          >
            <IconifyIcon icon="mdi:close" size="12" />
          </button>
        </div>
      </div>
      
      <!-- 右侧操作按钮 -->
      <div class="tags-actions">
        <button class="action-btn" @click="refreshPage" title="刷新">
          <IconifyIcon icon="mdi:refresh" size="16" />
        </button>
        <button class="action-btn" @click="closeAllTags" title="关闭所有">
          <IconifyIcon icon="mdi:close-box-multiple" size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import IconifyIcon from '@/components/IconifyIcon.vue'

interface TagItem {
  path: string
  name: string
  title: string
  icon: string
  affix?: boolean
}

const router = useRouter()
const route = useRoute()
const tagsListRef = ref<HTMLElement>()

// 访问过的标签
const visitedTags = ref<TagItem[]>([
  {
    path: '/',
    name: 'Home',
    title: '首页',
    icon: 'mdi:home',
    affix: true
  }
])

// 标签到图标的映射
const routeIconMap: Record<string, string> = {
  '/': 'mdi:home',
  '/threeworkflow1': 'mdi:workflow',
  '/workflow-animation': 'mdi:animation'
}

// 判断是否为当前活动标签
const isActive = (tag: TagItem) => {
  return route.path === tag.path
}

// 判断是否为固定标签
const isAffix = (tag: TagItem) => {
  return tag.affix || false
}

// 添加标签
const addTag = (newRoute: any) => {
  const { path, name, meta } = newRoute
  
  // 检查是否已存在
  const existingTag = visitedTags.value.find(tag => tag.path === path)
  if (existingTag) {
    return
  }
  
  const tag: TagItem = {
    path,
    name,
    title: meta?.title || name,
    icon: routeIconMap[path] || 'mdi:file-document'
  }
  
  visitedTags.value.push(tag)
}

// 点击标签
const clickTag = (tag: TagItem) => {
  if (route.path !== tag.path) {
    router.push(tag.path)
  }
}

// 关闭标签
const closeTag = (tag: TagItem) => {
  const index = visitedTags.value.findIndex(t => t.path === tag.path)
  if (index === -1) return
  
  visitedTags.value.splice(index, 1)
  
  // 如果关闭的是当前标签，跳转到下一个标签
  if (isActive(tag)) {
    const nextTag = visitedTags.value[index] || visitedTags.value[index - 1]
    if (nextTag) {
      router.push(nextTag.path)
    }
  }
}

// 关闭所有标签
const closeAllTags = () => {
  visitedTags.value = visitedTags.value.filter(tag => isAffix(tag))
  
  // 跳转到首页
  if (route.path !== '/') {
    router.push('/')
  }
}

// 刷新页面
const refreshPage = () => {
  window.location.reload()
}

// 监听路由变化
watch(route, (newRoute) => {
  addTag(newRoute)
}, { immediate: true })
</script>

<style scoped>
.tags-view {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  height: 44px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  z-index: 999;
}

.tags-container {
  display: flex;
  align-items: center;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.tags-list {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 0;
}

.tags-list::-webkit-scrollbar {
  height: 4px;
}

.tags-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.tags-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.tags-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  user-select: none;
  min-width: 0;
}

.tag-item:hover {
  background: rgba(0, 166, 251, 0.1);
  border-color: rgba(0, 166, 251, 0.3);
  color: #00A6FB;
}

.tag-item.active {
  background: linear-gradient(135deg, #00A6FB 0%, #0084C7 100%);
  border-color: #00A6FB;
  color: #ffffff;
}

.tag-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: currentColor;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.7;
}

.tag-close:hover {
  background: rgba(255, 255, 255, 0.3);
  opacity: 1;
}

.tag-item:not(.active) .tag-close {
  background: rgba(100, 116, 139, 0.1);
}

.tag-item:not(.active) .tag-close:hover {
  background: rgba(100, 116, 139, 0.2);
}

.tags-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(0, 166, 251, 0.1);
  color: #00A6FB;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tags-container {
    padding: 0 16px;
  }
  
  .tags-actions {
    margin-left: 12px;
  }
  
  .action-btn {
    width: 28px;
    height: 28px;
  }
}
</style> 