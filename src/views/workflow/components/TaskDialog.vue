<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑任务' : '新建任务'"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <el-row :gutter="20">
        <!-- 任务名称 -->
        <el-col :span="12">
          <el-form-item label="任务名称" prop="taskName" required>
            <el-input v-model="formData.taskName" placeholder="请输入任务名称" clearable />
          </el-form-item>
        </el-col>

        <!-- 任务分类 -->
        <el-col :span="12">
          <el-form-item label="任务分类" prop="taskCategoryId" required>
            <el-select
              v-model="formData.taskCategoryId"
              placeholder="请选择任务分类"
              style="width: 100%"
              :loading="taskCategoryLoading"
            >
              <el-option
                v-for="category in taskCategoryList"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <!-- 参与人员 -->
        <el-col :span="12">
          <el-form-item label="参与人员" prop="participants">
            <el-select
              v-model="formData.participants"
              multiple
              placeholder="请选择参与人员"
              style="width: 100%"
              :loading="userListLoading"
            >
              <el-option
                v-for="user in userList"
                :key="user.id"
                :label="user.name"
                :value="user.id"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 任务负责人 -->
        <el-col :span="12">
          <el-form-item label="任务负责人" prop="assigneeId">
            <el-select
              v-model="formData.assigneeId"
              placeholder="请选择负责人"
              style="width: 100%"
              :loading="userListLoading"
            >
              <el-option
                v-for="user in userList"
                :key="user.id"
                :label="user.name"
                :value="user.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 是否审核 -->
      <el-form-item label="是否审核" prop="needReview" required>
        <el-radio-group v-model="formData.needReview" :disabled="!formData.taskCategoryId">
          <el-radio :value="false">否</el-radio>
          <el-radio :value="true" :disabled="!hasReviewConfig">是</el-radio>
        </el-radio-group>
        <span v-if="formData.taskCategoryId && !hasReviewConfig" class="no-config-tip">
          （该分类未配置审核流程）
        </span>
      </el-form-item>

      <!-- 审核步骤配置 -->
      <div v-if="formData.needReview && reviewSteps.length > 0" class="review-steps-section">
        <div
          v-for="(step, index) in reviewSteps"
          :key="step.reviewStepTemplateId"
          class="review-step-row"
        >
          <el-form-item
            :label="`${step.reviewStepTemplateName}`"
            :prop="`reviewers.${step.reviewStepTemplateId}`"
            required
          >
            <div class="step-reviewer-select">
              <el-tag size="small" type="info" class="step-tag">
                第{{ index + 1 }}步 · {{ step.roleName }}
              </el-tag>
              <el-select
                v-model="formData.reviewers[step.reviewStepTemplateId]"
                placeholder="请选择审核人"
                style="flex: 1"
              >
                <el-option
                  v-for="person in step.reviewPersonnel"
                  :key="person.id"
                  :label="person.name"
                  :value="person.id"
                />
              </el-select>
            </div>
          </el-form-item>
        </div>
      </div>

      <!-- 任务说明 -->
      <el-form-item label="任务说明" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入任务说明"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <!-- 附件 -->
      <el-form-item label="附件">
        <el-upload
          class="upload-demo"
          action="#"
          :auto-upload="false"
          :file-list="fileList"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
        >
          <el-button type="primary">上传文件</el-button>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules, type UploadUserFile } from 'element-plus'
import type { TaskItem } from '@/mock/task'
import { getUserList, type UserItem } from '@/api/user'
import { getTaskCategoryList, type TaskCategoryEntity } from '@/api/task-category'
import { getReviewConfigByTaskCategory } from '@/api/review-config'

// 审核人员类型
interface ReviewPersonnel {
  id: string
  name: string
  username: string
}

// 审核步骤数据类型
interface ReviewStepData {
  reviewStepTemplateId: string
  reviewConfigId: string
  reviewStepTemplateName: string
  reviewStepTemplateCode: string
  reviewStepTemplateStepId: string
  roleType: string
  roleId: string
  roleName: string
  reviewPersonnel: ReviewPersonnel[]
}

// Props
interface Props {
  modelValue: boolean
  projectId: number
  taskData?: TaskItem | null
}

const props = withDefaults(defineProps<Props>(), {
  taskData: null,
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

// 对话框显示状态
const dialogVisible = ref(props.modelValue)

// 表单引用
const formRef = ref<FormInstance>()

// 提交加载状态
const submitLoading = ref(false)

// 是否编辑模式
const isEdit = ref(false)

// 人员列表
const userList = ref<UserItem[]>([])
const userListLoading = ref(false)

// 任务分类列表
const taskCategoryList = ref<TaskCategoryEntity[]>([])
const taskCategoryLoading = ref(false)

// 审核配置相关
const reviewSteps = ref<ReviewStepData[]>([])
const reviewConfigLoading = ref(false)

// 是否有审核配置
const hasReviewConfig = ref(false)

// 文件列表
const fileList = ref<UploadUserFile[]>([])

// 表单数据
const formData = reactive({
  taskName: '',
  taskCategoryId: '' as string,
  participants: [] as string[],
  assigneeId: undefined as string | undefined,
  needReview: false, // 是否需要审核
  reviewers: {} as Record<string, string>, // 审核人员 { stepTemplateId: userId }
  description: '',
  status: 'pending' as 'pending' | 'in_progress' | 'completed',
})

// 动态表单验证规则
const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    taskName: [
      { required: true, message: '请输入任务名称', trigger: 'blur' },
      { min: 2, max: 100, message: '任务名称长度在 2 到 100 个字符', trigger: 'blur' },
    ],
    taskCategoryId: [{ required: true, message: '请选择任务分类', trigger: 'change' }],
    needReview: [{ required: true, message: '请选择是否审核', trigger: 'change' }],
  }

  // 如果需要审核，为每个审核步骤添加验证规则
  if (formData.needReview && reviewSteps.value.length > 0) {
    reviewSteps.value.forEach((step) => {
      rules[`reviewers.${step.reviewStepTemplateId}`] = [
        {
          required: true,
          message: `请选择${step.reviewStepTemplateName}的审核人`,
          trigger: 'change',
        },
      ]
    })
  }

  return rules
})

