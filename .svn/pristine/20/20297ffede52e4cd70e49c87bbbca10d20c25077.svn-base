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
          <el-form-item label="任务分类" prop="taskCategory" required>
            <el-select
              v-model="formData.taskCategory"
              placeholder="请选择任务分类"
              style="width: 100%"
            >
              <el-option label="拟定控制价" value="拟定控制价" />
              <el-option label="拟案" value="拟案" />
              <el-option label="会签" value="会签" />
              <el-option label="洽商变更" value="洽商变更" />
              <el-option label="拟汉比" value="拟汉比" />
              <el-option label="其他" value="其他" />
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
          <el-form-item label="任务负责人" prop="assignee">
            <el-select
              v-model="formData.assignee"
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
      <el-form-item label="是否审核" prop="reviewType" required>
        <el-select v-model="formData.reviewType" placeholder="请选择" style="width: 100%">
          <el-option label="二审" value="二审" />
          <el-option label="一审" value="一审" />
          <el-option label="三审" value="三审" />
          <el-option label="不审核" value="不审核" />
        </el-select>
      </el-form-item>

      <!-- 审核人员（动态显示） -->
      <div v-if="formData.reviewType !== '不审核'" class="reviewer-section">
        <el-form-item label="审核人员">
          <div class="reviewer-container">
            <!-- 一审 -->
            <div v-if="needReviewer1" class="reviewer-item">
              <span class="reviewer-label">一审：</span>
              <el-select
                v-model="formData.reviewer1"
                placeholder="请选择"
                style="flex: 1"
                :loading="reviewerListLoading"
              >
                <el-option
                  v-for="user in reviewerList"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
                />
              </el-select>
              <el-link type="primary" :underline="false" style="margin-left: 8px">选择</el-link>
            </div>

            <!-- 二审 -->
            <div v-if="needReviewer2" class="reviewer-item">
              <span class="reviewer-label">二审：</span>
              <el-select
                v-model="formData.reviewer2"
                placeholder="请选择"
                style="flex: 1"
                :loading="reviewerListLoading"
              >
                <el-option
                  v-for="user in reviewerList"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
                />
              </el-select>
              <el-link type="primary" :underline="false" style="margin-left: 8px">选择</el-link>
            </div>

            <!-- 三审 -->
            <div v-if="needReviewer3" class="reviewer-item">
              <span class="reviewer-label">三审：</span>
              <el-select
                v-model="formData.reviewer3"
                placeholder="请选择"
                style="flex: 1"
                :loading="reviewerListLoading"
              >
                <el-option
                  v-for="user in reviewerList"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
                />
              </el-select>
              <el-link type="primary" :underline="false" style="margin-left: 8px">选择</el-link>
            </div>
          </div>
        </el-form-item>
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
import { getUserList, getReviewerList, type UserItem } from '@/api/user'

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

// 审核人员列表
const reviewerList = ref<UserItem[]>([])
const reviewerListLoading = ref(false)

// 文件列表
const fileList = ref<UploadUserFile[]>([])

// 表单数据
const formData = reactive({
  taskName: '',
  taskCategory: '拟定控制价',
  participants: [] as number[],
  assignee: undefined as number | undefined,
  reviewType: '不审核',
  reviewer1: undefined as number | undefined,
  reviewer2: undefined as number | undefined,
  reviewer3: undefined as number | undefined,
  description: '',
  status: 'pending' as 'pending' | 'in_progress' | 'completed',
})

// 表单验证规则
const formRules: FormRules = {
  taskName: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 2, max: 100, message: '任务名称长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  taskCategory: [{ required: true, message: '请选择任务分类', trigger: 'change' }],
  reviewType: [{ required: true, message: '请选择是否审核', trigger: 'change' }],
}

// 计算是否需要显示审核人员
const needReviewer1 = computed(() => {
  return ['一审', '二审', '三审'].includes(formData.reviewType)
})

const needReviewer2 = computed(() => {
  return ['二审', '三审'].includes(formData.reviewType)
})

const needReviewer3 = computed(() => {
  return formData.reviewType === '三审'
})

// 获取人员列表
const fetchUserList = async () => {
  userListLoading.value = true
  try {
    const users = await getUserList()
    userList.value = users.data.list
  } catch (error: any) {
    ElMessage.error(error.message || '获取人员列表失败')
  } finally {
    userListLoading.value = false
  }
}

// 获取审核人员列表
const fetchReviewerList = async () => {
  reviewerListLoading.value = true
  try {
    const reviewers = await getReviewerList()
    reviewerList.value = reviewers
  } catch (error: any) {
    ElMessage.error(error.message || '获取审核人员列表失败')
  } finally {
    reviewerListLoading.value = false
  }
}

// 文件变化
const handleFileChange = (file: any) => {
  console.log('文件变化:', file)
}

// 文件移除
const handleFileRemove = (file: any) => {
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
        Object.assign(formData, {
          taskName: props.taskData.taskName,
          taskCategory: props.taskData.taskCategory,
          participants: props.taskData.participants || [],
          assignee: props.taskData.assignee,
          reviewType: props.taskData.reviewType,
          reviewer1: props.taskData.reviewer1,
          reviewer2: props.taskData.reviewer2,
          reviewer3: props.taskData.reviewer3,
          description: props.taskData.description || '',
          status: props.taskData.status,
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

// 监听审核类型变化，清空不需要的审核人员
watch(
  () => formData.reviewType,
  (val) => {
    if (val === '不审核') {
      formData.reviewer1 = undefined
      formData.reviewer2 = undefined
      formData.reviewer3 = undefined
    } else if (val === '一审') {
      formData.reviewer2 = undefined
      formData.reviewer3 = undefined
    } else if (val === '二审') {
      formData.reviewer3 = undefined
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
    taskCategory: '拟定控制价',
    participants: [],
    assignee: undefined,
    reviewType: '不审核',
    reviewer1: undefined,
    reviewer2: undefined,
    reviewer3: undefined,
    description: '',
    status: 'pending',
  })
  fileList.value = []
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      // 这里通过 emit 把数据传给父组件处理
      emit('success')
      handleClose()
    } catch (error: any) {
      ElMessage.error(error.message || '保存失败')
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
  fetchReviewerList()
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

.reviewer-section {
  .reviewer-container {
    width: 100%;

    .reviewer-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      .reviewer-label {
        font-size: 14px;
        color: var(--text-color-secondary);
        white-space: nowrap;
        margin-right: 8px;
        min-width: 50px;
      }
    }
  }
}

.upload-demo {
  width: 100%;
}
</style>
