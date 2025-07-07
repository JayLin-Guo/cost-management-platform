<template>
  <header class="app-header">
    <div class="header-content">
      <!-- 左侧Logo和标题 -->
      <div class="header-left">
        <div class="logo">
          <IconifyIcon icon="mdi:cube-outline" size="32" />
        </div>
        <h1 class="title">成本管理平台</h1>
      </div>

      <!-- 中间导航菜单 -->
      <nav class="header-nav">
        <router-link 
          v-for="route in navRoutes" 
          :key="route.path"
          :to="route.path"
          class="nav-item"
          :class="{ active: $route.path === route.path }"
        >
          <IconifyIcon :icon="route.icon" size="18" />
          <span>{{ route.meta.title }}</span>
        </router-link>
      </nav>

      <!-- 右侧用户信息 -->
      <div class="header-right">
        <div class="user-info">
          <div class="user-avatar">
            <IconifyIcon icon="mdi:account" size="24" />
          </div>
          <div class="user-details">
            <span class="user-name">管理员</span>
            <span class="user-role">系统管理员</span>
          </div>
        </div>
        <button class="logout-btn">
          <IconifyIcon icon="mdi:logout" size="18" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import IconifyIcon from '@/components/IconifyIcon.vue'

const router = useRouter()

// 导航路由配置
const navRoutes = computed(() => [
  {
    path: '/',
    icon: 'mdi:home',
    meta: { title: '首页' }
  },
  {
    path: '/threeworkflow1',
    icon: 'mdi:workflow',
    meta: { title: '三维工作流' }
  },
  {
    path: '/workflow-animation',
    icon: 'mdi:animation',
    meta: { title: '工作流动画' }
  },
  {
    path: '/examples',
    icon: 'mdi:view-dashboard',
    meta: { title: '示例页面' }
  }
])
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 左侧Logo和标题 */
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #00A6FB 0%, #0084C7 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 8px rgba(0, 166, 251, 0.3);
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  background: linear-gradient(135deg, #00A6FB 0%, #0084C7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 中间导航 */
.header-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.nav-item:hover {
  background: rgba(0, 166, 251, 0.1);
  color: #00A6FB;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(0, 166, 251, 0.1) 0%, rgba(0, 132, 199, 0.05) 100%);
  color: #00A6FB;
  font-weight: 600;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 16px;
  right: 16px;
  height: 2px;
  background: linear-gradient(90deg, #00A6FB 0%, #0084C7 100%);
  border-radius: 1px;
}

/* 右侧用户信息 */
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(0, 166, 251, 0.05);
  border: 1px solid rgba(0, 166, 251, 0.1);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00A6FB 0%, #0084C7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.user-role {
  font-size: 12px;
  color: #6b7280;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
  
  .title {
    font-size: 18px;
  }
  
  .header-nav {
    display: none;
  }
  
  .user-details {
    display: none;
  }
}
</style> 