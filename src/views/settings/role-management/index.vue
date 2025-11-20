<template>
  <div class="role-management">
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">角色管理</h2>
        <p class="page-description">管理系统角色和权限配置</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleAddRole">
          <el-icon><Plus /></el-icon>
          新增角色
        </el-button>
      </div>
    </div>

    <div class="role-cards">
      <div v-for="role in roleList" :key="role.id" class="role-card">
        <div class="card-header">
          <div class="role-info">
            <h3 class="role-name">{{ role.name }}</h3>
            <p class="role-description">{{ role.description }}</p>
          </div>
          <div class="role-actions">
            <el-dropdown @command="(command) => handleRoleAction(command, role)">
              <el-button type="text">
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item command="permissions">权限配置</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <div class="card-content">
          <div class="role-stats">
            <div class="stat-item">
              <span class="stat-label">用户数量</span>
              <span class="stat-value">{{ role.userCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">权限数量</span>
              <span class="stat-value">{{ role.permissionCount }}</span>
            </div>
          </div>

          <div class="role-permissions">
            <h4>主要权限</h4>
            <div class="permission-tags">
              <el-tag
                v-for="permission in role.permissions.slice(0, 3)"
                :key="permission"
                size="small"
                class="permission-tag"
              >
                {{ permission }}
              </el-tag>
              <el-tag
                v-if="role.permissions.length > 3"
                size="small"
                type="info"
                class="permission-tag"
              >
                +{{ role.permissions.length - 3 }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, MoreFilled } from '@element-plus/icons-vue'

// 角色列表
const roleList = ref([])

// 模拟角色数据
const mockRoles = [
  {
    id: 1,
    name: '超级管理员',
    description: '拥有系统所有权限，可以管理所有功能模块',
    userCount: 2,
    permissionCount: 15,
    permissions: ['用户管理', '角色管理', '系统配置', '数据导出', '日志查看'],
  },
  {
    id: 2,
    name: '项目经理',
    description: '负责项目管理和团队协调，拥有项目相关权限',
    userCount: 5,
    permissionCount: 8,
    permissions: ['项目管理', '任务分配', '进度查看', '报告生成'],
  },
  {
    id: 3,
    name: '普通用户',
    description: '基础用户权限，可以查看和操作自己的数据',
    userCount: 25,
    permissionCount: 3,
    permissions: ['数据查看', '个人设置', '密码修改'],
  },
]

// 加载角色列表
const loadRoleList = async () => {
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 300))
    roleList.value = mockRoles
  } catch (error) {
    ElMessage.error('加载角色列表失败')
  }
}

// 新增角色
const handleAddRole = () => {
  ElMessage.info('新增角色功能开发中...')
}

// 角色操作
const handleRoleAction = async (command: string, role: any) => {
  switch (command) {
    case 'edit':
      ElMessage.info(`编辑角色: ${role.name}`)
      break
    case 'permissions':
      ElMessage.info(`配置权限: ${role.name}`)
      break
    case 'delete':
      try {
        await ElMessageBox.confirm(`确定要删除角色 ${role.name} 吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        ElMessage.success('删除成功')
        loadRoleList()
      } catch {
        // 用户取消
      }
      break
  }
}

onMounted(() => {
  loadRoleList()
})
</script>

<style scoped lang="scss">
.role-management {
  padding: 24px;
  background: var(--body-background);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    padding: 24px;
    background: var(--component-background);
    border-radius: 8px;
    box-shadow: var(--shadow-1);

    .header-content {
      .page-title {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--text-color);
      }

      .page-description {
        margin: 0;
        color: var(--text-color-secondary);
        font-size: 14px;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .role-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 24px;

    .role-card {
      background: var(--component-background);
      border-radius: 8px;
      box-shadow: var(--shadow-1);
      padding: 24px;
      transition: all 0.3s;

      &:hover {
        box-shadow: var(--shadow-2);
        transform: translateY(-2px);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;

        .role-info {
          flex: 1;

          .role-name {
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--text-color);
          }

          .role-description {
            margin: 0;
            font-size: 14px;
            color: var(--text-color-secondary);
            line-height: 1.5;
          }
        }

        .role-actions {
          .el-button {
            color: var(--text-color-secondary);

            &:hover {
              color: var(--primary-color);
            }
          }
        }
      }

      .card-content {
        .role-stats {
          display: flex;
          gap: 24px;
          margin-bottom: 20px;
          padding: 16px;
          background: var(--hover-background);
          border-radius: 6px;

          .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;

            .stat-label {
              font-size: 12px;
              color: var(--text-color-secondary);
              margin-bottom: 4px;
            }

            .stat-value {
              font-size: 20px;
              font-weight: 600;
              color: var(--primary-color);
            }
          }
        }

        .role-permissions {
          h4 {
            margin: 0 0 12px 0;
            font-size: 14px;
            font-weight: 500;
            color: var(--text-color);
          }

          .permission-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;

            .permission-tag {
              border-radius: 4px;
            }
          }
        }
      }
    }
  }
}
</style>
