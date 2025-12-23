<template>
  <div class="settings-container">
    <!-- 左侧菜单 -->
    <div class="settings-sidebar">
      <div class="sidebar-header">
        <h3>系统设置</h3>
      </div>
      <el-menu :default-active="activeMenu" class="settings-menu" @select="handleMenuSelect">
        <el-sub-menu index="user">
          <template #title>
            <el-icon><UserFilled /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/settings/user-management">
            <el-icon><User /></el-icon>
            <span>用户列表</span>
          </el-menu-item>
          <el-menu-item index="/settings/role-management">
            <el-icon><Avatar /></el-icon>
            <span>角色管理</span>
          </el-menu-item>
          <!-- <el-menu-item index="/settings/department-management">
            <el-icon><OfficeBuilding /></el-icon>
            <span>部门管理</span>
          </el-menu-item> -->
          <el-menu-item index="/settings/task-category-management">
            <el-icon><List /></el-icon>
            <span>任务分类管理</span>
          </el-menu-item>
          <el-menu-item index="/settings/review-step-template-management">
            <el-icon><Document /></el-icon>
            <span>审核步骤模板管理</span>
          </el-menu-item>
          <el-menu-item index="/settings/review-config-management">
            <el-icon><Setting /></el-icon>
            <span>审核配置管理</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统配置</span>
          </template>
          <el-menu-item index="/settings/system-config">
            <el-icon><Tools /></el-icon>
            <span>基础配置</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>

    <!-- 右侧内容区 -->
    <div class="settings-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  UserFilled,
  User,
  Avatar,
  Setting,
  Tools,
  OfficeBuilding,
  List,
  Document,
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const activeMenu = ref('')

// 监听路由变化更新激活菜单
watch(
  () => route.path,
  (path) => {
    activeMenu.value = path
  },
  { immediate: true },
)

// 菜单选择处理
const handleMenuSelect = (index: string) => {
  router.push(index)
}
</script>

<style scoped lang="scss">
.settings-container {
  display: flex;
  height: calc(100vh - 64px); // 减去header高度
  background: var(--body-background);

  .settings-sidebar {
    display: flex;
    flex-direction: column;
    width: 260px;
    background: var(--component-background);
    border-right: 1px solid var(--border-color-light);
    box-shadow: var(--shadow-1);

    .sidebar-header {
      flex-shrink: 0;
      padding: 20px;
      border-bottom: 1px solid var(--border-color-light);

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--text-color);
      }
    }

    .settings-menu {
      flex: 1;
      overflow-y: auto;
      background: transparent;
      border: none;

      :deep(.el-sub-menu__title) {
        height: 48px;
        padding-left: 20px !important;
        font-weight: 500;
        line-height: 48px;
        color: var(--text-color);

        &:hover {
          background: var(--hover-background);
        }
      }

      :deep(.el-menu-item) {
        height: 44px;
        padding-left: 50px !important;
        line-height: 44px;
        color: var(--text-color-secondary);

        &:hover {
          color: var(--primary-color);
          background: var(--hover-background);
        }

        &.is-active {
          color: var(--primary-color);
          background: var(--primary-color-light);
          border-right: 3px solid var(--primary-color);
        }
      }

      :deep(.el-sub-menu.is-active .el-sub-menu__title) {
        color: var(--primary-color);
      }

      :deep(.el-icon) {
        margin-right: 8px;
        font-size: 16px;
      }
    }
  }

  .settings-content {
    flex: 1;
    overflow: hidden auto;
  }
}
</style>
