<template>
  <div class="review-config-management">
    <div class="search-section">
      <div class="search-left">
        <el-input
          v-model="searchForm.keyword"
          placeholder="输入名称或编码搜索"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="searchForm.isActive"
          placeholder="选择状态"
          clearable
          style="width: 120px"
        >
          <el-option label="启用" :value="true" />
          <el-option label="禁用" :value="false" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      <div class="search-right">
        <el-button type="primary" @click="handleAddConfig">
          <el-icon><Plus /></el-icon>
          新增审核配置
        </el-button>
      </div>
    </div>

    <div class="table-section">
      <!-- eslint-disable-next-line vue/max-attributes-per-line -->
      <el-table v-loading="loading" :data="configList" stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="配置名称" min-width="120" />
        <el-table-column prop="code" label="配置编码" width="150" />
        <el-table-column prop="description" label="描述" min-width="150">
          <template #default="{ row }">
            <span>{{ row.description || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="taskCategories" label="任务分类" min-width="150">
          <template #default="{ row }">
            <div v-if="row.taskCategories && row.taskCategories.length > 0" class="task-categories">
              <!-- 显示第1个任务分类 -->
              <el-tag
                v-for="category in row.taskCategories.slice(0, 1)"
                :key="category.id"
                size="small"
                type="success"
                style="margin-right: 4px; margin-bottom: 2px"
              >
                {{ category.name }}
              </el-tag>
              <!-- 如果超过1个任务分类，显示更多标识 -->
              <el-tooltip v-if="row.taskCategories.length > 1" placement="top" effect="dark">
                <template #content>
                  <div style="color: #fff">
                    <div style="font-weight: 600; margin-bottom: 8px; font-size: 13px; color: #fff">
                      关联任务分类列表：
                    </div>
                    <div>
                      <div
                        v-for="(category, index) in row.taskCategories"
                        :key="category.id"
                        style="
                          padding: 2px 0;
                          font-size: 12px;
                          color: rgba(255, 255, 255, 0.9);
                          line-height: 1.4;
                          margin-bottom: 2px;
                        "
                      >
                        <span style="color: #67c23a; font-weight: bold; margin-right: 6px">•</span>
                        {{ index + 1 }}. {{ category.name }}
                      </div>
                    </div>
                  </div>
                </template>
                <el-tag
                  size="small"
                  type="info"
                  style="margin-right: 4px; margin-bottom: 2px; cursor: pointer"
                >
                  +{{ row.taskCategories.length - 1 }}
                </el-tag>
              </el-tooltip>
            </div>
            <span v-else class="text-gray-400">未关联</span>
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="info" size="small" @click="handleConfigSteps(row)">配置步骤</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="pagination.total > 0" class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 新增/编辑审核配置对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑审核配置' : '新增审核配置'"
      width="600px"
      @close="handleDialogClose"
    >
      <div class="dialog-content">
        <el-form
          ref="configFormRef"
          :model="configForm"
          :rules="configFormRules"
          label-width="120px"
        >
          <el-form-item label="配置名称" prop="name">
            <el-input v-model="configForm.name" placeholder="请输入配置名称" />
          </el-form-item>
          <el-form-item label="配置编码" prop="code">
            <el-input v-model="configForm.code" placeholder="请输入配置编码" />
          </el-form-item>
          <el-form-item label="配置描述" prop="description">
            <el-input
              v-model="configForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入配置描述（可选）"
            />
          </el-form-item>
          <el-form-item label="任务分类" prop="taskCategoryIds">
            <el-select
              v-model="configForm.taskCategoryIds"
              multiple
              placeholder="请选择关联的任务分类"
              style="width: 100%"
              clearable
              collapse-tags
              collapse-tags-tooltip
            >
              <el-option
                v-for="category in taskCategoryList"
                :key="category.id"
                :label="`${category.name} (${category.code})`"
                :value="category.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="是否启用" prop="isActive">
            <el-switch v-model="configForm.isActive" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import {
  getReviewConfigList,
  createReviewConfig,
  updateReviewConfig,
  type CreateReviewConfigDto,
  type UpdateReviewConfigDto,
  type ReviewConfigEntity,
  type ReviewConfigPaginationDto,
} from '@/api/review-config'
import { getTaskCategoryList, type TaskCategoryEntity } from '@/api/task-category'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  isActive: undefined as boolean | undefined,
})

// 分页信息
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0,
})

// 审核配置列表
const configList = ref<ReviewConfigEntity[]>([])
const loading = ref(false)

// 任务分类列表
const taskCategoryList = ref<TaskCategoryEntity[]>([])
const categoryLoading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const configFormRef = ref<FormInstance>()

// 审核配置表单
const configForm = reactive({
  id: '',
  name: '',
  code: '',
  description: '',
  isActive: true,
  taskCategoryIds: [] as string[],
})

