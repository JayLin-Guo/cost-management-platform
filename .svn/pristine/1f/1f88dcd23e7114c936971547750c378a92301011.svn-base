<template>
  <div class="home-container">
    <!-- 顶部 Header -->
    <AppHeader />

    <!-- 主内容区 -->
    <div class="home-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<style scoped lang="scss">
.home-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: var(--body-background);

  .home-content {
    flex: 1;
    overflow: auto;
  }
}
</style>
