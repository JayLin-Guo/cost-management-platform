<template>
  <div class="reviewer-management">
    <div class="page-header">
      <div class="header-left">
        <h2>审核人员配置</h2>
        <p>管理各部门的审核人员及其审核权限</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleAddReviewer()">
          <el-icon><Plus /></el-icon>
          添加审核人员
        </el-button>
      </div>
    </div>

    <el-card class="reviewer-card">
      <!-- 筛选条件 -->
      <div class="reviewer-filters">
        <el-form :model="searchForm" inline>
          <el-form-item label="部门">
            <el-select
              v-model="searchForm.departmentId"
              placeholder="选择部门"
              clearable
              style="width: 200px"
            >
              <el-option
                v-for="dept in departments"
                :key="dept.id"
                :label="dept.name"
                :value="dept.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="审核级别">
            <el-select
              v-model="searchForm.reviewerLevel"
              placeholder="选择级别"
              clearable
              style="width: 150px"
            >
              <el-option
                v-for="level in REVIEWER_LEVEL_OPTIONS"
                :key="level.value"
                :label="level.label"
                :value="level.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="任务类型">
            <el-select
              v-model="searchForm.taskCategory"
              placeholder="选择任务类型"
              clearable
              style="width: 150px"
            >
              <el-option
                v-for="category in TASK_CATEGORY_OPTIONS"
                :key="category.value"
                :label="category.label"
                :value="category.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索姓名或用户名"
              style="width: 200px"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadReviewerConfigs">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 审核人员列表 -->
      <div class="reviewer-table">
        <el-table
          :data="reviewerConfigs"
          style="width: 100%"
          v-loading="loading"
          empty-text="暂无审核人员配置"
        >
          <el-table-column prop="user.name" label="审核人员" width="120">
            <template #default="{ row }">
              <div class="user-info">
                <el-avatar :size="32" :src="row.user.avatar" :alt="row.user.name">
                  {{ row.user.name.charAt(0) }}
                </el-avatar>
                <div class="user-details">
                  <div class="user-name">{{ row.user.name }}</div>
                  <div class="user-username">{{ row.user.username }}</div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="department.name" label="所属部门" width="120">
            <template #default="{ row }">
              <el-tag type="info" size="small">
                {{ row.department.name }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="reviewerLevel" label="审核级别" width="100">
            <template #default="{ row }">
              <el-tag :type="getLevelTagType(row.reviewerLevel)" size="small">
                {{ getLevelText(row.reviewerLevel) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="taskCategories" label="支持任务类型" min-width="200">
            <template #default="{ row }">
              <div class="task-categories">
                <el-tag
                  v-for="category in row.taskCategories"
                  :key="category"
                  size="small"
                  class="category-tag"
                >
                  {{ getCategoryText(category) }}
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="isActive" label="状态" width="80">
            <template #default="{ row }">
              <el-switch v-model="row.isActive" @change="updateStatus(row)" :disabled="updating" />
            </template>
          </el-table-column>

          <el-table-column prop="createdAt" label="创建时间" width="160">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button-group size="small">
                <el-button @click="handleEditReviewer(row)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button type="danger" @click="handleDeleteReviewer(row)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadReviewerConfigs"
            @current-change="loadReviewerConfigs"
          />
        </div>
      </div>
    </el-card>

    <!-- 添加/编辑审核人员对话框 -->
    <ReviewerConfigDialog
      v-model="dialogVisible"
      :reviewer-config="currentReviewerConfig"
      :departments="departments"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'
import ReviewerConfigDialog from './components/ReviewerConfigDialog.vue'
import { reviewerApi } from '@/api/reviewer'
import { departmentApi } from '@/api/department'
import type { ReviewerConfig, ReviewerConfigQuery } from '@/types/reviewer'
import type { Department } from '@/types/department'
import {
  REVIEWER_LEVEL_OPTIONS,
  TASK_CATEGORY_OPTIONS,
  ReviewerLevel,
  TaskCategory,
} from '@/types/reviewer'

// 响应式数据
const loading = ref(false)
const updating = ref(false)
const dialogVisible = ref(false)
const reviewerConfigs = ref<ReviewerConfig[]>([])
const departments = ref<Department[]>([])
const currentReviewerConfig = ref<ReviewerConfig | null>(null)

// 搜索表单
const searchForm = ref<ReviewerConfigQuery>({
  departmentId: undefined,
  reviewerLevel: undefined,
  taskCategory: undefined,
  keyword: '',
})

// 分页
const pagination = ref({
  page: 1,
  size: 20,
  total: 0,
})

// 加载部门数据
const loadDepartments = async () => {
  try {
    const data = await departmentApi.getDepartmentList()
    departments.value = data
  } catch (error) {
    console.error('Load departments error:', error)
  }
}

// 加载审核人员配置
const loadReviewerConfigs = async () => {
  try {
    loading.value = true
    const params = {
      ...searchForm.value,
      page: pagination.value.page,
      size: pagination.value.size,
    }
    const response = await reviewerApi.getReviewerConfigs(params)
    reviewerConfigs.value = response.data
    pagination.value.total = response.total
  } catch (error) {
    ElMessage.error('加载审核人员配置失败')
    console.error('Load reviewer configs error:', error)
  } finally {
    loading.value = false
  }
}

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    departmentId: undefined,
    reviewerLevel: undefined,
    taskCategory: undefined,
    keyword: '',
  }
  pagination.value.page = 1
  loadReviewerConfigs()
}

// 添加审核人员
const handleAddReviewer = () => {
  currentReviewerConfig.value = null
  dialogVisible.value = true
}

// 编辑审核人员
const handleEditReviewer = (config: ReviewerConfig) => {
  currentReviewerConfig.value = { ...config }
  dialogVisible.value = true
}

// 删除审核人员
const handleDeleteReviewer = async (config: ReviewerConfig) => {
  try {
    await ElMessageBox.confirm(`确定要删除 "${config.user.name}" 的审核人员配置吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await reviewerApi.deleteReviewerConfig(config.id)
    ElMessage.success('删除成功')
    await loadReviewerConfigs()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 更新状态
const updateStatus = async (config: ReviewerConfig) => {
  try {
    updating.value = true
    await reviewerApi.updateReviewerConfig(config.id, {
      isActive: config.isActive,
    })
    ElMessage.success('状态更新成功')
  } catch (error: any) {
    // 恢复原状态
    config.isActive = !config.isActive
    ElMessage.error(error.message || '状态更新失败')
  } finally {
    updating.value = false
  }
}

// 对话框成功回调
const handleDialogSuccess = () => {
  loadReviewerConfigs()
}

// 获取级别标签类型
const getLevelTagType = (level: ReviewerLevel) => {
  const option = REVIEWER_LEVEL_OPTIONS.find((opt) => opt.value === level)
  return option?.color || 'info'
}

// 获取级别文本
const getLevelText = (level: ReviewerLevel) => {
  const option = REVIEWER_LEVEL_OPTIONS.find((opt) => opt.value === level)
  return option?.label || level
}

// 获取任务类型文本
const getCategoryText = (category: TaskCategory) => {
  const option = TASK_CATEGORY_OPTIONS.find((opt) => opt.value === category)
  return option?.label || category
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  loadDepartments()
  loadReviewerConfigs()
})
</script>

<style scoped lang="scss">
.reviewer-management {
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

  .reviewer-card {
    .reviewer-filters {
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-color-light);
      margin-bottom: 20px;

      .el-form {
        .el-form-item {
          margin-bottom: 16px;
        }
      }
    }

    .reviewer-table {
      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .user-details {
          .user-name {
            font-weight: 500;
            color: var(--text-color);
            font-size: 14px;
          }

          .user-username {
            font-size: 12px;
            color: var(--text-color-secondary);
          }
        }
      }

      .task-categories {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;

        .category-tag {
          margin: 0;
        }
      }

      .pagination-container {
        display: flex;
        justify-content: center;
        margin-top: 20px;
      }
    }
  }
}

:deep(.el-table) {
  .el-table__cell {
    padding: 12px 0;
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--text-color);
}

:deep(.el-input__wrapper) {
  border-radius: 6px;
}

:deep(.el-select) {
  .el-select__wrapper {
    border-radius: 6px;
  }
}
</style>
