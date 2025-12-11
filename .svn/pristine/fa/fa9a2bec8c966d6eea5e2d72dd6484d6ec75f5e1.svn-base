<template>
  <div class="department-management">
    <div class="page-header">
      <div class="header-left">
        <h2>部门管理</h2>
        <p>管理组织架构和部门层级关系</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleAddDepartment()">
          <el-icon><Plus /></el-icon>
          添加部门
        </el-button>
      </div>
    </div>

    <el-card class="department-card">
      <div class="department-toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索部门名称或编码"
            style="width: 300px"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="toolbar-right">
          <el-button @click="expandAll">展开全部</el-button>
          <el-button @click="collapseAll">收起全部</el-button>
          <el-button @click="loadDepartments">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <div class="department-tree-container">
        <el-tree
          ref="treeRef"
          :data="departmentTree"
          :props="treeProps"
          node-key="id"
          :default-expand-all="false"
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
          :allow-drop="allowDrop"
          :allow-drag="allowDrag"
          draggable
          @node-drop="handleNodeDrop"
        >
          <template #default="{ node, data }">
            <div class="department-node">
              <div class="node-content">
                <div class="node-info">
                  <el-icon class="department-icon">
                    <OfficeBuilding v-if="!data.parentId" />
                    <Folder v-else />
                  </el-icon>
                  <span class="department-name">{{ data.name }}</span>
                  <el-tag size="small" class="department-code">{{ data.code }}</el-tag>
                  <span class="user-count">{{ data.userCount || 0 }}人</span>
                  <el-tag v-if="!data.isActive" type="danger" size="small" class="status-tag">
                    已禁用
                  </el-tag>
                </div>
                <div class="node-actions">
                  <el-button-group size="small">
                    <el-button @click="handleAddDepartment(data)">
                      <el-icon><Plus /></el-icon>
                      添加子部门
                    </el-button>
                    <el-button @click="handleEditDepartment(data)">
                      <el-icon><Edit /></el-icon>
                      编辑
                    </el-button>
                    <el-button
                      type="danger"
                      @click="handleDeleteDepartment(data)"
                      :disabled="(data.children && data.children.length > 0) || data.userCount > 0"
                    >
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-button>
                  </el-button-group>
                </div>
              </div>
            </div>
          </template>
        </el-tree>
      </div>
    </el-card>

    <!-- 添加/编辑部门对话框 -->
    <DepartmentDialog
      v-model="dialogVisible"
      :department="currentDepartment"
      :parent-department="parentDepartment"
      :department-tree="departmentTree"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, ElTree } from 'element-plus'
import {
  Plus,
  Search,
  Refresh,
  Edit,
  Delete,
  OfficeBuilding,
  Folder,
} from '@element-plus/icons-vue'
import DepartmentDialog from './components/DepartmentDialog.vue'
import { departmentApi } from '@/api/department'
import type { Department } from '@/types/department'

// 响应式数据
const treeRef = ref<InstanceType<typeof ElTree>>()
const departmentTree = ref<Department[]>([])
const searchKeyword = ref('')
const dialogVisible = ref(false)
const currentDepartment = ref<Department | null>(null)
const parentDepartment = ref<Department | null>(null)

// 树形组件配置
const treeProps = {
  children: 'children',
  label: 'name',
}

// 加载部门数据
const loadDepartments = async () => {
  try {
    const data = await departmentApi.getDepartmentTree()
    departmentTree.value = data
  } catch (error) {
    ElMessage.error('加载部门数据失败')
    console.error('Load departments error:', error)
  }
}

// 搜索过滤
const handleSearch = () => {
  treeRef.value?.filter(searchKeyword.value)
}

const filterNode = (value: string, data: Department) => {
  if (!value) return true
  return data.name.includes(value) || data.code.includes(value)
}

// 展开/收起操作
const expandAll = () => {
  const nodes = treeRef.value?.store.nodesMap
  if (nodes) {
    Object.values(nodes).forEach((node: any) => {
      node.expanded = true
    })
  }
}

const collapseAll = () => {
  const nodes = treeRef.value?.store.nodesMap
  if (nodes) {
    Object.values(nodes).forEach((node: any) => {
      node.expanded = false
    })
  }
}

