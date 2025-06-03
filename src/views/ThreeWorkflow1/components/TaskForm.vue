<template>
  <div class="task-form">
    <el-form
      :model="taskForm"
      label-width="100px"
      :disabled="dialogType === 'view'"
      class="task-form-container"
    >
      <el-form-item label="任务名称" prop="name" required>
        <el-input v-model="taskForm.name" placeholder="请输入任务名称" />
      </el-form-item>

      <el-form-item label="任务分类" prop="category" required>
        <el-select v-model="taskForm.category" placeholder="请选择分类" style="width: 100%">
          <el-option
            v-for="item in taskCategories"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="参与人员" prop="participants" required>
        <el-select v-model="taskForm.participants" placeholder="请选择人员" style="width: 100%">
          <el-option
            v-for="item in participants"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="任务负责人" prop="responsible" required>
        <el-select v-model="taskForm.responsible" placeholder="请选择负责人" style="width: 100%">
          <el-option
            v-for="item in responsibles"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="是否审核" prop="needReview" required>
        <el-select v-model="taskForm.needReview" placeholder="请选择审核级别" style="width: 100%">
          <el-option
            v-for="item in reviewLevels"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <!-- <el-form-item label="审核人员" prop="reviewers" required>
                <div class="reviewer-list">
                    {{ reviewLevels }}
                    <div v-for="(level, index) in reviewLevels" :key="level.id" class="reviewer-item"
                        v-if="taskForm.needReview && (index < parseInt(taskForm.needReview.charAt(0)))">
                        <span class="reviewer-label">{{ level.name }}：</span>
                        <span class="reviewer-name">{{ taskForm.reviewers[index]?.name || '未选择' }}</span>
                        <span class="reviewer-action" @click="selectReviewer(index)">[选择]</span>
                    </div>
                </div>
            </el-form-item> -->

      <el-form-item label="任务说明" prop="description">
        <el-input
          v-model="taskForm.description"
          type="textarea"
          rows="3"
          placeholder="请输入描述内容"
          class="task-description"
        />
      </el-form-item>

      <el-form-item label="附件">
        <el-button type="primary" class="upload-btn">上传文件</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch, onBeforeMount, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useInitFetch } from '../useInitFetch'
import { createTask, updateTask, deleteTask as apiDeleteTask } from '@/api/task'

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

// 选择审核人员
const selectReviewer = (index: number) => {
  if (dialogType.value === 'view') return

  // 弹出选择框逻辑
  ElMessageBox.prompt('请输入审核人名称', '选择审核人', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputValue: taskForm.reviewers[index]?.name || '',
    inputPlaceholder: '请输入审核人姓名',
  })
    .then(({ value }) => {
      if (!taskForm.reviewers[index]) {
        taskForm.reviewers[index] = { level: reviewLevels.value[index].name, name: '' }
      }
      taskForm.reviewers[index].name = value
    })
    .catch(() => {
      // 取消操作
    })
}

// 提交表单
const submitForm = async () => {
  try {
    if (dialogType.value === 'add') {
      // 调用新增任务的API
      await createTask(taskForm)
      ElMessage.success('任务新增成功')
      emit('task-added')
    } else if (dialogType.value === 'delete' && props.taskDetail) {
      // 调用删除任务的API
      await apiDeleteTask(props.taskDetail.id)
      ElMessage.success('任务删除成功')
      emit('task-deleted', props.taskDetail.id)
    }

    close()
  } catch (error) {
    console.error('任务操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}
</script>

<style scoped>
.task-dialog {
  :deep(.el-dialog__header) {
    background-color: #f2f6fc;
    padding: 15px 20px;
    margin-right: 0;
    border-bottom: 1px solid #e4e7ed;
  }

  :deep(.el-dialog__title) {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  :deep(.el-dialog__body) {
    padding: 20px 30px;
  }

  :deep(.el-dialog__footer) {
    padding: 10px 20px;
    border-top: 1px solid #e4e7ed;
    display: flex;
    justify-content: center;
  }
}

.task-form-container {
  .el-form-item {
    margin-bottom: 20px;
  }

  :deep(.el-form-item__label) {
    font-weight: normal;
    color: #333;
  }

  :deep(.el-form-item__label::before) {
    color: #f56c6c;
  }

  :deep(.el-input__inner) {
    border-radius: 4px;
  }

  :deep(.el-textarea__inner) {
    border-radius: 4px;
    font-family: 'Microsoft YaHei', sans-serif;
  }
}

.reviewer-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reviewer-item {
  display: flex;
  align-items: center;
}

.reviewer-label {
  font-size: 14px;
  color: #606266;
  width: 50px;
}

.reviewer-name {
  font-size: 14px;
  color: #303133;
  margin-right: 10px;
}

.reviewer-action {
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
}

.reviewer-action:hover {
  text-decoration: underline;
}

.upload-btn {
  width: 160px;
  height: 36px;
  border-radius: 4px;
}

.dialog-footer {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.cancel-btn,
.confirm-btn {
  min-width: 100px;
}

.task-description {
  :deep(.el-textarea__inner) {
    background-color: #f9f9f9;
  }
}

.delete-confirm {
  text-align: center;
  padding: 20px 0;
  color: #ff6b6b;
  font-weight: 500;
}
</style>
