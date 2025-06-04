<template>
  <div class="task-form">
    <LargeScreenForm :label-width="'120px'" label-position="left" :disabled="mode === 'view'">
      <LargeScreenFormItem
        v-model="taskForm.name"
        type="input"
        label="任务名称"
        placeholder="请输入任务名称"
        :required="true"
      />

      <LargeScreenFormItem
        v-model="taskForm.category"
        type="select"
        label="任务分类"
        placeholder="请选择分类"
        :options="taskCategoryOptions"
        :required="true"
      />

      <LargeScreenFormItem
        v-model="taskForm.participants"
        type="select"
        label="参与人员"
        placeholder="请选择人员"
        :options="participantOptions"
        :required="true"
      />

      <LargeScreenFormItem
        v-model="taskForm.responsible"
        type="select"
        label="任务负责人"
        placeholder="请选择负责人"
        :options="responsibleOptions"
        :required="true"
      />

      <LargeScreenFormItem
        v-model="taskForm.needReview"
        type="select"
        label="是否审核"
        placeholder="请选择审核级别"
        :options="reviewLevelOptions"
        :required="true"
      />

      <LargeScreenFormItem
        v-model="taskForm.description"
        type="textarea"
        label="任务说明"
        placeholder="请输入描述内容"
        :rows="3"
      />

      <LargeScreenFormItem
        type="button"
        label="附件"
        button-type="primary"
        button-text="上传文件"
        @click="handleUpload"
      />
    </LargeScreenForm>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch, onBeforeMount, computed } from 'vue'
import { LargeScreenForm, LargeScreenFormItem } from '@/components/LargeScreen'

// 定义组件属性
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => {
      {
      }
    },
  },
  mapOptions: {
    type: Object,
    default: () => ({}),
  },
  mode: {
    type: String,
    default: 'add',
  },
})

// 定义组件事件
const emit = defineEmits(['update:modelValue'])

// 任务表单
const taskForm = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})

const mapOptions = JSON.parse(JSON.stringify(props.mapOptions))

const taskCategories = computed(() => {
  console.log(mapOptions.taskCategories, 'mapOptions.taskCategories===========>>>')
  return mapOptions.taskCategories
})

const participants = computed(() => {
  return mapOptions.participants
})

const responsibles = computed(() => {
  return mapOptions.responsibles
})

const reviewLevels = computed(() => {
  return mapOptions.reviewLevels
})

const reviewers = computed(() => {
  return mapOptions.reviewers
})

// 转换选项格式
const taskCategoryOptions = computed(() => {
  return (
    taskCategories.value?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || []
  )
})

const participantOptions = computed(() => {
  return (
    participants.value?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || []
  )
})

const responsibleOptions = computed(() => {
  return (
    responsibles.value?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || []
  )
})

const reviewLevelOptions = computed(() => {
  return (
    reviewLevels.value?.map((item) => ({
      label: item.name,
      value: item.id,
    })) || []
  )
})

// 处理文件上传
const handleUpload = () => {
  console.log('上传文件功能开发中...')
}

// 选择审核人员
// const selectReviewer = (index: number) => {
//   if (dialogType.value === 'view') return

//   // 弹出选择框逻辑
//   ElMessageBox.prompt('请输入审核人名称', '选择审核人', {
//     confirmButtonText: '确认',
//     cancelButtonText: '取消',
//     inputValue: taskForm.reviewers[index]?.name || '',
//     inputPlaceholder: '请输入审核人姓名',
//   })
//     .then(({ value }) => {
//       if (!taskForm.reviewers[index]) {
//         taskForm.reviewers[index] = { level: reviewLevels.value[index].name, name: '' }
//       }
//       taskForm.reviewers[index].name = value
//     })
//     .catch(() => {
//       // 取消操作
//     })
// }
</script>

<style scoped>
.task-form {
  width: 100%;
  min-height: 400px;
}

/* 大屏表单样式覆盖 */
:deep(.large-screen-form) {
  background: transparent;
  border: none;
}

:deep(.form-bg) {
  background: linear-gradient(
    135deg,
    rgba(0, 255, 255, 0.02) 0%,
    rgba(0, 255, 255, 0.05) 50%,
    rgba(0, 255, 255, 0.02) 100%
  );
}

:deep(.large-screen-form-item) {
  margin-bottom: 28px;
}

:deep(.label-text) {
  font-size: 15px;
  font-weight: 500;
  color: #ffffff;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
}

:deep(.required-mark) {
  color: #ff3366;
  text-shadow: 0 0 8px rgba(255, 51, 102, 0.5);
}

/* 输入框样式增强 */
:deep(.large-screen-input),
:deep(.large-screen-textarea) {
  font-size: 14px;
  color: #ffffff;
  background: transparent;
}

:deep(.large-screen-input::placeholder),
:deep(.large-screen-textarea::placeholder) {
  color: rgba(255, 255, 255, 0.4);
}

/* 选择器样式增强 */
:deep(.select-value) {
  font-size: 14px;
  color: #ffffff;
}

:deep(.select-option) {
  font-size: 14px;
  color: #ffffff;
}

:deep(.select-option:hover) {
  background: rgba(0, 255, 255, 0.1);
  color: #00ffff;
}

/* 按钮样式增强 */
:deep(.large-screen-button) {
  min-width: 140px;
  font-size: 14px;
}

:deep(.large-screen-button.primary) {
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
}

:deep(.large-screen-button.primary:hover) {
  box-shadow: 0 0 25px rgba(0, 255, 255, 0.4);
  transform: translateY(-1px);
}

/* 表单项悬停效果 */
:deep(.large-screen-form-item:hover .form-item-bg) {
  opacity: 1;
  background: linear-gradient(
    135deg,
    rgba(0, 255, 255, 0.05) 0%,
    rgba(0, 255, 255, 0.08) 50%,
    rgba(0, 255, 255, 0.05) 100%
  );
}

/* 焦点状态增强 */
:deep(.large-screen-input:focus + .input-border),
:deep(.large-screen-textarea:focus + .textarea-border) {
  border-color: #00ffff;
  box-shadow:
    0 0 20px rgba(0, 255, 255, 0.3),
    inset 0 0 20px rgba(0, 255, 255, 0.1);
}

/* 禁用状态样式 */
:deep(.is-disabled) {
  opacity: 0.6;
}

:deep(.is-disabled .large-screen-input),
:deep(.is-disabled .large-screen-textarea),
:deep(.is-disabled .large-screen-select) {
  cursor: not-allowed;
  color: rgba(255, 255, 255, 0.5);
}
</style>