// 添加部门
const handleAddDepartment = (parent?: Department) => {
  currentDepartment.value = null
  parentDepartment.value = parent || null
  dialogVisible.value = true
}

// 编辑部门
const handleEditDepartment = (department: Department) => {
  currentDepartment.value = { ...department }
  parentDepartment.value = null
  dialogVisible.value = true
}

// 删除部门
const handleDeleteDepartment = async (department: Department) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除部门"${department.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    await departmentApi.deleteDepartment(department.id)
    ElMessage.success('删除成功')
    await loadDepartments()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 拖拽相关
const allowDrag = (draggingNode: any) => {
  // 根部门不允许拖拽
  return draggingNode.data.parentId !== null
}

const allowDrop = (draggingNode: any, dropNode: any, type: string) => {
  // 不允许拖拽到自己的子节点
  if (type === 'inner') {
    return !isDescendant(dropNode.data, draggingNode.data)
  }
  return true
}

const isDescendant = (ancestor: Department, descendant: Department): boolean => {
  if (ancestor.id === descendant.id) return true
  if (descendant.children) {
    return descendant.children.some((child) => isDescendant(ancestor, child))
  }
  return false
}

const handleNodeDrop = async (draggingNode: any, dropNode: any, dropType: string) => {
  try {
    const dragData = draggingNode.data
    let newParentId = null

    if (dropType === 'inner') {
      newParentId = dropNode.data.id
    } else {
      newParentId = dropNode.data.parentId
    }

    await departmentApi.updateDepartment(dragData.id, {
      ...dragData,
      parentId: newParentId,
    })

    ElMessage.success('部门移动成功')
    await loadDepartments()
  } catch (error) {
    ElMessage.error('部门移动失败')
    await loadDepartments() // 重新加载以恢复原始状态
  }
}

// 对话框成功回调
const handleDialogSuccess = () => {
  loadDepartments()
}

// 初始化
onMounted(() => {
  loadDepartments()
})
</script>

<style scoped lang="scss">
.department-management {
  padding: 24px;
  background: var(--body-background);
  min-height: 100%;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;

    .header-left {
      h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--text-color);
      }

      p {
        margin: 0;
        color: var(--text-color-secondary);
        font-size: 14px;
      }
    }

    .header-right {
      .el-button {
        height: 40px;
        padding: 0 20px;
      }
    }
  }

  .department-card {
    .department-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-color-light);

      .toolbar-left {
        .el-input {
          :deep(.el-input__wrapper) {
            border-radius: 8px;
          }
        }
      }

      .toolbar-right {
        display: flex;
        gap: 8px;

        .el-button {
          border-radius: 6px;
        }
      }
    }

    .department-tree-container {
      .department-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        border-radius: 6px;
        transition: all 0.2s;

        &:hover {
          background: var(--hover-background);

          .node-actions {
            opacity: 1;
          }
        }

        .node-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;

          .node-info {
            display: flex;
            align-items: center;
            gap: 8px;

            .department-icon {
              font-size: 16px;
              color: var(--primary-color);
            }

            .department-name {
              font-weight: 500;
              color: var(--text-color);
              font-size: 14px;
            }

            .department-code {
              background: var(--primary-color-light);
              color: var(--primary-color);
              border: none;
            }

            .user-count {
              font-size: 12px;
              color: var(--text-color-secondary);
              background: var(--fill-color-light);
              padding: 2px 6px;
              border-radius: 4px;
            }

            .status-tag {
              margin-left: 4px;
            }
          }

          .node-actions {
            opacity: 0;
            transition: opacity 0.2s;

            .el-button-group {
              .el-button {
                padding: 4px 8px;
                font-size: 12px;
                border-radius: 4px;

                &:first-child {
                  border-top-right-radius: 0;
                  border-bottom-right-radius: 0;
                }

                &:last-child {
                  border-top-left-radius: 0;
                  border-bottom-left-radius: 0;
                }

                &:not(:first-child):not(:last-child) {
                  border-radius: 0;
                }
              }
            }
          }
        }
      }

      :deep(.el-tree-node__content) {
        height: auto;
        padding: 4px 0;
      }

      :deep(.el-tree-node__expand-icon) {
        color: var(--text-color-secondary);
        font-size: 14px;
      }

      :deep(.el-tree-node__expand-icon.expanded) {
        transform: rotate(90deg);
      }
    }
  }
}
</style>