// 表单验证规则
const configFormRules: FormRules = {
  name: [
    { required: true, message: '请输入配置名称', trigger: 'blur' },
    { min: 1, max: 100, message: '配置名称长度在 1 到 100 个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入配置编码', trigger: 'blur' },
    { min: 1, max: 50, message: '配置编码长度在 1 到 50 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '配置编码只能包含字母、数字和下划线', trigger: 'blur' },
  ],
  description: [{ max: 500, message: '描述长度不能超过 500 个字符', trigger: 'blur' }],
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) {
    return '-'
  }
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 加载审核配置列表
const loadConfigList = async () => {
  loading.value = true
  try {
    const params: ReviewConfigPaginationDto = {
      pageNum: pagination.current,
      pageSize: pagination.size,
      keyword: searchForm.keyword || undefined,
      isActive: searchForm.isActive,
    }

    const result = await getReviewConfigList(params)

    if (result && result.data) {
      // 处理分页数据
      if (result.data.list) {
        configList.value = result.data.list
        pagination.total = result.data.total || 0
      } else {
        // 处理非分页数据
        configList.value = Array.isArray(result.data) ? result.data : []
        pagination.total = configList.value.length
      }
    } else {
      configList.value = []
      pagination.total = 0
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '加载审核配置列表失败'
    ElMessage.error(errorMessage)
    configList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadConfigList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.isActive = undefined
  handleSearch()
}

// 加载任务分类列表
const loadTaskCategoryList = async () => {
  categoryLoading.value = true
  try {
    const result = await getTaskCategoryList()
    if (result && result.data) {
      // 处理分页或非分页数据
      if (result.data.list) {
        taskCategoryList.value = result.data.list
      } else {
        taskCategoryList.value = Array.isArray(result.data) ? result.data : []
      }
    } else {
      taskCategoryList.value = []
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '加载任务分类列表失败'
    ElMessage.error(errorMessage)
    taskCategoryList.value = []
  } finally {
    categoryLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(configForm, {
    id: '',
    name: '',
    code: '',
    description: '',
    isActive: true,
    taskCategoryIds: [],
  })
}

// 新增审核配置
const handleAddConfig = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑审核配置
const handleEdit = (row: ReviewConfigEntity) => {
  isEdit.value = true
  // 从 taskCategories 中提取 taskCategoryIds
  const taskCategoryIds = row.taskCategories?.map((category) => category.id) || []
  Object.assign(configForm, {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description || '',
    isActive: row.isActive,
    taskCategoryIds: taskCategoryIds,
  })
  dialogVisible.value = true
}

// 对话框关闭
const handleDialogClose = () => {
  configFormRef.value?.resetFields()
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  if (!configFormRef.value) {
    return
  }

  await configFormRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }

    submitLoading.value = true
    try {
      if (isEdit.value) {
        // 编辑模式
        const updateData: UpdateReviewConfigDto = {
          name: configForm.name,
          code: configForm.code,
          description: configForm.description || undefined,
          isActive: configForm.isActive,
          taskCategoryIds: configForm.taskCategoryIds,
        }
        await updateReviewConfig(configForm.id, updateData)
        ElMessage.success('更新成功')
      } else {
        // 新增模式
        const createData: CreateReviewConfigDto = {
          name: configForm.name,
          code: configForm.code,
          description: configForm.description || undefined,
          isActive: configForm.isActive,
          taskCategoryIds: configForm.taskCategoryIds,
        }
        await createReviewConfig(createData)
        ElMessage.success('创建成功')
      }

      dialogVisible.value = false
      loadConfigList()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '操作失败'
      ElMessage.error(errorMessage)
    } finally {
      submitLoading.value = false
    }
  })
}

// 配置步骤模板
const handleConfigSteps = (row: ReviewConfigEntity) => {
  // 跳转到步骤模板配置页面
  router.push(`/settings/review-config-management/${row.id}/steps`)
}

// 删除审核配置
const handleDelete = async (row: ReviewConfigEntity) => {
  try {
    await ElMessageBox.confirm(`确定要删除审核配置 "${row.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 注意：这里缺少删除接口，需要在API中添加
    ElMessage.warning('删除功能待后端提供接口')
    // await deleteReviewConfig(row.id)
    // ElMessage.success('删除成功')
    // loadConfigList()
  } catch (error: unknown) {
    if (error !== 'cancel') {
      const errorMessage = error instanceof Error ? error.message : '删除失败'
      ElMessage.error(errorMessage)
    }
  }
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.size = size
  loadConfigList()
}

// 当前页改变
const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadConfigList()
}

onMounted(() => {
  loadConfigList()
  loadTaskCategoryList()
})
</script>

<style scoped lang="scss">
.review-config-management {
  padding: 24px;
  background: var(--body-background);

  .search-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    padding: 20px;
    background: var(--component-background);
    border-radius: 8px;
    box-shadow: var(--shadow-1);

    .search-left {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .search-right {
      display: flex;
      gap: 12px;
    }
  }

  .table-section {
    background: var(--component-background);
    border-radius: 8px;
    box-shadow: var(--shadow-1);
    overflow: hidden;

    .el-table {
      border-radius: 8px 8px 0 0;
    }

    .pagination {
      padding: 20px;
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid var(--border-color-light);
    }
  }

  // 对话框样式
  :deep(.el-dialog__body) {
    padding: 0;
  }

  .dialog-content {
    padding: 20px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  // 表格样式优化
  :deep(.el-table) {
    .el-table__header-wrapper {
      th {
        background-color: var(--fill-color-lighter);
        color: var(--text-color-primary);
        font-weight: 600;
      }
    }

    .el-table__row {
      &:hover {
        background-color: var(--fill-color-light);
      }
    }
  }

  // 按钮样式优化
  .el-button {
    &.el-button--small {
      padding: 5px 11px;
      font-size: 12px;
    }
  }
}
</style>
