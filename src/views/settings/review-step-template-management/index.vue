<template>
  <div class="review-step-template-management">
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
          v-model="searchForm.stepType"
          placeholder="选择步骤类型"
          clearable
          style="width: 150px"
        >
          <el-option
            v-for="(label, value) in REVIEW_STEP_TYPE_LABELS"
            :key="value"
            :label="label"
            :value="value"
          />
        </el-select>
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
        <el-button type="primary" @click="handleAddTemplate">
          <el-icon><Plus /></el-icon>
          新增审核步骤模板
        </el-button>
      </div>
    </div>

    <div class="table-section">
      <!-- eslint-disable-next-line vue/max-attributes-per-line -->
      <el-table v-loading="loading" :data="templateList" stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="步骤名称" min-width="120" />
        <el-table-column prop="code" label="步骤编码" width="150" />
        <el-table-column prop="stepType" label="步骤类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getStepTypeTagType(row.stepType)">
              {{ REVIEW_STEP_TYPE_LABELS[row.stepType] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="150">
          <template #default="{ row }">
            <span>{{ row.description || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="stepRoles" label="绑定角色" min-width="150">
          <template #default="{ row }">
            <div v-if="row.stepRoles && row.stepRoles.length > 0" class="role-tags">
              <!-- 显示第1个角色 -->
              <el-tag
                v-for="stepRole in row.stepRoles.slice(0, 1)"
                :key="stepRole.id"
                size="small"
                style="margin-right: 4px; margin-bottom: 2px"
              >
                {{ stepRole.roleCategory.name }}
              </el-tag>
              <!-- 如果超过1个角色，显示更多标识 -->
              <el-tooltip
                v-if="row.stepRoles.length > 1"
                placement="top"
                effect="dark"
                popper-class="custom-role-tooltip"
              >
                <template #content>
                  <div style="color: #fff">
                    <div style="font-weight: 600; margin-bottom: 8px; font-size: 13px; color: #fff">
                      绑定角色列表：
                    </div>
                    <div>
                      <div
                        v-for="(stepRole, index) in row.stepRoles"
                        :key="stepRole.id"
                        style="
                          padding: 2px 0;
                          font-size: 12px;
                          color: rgba(255, 255, 255, 0.9);
                          line-height: 1.4;
                          margin-bottom: 2px;
                        "
                      >
                        <span style="color: #409eff; font-weight: bold; margin-right: 6px">•</span>
                        {{ index + 1 }}. {{ stepRole.roleCategory.name }}
                      </div>
                    </div>
                  </div>
                </template>
                <el-tag
                  size="small"
                  type="info"
                  style="margin-right: 4px; margin-bottom: 2px; cursor: pointer"
                >
                  +{{ row.stepRoles.length - 1 }}
                </el-tag>
              </el-tooltip>
            </div>
            <span v-else class="text-gray-400">未绑定</span>
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

    <!-- 新增/编辑审核步骤模板对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑审核步骤模板' : '新增审核步骤模板'"
      width="500px"
      @close="handleDialogClose"
    >
      <div class="dialog-content">
        <el-form
          ref="templateFormRef"
          :model="templateForm"
          :rules="templateFormRules"
          label-width="100px"
        >
          <el-form-item label="步骤名称" prop="name">
            <el-input v-model="templateForm.name" placeholder="请输入步骤名称" />
          </el-form-item>
          <el-form-item label="步骤编码" prop="code">
            <el-input v-model="templateForm.code" placeholder="请输入步骤编码" />
          </el-form-item>
          <el-form-item label="步骤类型" prop="stepType">
            <el-select
              v-model="templateForm.stepType"
              placeholder="请选择步骤类型"
              style="width: 100%"
            >
              <el-option
                v-for="(label, value) in REVIEW_STEP_TYPE_LABELS"
                :key="value"
                :label="label"
                :value="value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input
              v-model="templateForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入步骤描述（可选）"
            />
          </el-form-item>
          <el-form-item label="绑定角色" prop="roleCategoryIds">
            <el-select
              v-model="templateForm.roleCategoryIds"
              multiple
              placeholder="请选择绑定的角色"
              style="width: 100%"
              clearable
              collapse-tags
              collapse-tags-tooltip
            >
              <el-option
                v-for="role in roleList"
                :key="role.id"
                :label="role.name"
                :value="role.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="是否启用" prop="isActive">
            <el-switch v-model="templateForm.isActive" />
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
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import {
  getReviewStepTemplateList,
  createReviewStepTemplate,
  updateReviewStepTemplate,
  deleteReviewStepTemplate,
  type CreateReviewStepTemplateDto,
  type UpdateReviewStepTemplateDto,
  type ReviewStepTemplateEntity,
  type ReviewStepTemplatePaginationDto,
  type ReviewStepType,
  REVIEW_STEP_TYPE_LABELS,
} from '@/api/review-step-template'
import { getRoleCategoryList, type RoleCategoryEntity } from '@/api/role-category'

// 搜索表单
const searchForm = reactive({
  keyword: '',
  stepType: undefined as ReviewStepType | undefined,
  isActive: undefined as boolean | undefined,
})

// 分页信息
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0,
})

// 审核步骤模板列表
const templateList = ref<ReviewStepTemplateEntity[]>([])
const loading = ref(false)

// 角色分类列表
const roleList = ref<RoleCategoryEntity[]>([])
const roleLoading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const templateFormRef = ref<FormInstance>()

// 审核步骤模板表单
const templateForm = reactive({
  id: '',
  name: '',
  code: '',
  stepType: '' as ReviewStepType,
  description: '',
  isActive: true,
  roleCategoryIds: [] as string[],
})

// 表单验证规则
const templateFormRules: FormRules = {
  name: [
    { required: true, message: '请输入步骤名称', trigger: 'blur' },
    { min: 1, max: 50, message: '步骤名称长度在 1 到 50 个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入步骤编码', trigger: 'blur' },
    { min: 1, max: 50, message: '步骤编码长度在 1 到 50 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '步骤编码只能包含字母、数字和下划线', trigger: 'blur' },
  ],
  stepType: [{ required: true, message: '请选择步骤类型', trigger: 'change' }],
  description: [{ max: 200, message: '描述长度不能超过 200 个字符', trigger: 'blur' }],
}

// 获取步骤类型标签样式
const getStepTypeTagType = (
  stepType: ReviewStepType,
): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const typeMap: Record<ReviewStepType, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    INITIAL_REVIEW: 'primary',
    SECONDARY_REVIEW: 'success',
    FINAL_REVIEW: 'warning',
    COUNTERSIGN: 'info',
    CC: 'danger',
    CUSTOM: 'primary',
  }
  return typeMap[stepType] || 'primary'
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

// 加载审核步骤模板列表
const loadTemplateList = async () => {
  loading.value = true
  try {
    const params: ReviewStepTemplatePaginationDto = {
      pageNum: pagination.current,
      pageSize: pagination.size,
      keyword: searchForm.keyword || undefined,
      stepType: searchForm.stepType,
      isActive: searchForm.isActive,
    }

    const result = await getReviewStepTemplateList(params)

    if (result && result.data) {
      // 处理分页数据
      if (result.data.list) {
        templateList.value = result.data.list
        pagination.total = result.data.total || 0
      } else {
        // 处理非分页数据
        templateList.value = Array.isArray(result.data) ? result.data : []
        pagination.total = templateList.value.length
      }
    } else {
      templateList.value = []
      pagination.total = 0
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '加载审核步骤模板列表失败'
    ElMessage.error(errorMessage)
    templateList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadTemplateList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.stepType = undefined
  searchForm.isActive = undefined
  handleSearch()
}

// 加载角色分类列表
const loadRoleList = async () => {
  roleLoading.value = true
  try {
    const result = await getRoleCategoryList()
    if (result && result.data) {
      // 处理分页或非分页数据
      if (result.data.list) {
        roleList.value = result.data.list
      } else {
        roleList.value = Array.isArray(result.data) ? result.data : []
      }
    } else {
      roleList.value = []
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '加载角色分类列表失败'
    ElMessage.error(errorMessage)
    roleList.value = []
  } finally {
    roleLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(templateForm, {
    id: '',
    name: '',
    code: '',
    stepType: '' as ReviewStepType,
    description: '',
    isActive: true,
    roleCategoryIds: [],
  })
}

// 新增审核步骤模板
const handleAddTemplate = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑审核步骤模板
const handleEdit = (row: ReviewStepTemplateEntity) => {
  isEdit.value = true
  // 从 stepRoles 中提取 roleCategoryIds
  const roleCategoryIds = row.stepRoles?.map((stepRole) => stepRole.roleCategoryId) || []

  Object.assign(templateForm, {
    id: row.id,
    name: row.name,
    code: row.code,
    stepType: row.stepType,
    description: row.description || '',
    isActive: row.isActive,
    roleCategoryIds: roleCategoryIds,
  })
  dialogVisible.value = true
}

// 对话框关闭
const handleDialogClose = () => {
  templateFormRef.value?.resetFields()
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  if (!templateFormRef.value) {
    return
  }

  await templateFormRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }

    submitLoading.value = true
    try {
      if (isEdit.value) {
        // 编辑模式
        const updateData: UpdateReviewStepTemplateDto = {
          name: templateForm.name,
          code: templateForm.code,
          stepType: templateForm.stepType,
          description: templateForm.description || undefined,
          isActive: templateForm.isActive,
          roleCategoryIds: templateForm.roleCategoryIds,
        }
        await updateReviewStepTemplate(templateForm.id, updateData)
        ElMessage.success('更新成功')
      } else {
        // 新增模式
        const createData: CreateReviewStepTemplateDto = {
          name: templateForm.name,
          code: templateForm.code,
          stepType: templateForm.stepType,
          description: templateForm.description || undefined,
          isActive: templateForm.isActive,
          roleCategoryIds: templateForm.roleCategoryIds,
        }
        await createReviewStepTemplate(createData)
        ElMessage.success('创建成功')
      }

      dialogVisible.value = false
      loadTemplateList()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '操作失败'
      ElMessage.error(errorMessage)
    } finally {
      submitLoading.value = false
    }
  })
}

// 删除审核步骤模板
const handleDelete = async (row: ReviewStepTemplateEntity) => {
  try {
    await ElMessageBox.confirm(`确定要删除审核步骤模板 "${row.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await deleteReviewStepTemplate(row.id)
    ElMessage.success('删除成功')
    loadTemplateList()
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
  loadTemplateList()
}

// 当前页改变
const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadTemplateList()
}

onMounted(() => {
  loadTemplateList()
  loadRoleList()
})
</script>

<style scoped lang="scss">
.review-step-template-management {
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

  // 角色标签样式
  .role-tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    max-width: 160px; // 限制最大宽度

    .el-tag {
      margin: 0;
      max-width: 100px; // 单个标签最大宽度
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &:hover {
        max-width: none; // 悬停时显示完整内容
        white-space: normal;
        z-index: 10;
        position: relative;
      }
    }
  }
}

// 已改为使用内联样式，确保样式生效
</style>