// 获取人员列表
const fetchUserList = async () => {
  userListLoading.value = true
  try {
    const result = await getUserList()
    if (result && result.data) {
      userList.value = result.data.list || result.data || []
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '获取人员列表失败'
    ElMessage.error(errorMessage)
  } finally {
    userListLoading.value = false
  }
}

// 获取任务分类列表
const fetchTaskCategoryList = async () => {
  taskCategoryLoading.value = true
  try {
    const result = await getTaskCategoryList()
    if (result && result.data) {
      taskCategoryList.value = result.data.list || result.data || []
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '获取任务分类失败'
    ElMessage.error(errorMessage)
  } finally {
    taskCategoryLoading.value = false
  }
}

// 根据任务分类获取审核配置
const fetchReviewConfig = async (taskCategoryId: string) => {
  if (!taskCategoryId) {
    hasReviewConfig.value = false
    reviewSteps.value = []
    formData.reviewers = {}
    return
  }

  reviewConfigLoading.value = true
  try {
    const result = await getReviewConfigByTaskCategory(taskCategoryId)
    // 返回的是数组，直接判断是否有数据
    if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
      hasReviewConfig.value = true
      reviewSteps.value = result.data
      // 初始化审核人员选择（如果只有一个人，自动选中）
      formData.reviewers = {}
      result.data.forEach((step: ReviewStepData) => {
        if (step.reviewPersonnel && step.reviewPersonnel.length === 1) {
          formData.reviewers[step.reviewStepTemplateId] = step.reviewPersonnel[0].id
        }
      })
    } else {
      hasReviewConfig.value = false
      reviewSteps.value = []
      formData.reviewers = {}
    }
  } catch (error: unknown) {
    hasReviewConfig.value = false
    reviewSteps.value = []
    formData.reviewers = {}
    // 没有关联审核配置时不报错
  } finally {
    reviewConfigLoading.value = false
  }
}

// 文件变化
const handleFileChange = (file: UploadUserFile) => {
  console.log('文件变化:', file)
}

// 文件移除
const handleFileRemove = (file: UploadUserFile) => {
  console.log('文件移除:', file)
}

// 监听 props 变化
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val
    if (val) {
      if (props.taskData) {
        // 编辑模式，填充数据
        isEdit.value = true
        const taskData = props.taskData as unknown as Record<string, unknown>
        Object.assign(formData, {
          taskName: taskData.taskName || '',
          taskCategoryId: (taskData.taskCategoryId as string) || '',
          participants: (taskData.participants as string[]) || [],
          assigneeId: taskData.assigneeId as string | undefined,
          needReview: (taskData.needReview as boolean) || false,
          description: (taskData.description as string) || '',
          status: (taskData.status as string) || 'pending',
        })
      } else {
        // 新建模式，重置表单
        isEdit.value = false
      }
    }
  },
)

// 监听 dialogVisible 变化
watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 监听任务分类变化，获取关联的审核配置
watch(
  () => formData.taskCategoryId,
  async (val) => {
    // 重置审核相关数据
    formData.needReview = false
    hasReviewConfig.value = false
    reviewSteps.value = []
    formData.reviewers = {}

    if (val) {
      await fetchReviewConfig(val)
    }
  },
)

// 监听是否审核变化
watch(
  () => formData.needReview,
  (val) => {
    if (!val) {
      // 不审核时清空已选审核人
      formData.reviewers = {}
    }
  },
)

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  // 重置表单
  formRef.value?.resetFields()
  Object.assign(formData, {
    taskName: '',
    taskCategoryId: '',
    participants: [],
    assigneeId: undefined,
    needReview: false,
    reviewers: {},
    description: '',
    status: 'pending',
  })
  hasReviewConfig.value = false
  reviewSteps.value = []
  fileList.value = []
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) {
    return
  }

  await formRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }

    submitLoading.value = true
    try {
      // 这里通过 emit 把数据传给父组件处理
      emit('success')
      handleClose()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '保存失败'
      ElMessage.error(errorMessage)
    } finally {
      submitLoading.value = false
    }
  })
}

// 暴露表单数据给父组件
defineExpose({
  formData,
})

// 组件挂载时获取数据
onMounted(() => {
  fetchUserList()
  fetchTaskCategoryList()
})
</script>

<script lang="ts">
export default {
  name: 'TaskDialog',
}
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.no-config-tip {
  font-size: 12px;
  color: var(--el-color-warning);
  margin-left: 8px;
}

.review-steps-section {
  .review-step-row {
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }

    .step-reviewer-select {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;

      .step-tag {
        flex-shrink: 0;
      }
    }
  }
}

.upload-demo {
  width: 100%;
}
</style>
