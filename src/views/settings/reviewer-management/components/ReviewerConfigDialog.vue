<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑审核人员' : '添加审核人员'"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      label-position="left"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="选择用户" prop="userId">
            <el-select
              v-model="formData.userId"
              placeholder="请选择用户"
              filterable
              style="width: 100%"
              @change="handleUserChange"
            >
              <el-option
                v-for="user in userOptions"
                :key="user.id"
                :label="`${user.name} (${user.role || ''})`"
                :value="user.id"
              >
                <div class="user-option">
                  <el-avatar :size="24">
                    {{ user.name.charAt(0) }}
                  </el-avatar>
                  <div class="user-info">
                    <div class="user-name">{{ user.name }}</div>
                    <div class="user-detail"
                      >{{ user.role || '' }} - {{ user.department || '' }}</div
                    >
                  </div>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属部门" prop="departmentId">
            <el-tree-select
              v-model="formData.departmentId"
              :data="departmentOptions"
              :props="treeSelectProps"
              placeholder="请选择部门"
              clearable
              check-strictly
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="审核级别" prop="reviewerLevel">
            <el-select
              v-model="formData.reviewerLevel"
              placeholder="请选择审核级别"
              style="width: 100%"
            >
              <el-option
                v-for="level in REVIEWER_LEVEL_OPTIONS"
                :key="level.value"
                :label="level.label"
                :value="level.value"
              >
                <el-tag :type="level.color" size="small">
                  {{ level.label }}
                </el-tag>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="isActive">
            <el-radio-group v-model="formData.isActive">
              <el-radio :label="true">启用</el-radio>
              <el-radio :label="false">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="支持任务类型" prop="taskCategories">
        <el-checkbox-group v-model="formData.taskCategories">
          <el-checkbox
            v-for="category in TASK_CATEGORY_OPTIONS"
            :key="category.value"
            :label="category.value"
            :value="category.value"
          >
            {{ category.label }}
          </el-checkbox>
        </el-checkbox-group>
        <div class="form-tip"> 请选择该审核人员可以审核的任务类型 </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import { reviewerApi } from '@/api/reviewer'
import { getUserList } from '@/api/user'
import type {
  ReviewerConfig,
  CreateReviewerConfigDto,
  UpdateReviewerConfigDto,
  ReviewerLevel,
  TaskCategory,
} from '@/types/reviewer'
import type { Department } from '@/types/department'
import { REVIEWER_LEVEL_OPTIONS, TASK_CATEGORY_OPTIONS } from '@/types/reviewer'

interface Props {
  modelValue: boolean
  reviewerConfig?: ReviewerConfig | null
  departments: Department[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  reviewerConfig: null,
})

const emit = defineEmits<Emits>()

// 响应式数据
const formRef = ref<InstanceType<typeof ElForm>>()
const loading = ref(false)
const userOptions = ref<any[]>([])

const formData = ref({
  userId: '',
  departmentId: '',
  reviewerLevel: '' as ReviewerLevel,
  taskCategories: [] as TaskCategory[],
  isActive: true,
})

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEdit = computed(() => !!props.reviewerConfig)

// 树形选择器配置
const treeSelectProps = {
  children: 'children',
  label: 'name',
  value: 'id',
}

// 部门选项（扁平化）
const departmentOptions = computed(() => {
  const flattenDepartments = (departments: Department[]): Department[] => {
    const result: Department[] = []

    const flatten = (depts: Department[], level = 0) => {
      depts.forEach((dept) => {
        result.push({
          ...dept,
          name: '　'.repeat(level) + dept.name, // 添加缩进
        })
        if (dept.children && dept.children.length > 0) {
          flatten(dept.children, level + 1)
        }
      })
    }

    flatten(departments)
    return result
  }

  return flattenDepartments(props.departments)
})

// 表单验证规则
const formRules = {
  userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
  departmentId: [{ required: true, message: '请选择部门', trigger: 'change' }],
  reviewerLevel: [{ required: true, message: '请选择审核级别', trigger: 'change' }],
  taskCategories: [
    {
      required: true,
      message: '请至少选择一种任务类型',
      trigger: 'change',
    },
  ],
}

// 加载所有用户
const loadAllUsers = async () => {
  try {
    // 获取所有活跃用户
    const response = await getUserList({ isActive: true })
    userOptions.value = response.data || response || []
  } catch (error) {
    console.error('Load users error:', error)
  }
}

// 用户选择变化
const handleUserChange = (userId: string) => {
  const selectedUser = userOptions.value.find((user) => user.id === userId)
  // 注意：现有的UserItem结构中没有departmentId，需要根据department名称匹配
  if (selectedUser && selectedUser.department) {
    // 这里可以根据部门名称查找对应的部门ID
    const matchedDept = props.departments.find((dept) => dept.name === selectedUser.department)
    if (matchedDept) {
      formData.value.departmentId = matchedDept.id
    }
  }
}

// 监听对话框打开
watch(visible, (newVal) => {
  if (newVal) {
    initFormData()
  }
})

// 初始化表单数据
const initFormData = async () => {
  // 加载所有用户
  await loadAllUsers()

  if (props.reviewerConfig) {
    // 编辑模式
    formData.value = {
      userId: props.reviewerConfig.userId,
      departmentId: props.reviewerConfig.departmentId,
      reviewerLevel: props.reviewerConfig.reviewerLevel,
      taskCategories: [...props.reviewerConfig.taskCategories],
      isActive: props.reviewerConfig.isActive,
    }
  } else {
    // 新增模式
    formData.value = {
      userId: '',
      departmentId: '',
      reviewerLevel: '' as ReviewerLevel,
      taskCategories: [],
      isActive: true,
    }
  }

  // 清除验证状态
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    if (isEdit.value) {
      // 更新审核人员配置
      const updateData: UpdateReviewerConfigDto = {
        userId: formData.value.userId,
        departmentId: formData.value.departmentId,
        reviewerLevel: formData.value.reviewerLevel,
        taskCategories: formData.value.taskCategories,
        isActive: formData.value.isActive,
      }
      await reviewerApi.updateReviewerConfig(props.reviewerConfig!.id, updateData)
      ElMessage.success('审核人员配置更新成功')
    } else {
      // 创建审核人员配置
      const createData: CreateReviewerConfigDto = {
        userId: formData.value.userId,
        departmentId: formData.value.departmentId,
        reviewerLevel: formData.value.reviewerLevel,
        taskCategories: formData.value.taskCategories,
        isActive: formData.value.isActive,
      }
      await reviewerApi.createReviewerConfig(createData)
      ElMessage.success('审核人员配置创建成功')
    }

    emit('success')
    handleClose()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    loading.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
}
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.user-option {
  display: flex;
  align-items: center;
  gap: 8px;

  .user-info {
    .user-name {
      font-weight: 500;
      color: var(--text-color);
      font-size: 14px;
    }

    .user-detail {
      font-size: 12px;
      color: var(--text-color-secondary);
    }
  }
}

.form-tip {
  font-size: 12px;
  color: var(--text-color-secondary);
  margin-top: 4px;
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

:deep(.el-tree-select) {
  .el-select__wrapper {
    border-radius: 6px;
  }
}

:deep(.el-checkbox-group) {
  .el-checkbox {
    margin-right: 20px;
    margin-bottom: 8px;
  }
}
</style>
