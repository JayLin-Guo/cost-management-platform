<template>
  <div class="task-category-management">
    <div class="search-section">
      <div class="search-left">
        <el-input
          v-model="searchForm.code"
          placeholder="输入任务编码搜索"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-input
          v-model="searchForm.name"
          placeholder="输入任务分类名称搜索"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      <div class="search-right">
        <el-button type="primary" @click="handleAddTaskCategory">
          <el-icon><Plus /></el-icon>
          新增任务分类
        </el-button>
      </div>
    </div>

    <div class="table-section">
      <el-table :data="taskCategoryList" v-loading="loading" stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="code" label="任务编码" width="120" />
        <el-table-column prop="name" label="任务分类名称" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="200">
          <template #default="{ row }">
            <span>{{ row.description || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination" v-if="pagination.total > 0">
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

    <!-- 新增/编辑任务分类对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑任务分类' : '新增任务分类'"
      width="500px"
      @close="handleDialogClose"
    >
      <div class="dialog-content">
        <el-form
          ref="taskCategoryFormRef"
          :model="taskCategoryForm"
          :rules="taskCategoryFormRules"
          label-width="100px"
        >
          <el-form-item label="任务编码" prop="code">
            <el-input v-model="taskCategoryForm.code" placeholder="请输入任务编码" />
          </el-form-item>
          <el-form-item label="分类名称" prop="name">
            <el-input v-model="taskCategoryForm.name" placeholder="请输入任务分类名称" />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input
              v-model="taskCategoryForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入任务分类描述（可选）"
            />
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input-number
              v-model="taskCategoryForm.sort"
              :min="0"
              :max="9999"
              placeholder="请输入排序值"
              style="width: 100%"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import {
  getTaskCategoryList,
  createTaskCategory,
  updateTaskCategory,
  deleteTaskCategory,
  type CreateTaskCategoryDto,
  type UpdateTaskCategoryDto,
  type TaskCategoryEntity,
  type TaskCategoryPaginationDto,
} from '@/api/task-category'

// 搜索表单
const searchForm = reactive({
  code: '',
  name: '',
  description: '',
})

// 分页信息
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0,
})

// 任务分类列表
const taskCategoryList = ref<TaskCategoryEntity[]>([])
const loading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const taskCategoryFormRef = ref<FormInstance>()

// 任务分类表单
const taskCategoryForm = reactive({
  id: '',
  code: '',
  name: '',
  description: '',
  sort: 0,
})

// 表单验证规则
const taskCategoryFormRules: FormRules = {
  code: [
    { required: true, message: '请输入任务编码', trigger: 'blur' },
    { min: 1, max: 20, message: '任务编码长度在 1 到 20 个字符', trigger: 'blur' },
    { pattern: /^[A-Z0-9_]+$/, message: '任务编码只能包含大写字母、数字和下划线', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '请输入任务分类名称', trigger: 'blur' },
    { min: 1, max: 50, message: '任务分类名称长度在 1 到 50 个字符', trigger: 'blur' },
  ],
  description: [{ max: 200, message: '描述长度不能超过 200 个字符', trigger: 'blur' }],
  sort: [{ type: 'number', message: '排序必须是数字', trigger: 'blur' }],
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 加载任务分类列表
const loadTaskCategoryList = async () => {
  loading.value = true
  try {
    const params: TaskCategoryPaginationDto = {
      pageNum: pagination.current,
      pageSize: pagination.size,
      code: searchForm.code || undefined,
      name: searchForm.name || undefined,
      description: searchForm.description || undefined,
    }

    const result = await getTaskCategoryList(params)

    if (result && result.data) {
      // 处理分页数据
      if (result.data.list) {
        taskCategoryList.value = result.data.list
        pagination.total = result.data.total || 0
      } else {
        // 处理非分页数据
        taskCategoryList.value = Array.isArray(result.data) ? result.data : []
        pagination.total = taskCategoryList.value.length
      }
    } else {
      taskCategoryList.value = []
      pagination.total = 0
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载任务分类列表失败')
    taskCategoryList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadTaskCategoryList()
}

// 重置
const handleReset = () => {
  searchForm.code = ''
  searchForm.name = ''
  searchForm.description = ''
  handleSearch()
}

// 重置表单
const resetForm = () => {
  Object.assign(taskCategoryForm, {
    id: '',
    code: '',
    name: '',
    description: '',
    sort: 0,
  })
}

// 新增任务分类
const handleAddTaskCategory = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑任务分类
const handleEdit = (row: TaskCategoryEntity) => {
  isEdit.value = true
  Object.assign(taskCategoryForm, {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description || '',
    sort: row.sort || 0,
  })
  dialogVisible.value = true
}

// 对话框关闭
const handleDialogClose = () => {
  taskCategoryFormRef.value?.resetFields()
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  if (!taskCategoryFormRef.value) return

  await taskCategoryFormRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      if (isEdit.value) {
        // 编辑模式
        const updateData: UpdateTaskCategoryDto = {
          code: taskCategoryForm.code,
          name: taskCategoryForm.name,
          description: taskCategoryForm.description || undefined,
          sort: taskCategoryForm.sort,
        }
        await updateTaskCategory(taskCategoryForm.id, updateData)
        ElMessage.success('更新成功')
      } else {
        // 新增模式
        const createData: CreateTaskCategoryDto = {
          code: taskCategoryForm.code,
          name: taskCategoryForm.name,
          description: taskCategoryForm.description || undefined,
          sort: taskCategoryForm.sort,
        }
        await createTaskCategory(createData)
        ElMessage.success('创建成功')
      }

      dialogVisible.value = false
      loadTaskCategoryList()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 删除任务分类
const handleDelete = async (row: TaskCategoryEntity) => {
  try {
    await ElMessageBox.confirm(`确定要删除任务分类 "${row.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await deleteTaskCategory(row.id)
    ElMessage.success('删除成功')
    loadTaskCategoryList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.size = size
  loadTaskCategoryList()
}

// 当前页改变
const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadTaskCategoryList()
}

onMounted(() => {
  loadTaskCategoryList()
})
</script>

<style scoped lang="scss">
.task-category-management {
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
