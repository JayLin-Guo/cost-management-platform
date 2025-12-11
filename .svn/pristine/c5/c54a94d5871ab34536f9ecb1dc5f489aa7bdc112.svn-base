<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEditMode ? '编辑项目' : '新建项目'"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="create-project-form"
    >
      <!-- 项目文件上传 -->
      <el-form-item label="项目文件">
        <el-upload
          class="upload-demo"
          drag
          :auto-upload="false"
          :on-change="handleProjectFileChange"
          :file-list="projectFileList"
          :limit="1"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text"> 上传文件 </div>
          <template #tip>
            <div class="el-upload__tip">
              上传项目合同或委托协议文件，系统将自动提取项目相关信息
            </div>
          </template>
        </el-upload>
      </el-form-item>

      <!-- 项目名称 和 项目类型 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="项目名称" prop="projectName" required>
            <el-input v-model="formData.projectName" placeholder="请输入项目名称" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="项目类型" prop="projectType" required>
            <el-select v-model="formData.projectType" placeholder="请选择" style="width: 100%">
              <el-option label="装饰" value="decoration" />
              <el-option label="土建" value="civil" />
              <el-option label="安装" value="installation" />
              <el-option label="市政" value="municipal" />
              <el-option label="园林" value="landscape" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 委托单位 和 项目来源 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="委托单位" prop="clientUnit" required>
            <el-input v-model="formData.clientUnit" placeholder="请输入委托单位" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="项目来源" prop="projectSource">
            <el-input v-model="formData.projectSource" placeholder="请输入项目来源" clearable />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 合同金额 -->
      <el-form-item label="合同金额" prop="contractAmount">
        <el-input
          v-model="formData.contractAmount"
          placeholder="请输入合同金额"
          type="number"
          clearable
        >
          <template #append>元</template>
        </el-input>
      </el-form-item>

      <!-- 项目描述 -->
      <el-form-item label="项目描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="请输入详细内容"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <!-- 其他附件 -->
      <el-form-item label="其他附件">
        <el-upload
          class="upload-demo"
          :auto-upload="false"
          :on-change="handleAttachmentChange"
          :file-list="attachmentFileList"
          multiple
        >
          <el-button type="primary">
            <el-icon><Upload /></el-icon>
            上传文件
          </el-button>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ isEditMode ? '更新' : '保存' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick, computed, withDefaults } from 'vue'
import { ElMessage, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import { UploadFilled, Upload } from '@element-plus/icons-vue'
import { createProject, updateProject } from '@/api/project'

// Props
interface Props {
  modelValue: boolean
  editData?: any
  isEditMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editData: null,
  isEditMode: false,
})

// Computed properties
const isEditMode = computed(() => props.isEditMode)

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

// 项目文件列表
const projectFileList = ref<UploadFile[]>([])

// 附件文件列表
const attachmentFileList = ref<UploadFile[]>([])

// 表单数据
const formData = reactive({
  projectName: '',
  projectType: '',
  clientUnit: '',
  projectSource: '',
  contractAmount: '',
  description: '',
})

// 表单验证规则
const formRules: FormRules = {
  projectName: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 200, message: '项目名称长度在 2 到 200 个字符', trigger: 'blur' },
  ],
  projectType: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
  clientUnit: [{ required: true, message: '请输入委托单位', trigger: 'blur' }],
  contractAmount: [
    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入正确的金额格式', trigger: 'blur' },
  ],
}

// 监听 props 变化
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val
    if (val && props.isEditMode && props.editData) {
      // 编辑模式下填充表单数据
      nextTick(() => {
        fillFormData(props.editData)
      })
    }
  },
)

// 监听编辑数据变化
watch(
  () => props.editData,
  (data) => {
    if (data && props.isEditMode && dialogVisible.value) {
      fillFormData(data)
    }
  },
  { deep: true },
)

// 监听 dialogVisible 变化
watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 处理项目文件变化
const handleProjectFileChange = (file: UploadFile) => {
  projectFileList.value = [file]
  // TODO: 这里可以实现文件上传后自动提取信息的逻辑
  ElMessage.info('文件已选择，保存时将上传')
}

// 处理附件文件变化
const handleAttachmentChange = (_file: UploadFile, fileList: UploadFile[]) => {
  attachmentFileList.value = fileList
}

// 填充表单数据（编辑模式）
const fillFormData = (data: any) => {
  Object.assign(formData, {
    projectName: data.projectName || '',
    projectType: data.projectType || '',
    clientUnit: data.clientUnit || '',
    projectSource: data.projectSource || '',
    contractAmount: data.contractAmount || '',
    description: data.description || '',
  })
}

// 重置表单数据
const resetFormData = () => {
  Object.assign(formData, {
    projectName: '',
    projectType: '',
    clientUnit: '',
    projectSource: '',
    contractAmount: '',
    description: '',
  })
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  // 重置表单
  formRef.value?.resetFields()
  resetFormData()
  projectFileList.value = []
  attachmentFileList.value = []
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      if (props.isEditMode && props.editData?.id) {
        // 编辑模式
        const params = {
          id: props.editData.id,
          ...formData,
        }
        await updateProject(params)
        ElMessage.success('项目更新成功')
      } else {
        // 新建模式
        await createProject(formData)
        ElMessage.success('项目创建成功')
      }
      handleClose()
      emit('success')
    } catch (error: any) {
      ElMessage.error(error.message || (props.isEditMode ? '更新项目失败' : '创建项目失败'))
    } finally {
      submitLoading.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.create-project-form {
  padding: 20px 0;

  :deep(.el-upload-dragger) {
    padding: 30px;
    width: 100%;
  }

  :deep(.el-upload__tip) {
    margin-top: 8px;
    font-size: 12px;
    color: var(--primary-color);
  }

  .el-icon--upload {
    font-size: 48px;
    color: var(--primary-color);
    margin-bottom: 16px;
  }

  .el-upload__text {
    font-size: 14px;
    color: var(--text-color);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
