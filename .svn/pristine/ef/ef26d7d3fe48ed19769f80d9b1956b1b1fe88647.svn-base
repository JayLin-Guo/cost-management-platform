<template>
  <div class="app-header">
    <div class="header-left">
      <h1 class="logo">
        <span class="logo-icon">
          <img
            src="https://testwww.zhaobiaopt.com/gatewaylogo/bzb.png?time=1761875306495"
            alt="logo"
          />
        </span>
        <span class="logo-text">造价管理平台</span>
      </h1>
    </div>

    <div class="header-center">
      <div class="tabs">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-item', { active: activeTab === tab.key }]"
          @click="handleTabClick(tab.key)"
        >
          <el-icon class="tab-icon">
            <component :is="tab.icon" />
          </el-icon>
          <span class="tab-label">{{ tab.label }}</span>
        </div>
      </div>
    </div>

    <div class="header-right">
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="36" :src="userStore.userInfo.avatar">
            {{ userStore.userInfo.nickname?.charAt(0) || 'U' }}
          </el-avatar>
          <span class="username">{{ userStore.userInfo.nickname || '用户' }}</span>
          <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="naming">
              <el-icon><MagicStick /></el-icon>
              命名助手
            </el-dropdown-item>
            <el-dropdown-item divided command="profile">
              <el-icon><User /></el-icon>
              个人信息
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>
              系统设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  List,
  Share,
  ArrowDown,
  User,
  Setting,
  SwitchButton,
  MagicStick,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 定义页签
const tabs = [
  {
    key: 'task-list',
    label: '任务列表',
    icon: List,
    path: '/task',
  },
  {
    key: 'workflow',
    label: '流程页面',
    icon: Share,
    path: '/workflow',
  },
]

// 当前激活的页签
const activeTab = ref<string>('task-list')

// 监听路由变化更新激活页签
watch(
  () => route.path,
  (path) => {
    const tab = tabs.find((t) => t.path === path)
    if (tab) {
      activeTab.value = tab.key
    }
  },
  { immediate: true },
)

// 页签点击
const handleTabClick = (key: string) => {
  const tab = tabs.find((t) => t.key === key)
  if (tab) {
    activeTab.value = key
    router.push(tab.path)
  }
}

// 下拉菜单命令处理
const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人信息功能开发中...')
      break
    case 'settings':
      ElMessage.info('系统设置功能开发中...')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        userStore.logout()
        ElMessage.success('已退出登录')
        router.push('/login')
      } catch {
        // 用户取消
      }
      break
  }
}
</script>

<style scoped lang="scss">
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
  background: var(--component-background);
  border-bottom: 1px solid var(--border-color-light);
  box-shadow: var(--shadow-1);

  .header-left {
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 20px;

      font-weight: 600;
      color: var(--primary-color);

      .logo-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      .logo-text {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
  }

  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;

    .tabs {
      display: flex;
      gap: 8px;
      padding: 4px;
      background: var(--hover-background);
      border-radius: 8px;

      .tab-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 24px;
        border-radius: 6px;
        font-size: 14px;
        color: var(--text-color-secondary);
        cursor: pointer;
        transition: all 0.3s;
        user-select: none;

        .tab-icon {
          font-size: 18px;
        }

        &:hover {
          color: var(--primary-color);
          background: var(--active-background);
        }

        &.active {
          color: #fff;
          background: var(--primary-color);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        }
      }
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: var(--hover-background);
      }

      .username {
        font-size: 14px;
        color: var(--text-color);
      }

      .dropdown-icon {
        font-size: 14px;
        color: var(--text-color-secondary);
        transition: transform 0.3s;
      }

      &:hover .dropdown-icon {
        color: var(--primary-color);
      }
    }
  }
}
</style>
