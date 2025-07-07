<template>
  <div class="app-layout">
    <!-- 头部 -->
    <AppHeader />
    
    <!-- 标签页视图 -->
    <TagsView />
    
    <!-- 主内容区域 -->
    <main class="main-content">
      <div class="content-wrapper">
        <router-view />
      </div>
    </main>
    
    <!-- 尾部 -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import TagsView from './TagsView.vue'
import AppFooter from './AppFooter.vue'
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.main-content {
  flex: 1;
  padding-top: 108px; /* 64px(header) + 44px(tags) */
  min-height: calc(100vh - 108px);
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 108px - 48px); /* 减去内边距 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 16px;
  }
}
</style> 