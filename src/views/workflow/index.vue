<template>
  <div class="workflow-container">
    <!-- 顶部工具栏 -->
    <div class="workflow-header">
      <div class="header-left">
        <span class="label">项目名称：</span>
        <span class="project-name">{{ projectInfo?.projectName || '加载中...' }}</span>
      </div>
      <div class="header-right">
        <span class="label">任务名称：</span>
        <el-select
          v-model="selectedTaskId"
          placeholder="请选择任务"
          style="width: 400px"
          @change="handleTaskChange"
        >
          <el-option
            v-for="task in taskList"
            :key="task.id"
            :label="task.taskName"
            :value="task.id"
          />
        </el-select>
        <el-button type="primary" :icon="Plus" circle title="新增任务" @click="handleCreateTask" />
        <el-button
          type="primary"
          :icon="Edit"
          circle
          title="编辑任务"
          :disabled="!selectedTaskId"
          @click="handleEditTask"
        />
        <el-button
          type="danger"
          :icon="Delete"
          circle
          title="删除任务"
          :disabled="!selectedTaskId"
          @click="handleDeleteTask"
        />
      </div>
    </div>

    <!-- 工作流程区域 -->
    <div v-if="projectInfo" class="workflow-content">
      <el-empty v-if="!selectedTaskId" description="请选择任务查看工作流程" />

      <!-- 工作流网格 -->
      <WorkflowGrid v-else :task-id="selectedTaskId" />
    </div>

    <div v-else class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 任务对话框 -->
    <TaskDialog
      ref="taskDialogRef"
      v-model="taskDialogVisible"
      :project-id="route.query.projectId as string"
      :task-data="currentTask"
      @success="handleTaskSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { getProjectDetail } from '@/api/project'
import * as taskAPI from '@/api/task/index'
import type { TaskItem } from '@/api/task/index'
import TaskDialog from './components/TaskDialog.vue'
import WorkflowGrid from './components/WorkflowGrid.vue'

const router = useRouter()
const route = useRoute()

const projectInfo = ref()
const taskList = ref<TaskItem[]>([])
const selectedTaskId = ref<string | undefined>(undefined)
const currentTask = ref<TaskItem | null>(null)
const taskDialogVisible = ref(false)
const taskDialogRef = ref<InstanceType<typeof TaskDialog>>()

// 获取项目详情
const fetchProjectDetail = async () => {
  const projectId = route.query.projectId as string
  console.log(projectId, 'projectId')
  if (!projectId) {
    ElMessage.warning('缺少项目ID参数')
    router.push('/task')
    return
  }

  try {
    const result = await getProjectDetail(projectId)
    console.log(result, 'result')
    if (result) {
      projectInfo.value = result.data
      // 获取任务列表
      await fetchTaskList(projectId)
    } else {
      ElMessage.error('项目不存在')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取项目详情失败')
  }
}

// 获取任务列表
const fetchTaskList = async (projectId: string) => {
  console.log(projectId, 'projectId==>>')
  try {
    const tasks = await taskAPI.getProjectTaskSimpleList(projectId)
    taskList.value = tasks.data
    // 如果有任务，默认选中第一个
    if (tasks.data.length > 0) {
      selectedTaskId.value = tasks.data[0].id
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取任务列表失败')
  }
}

// 任务切换
const handleTaskChange = (taskId: string) => {
  selectedTaskId.value = taskId
  // TODO: 加载对应任务的工作流程
}

// 新增任务
const handleCreateTask = () => {
  currentTask.value = null
  taskDialogVisible.value = true
}

// 编辑任务
const handleEditTask = async () => {
  if (!selectedTaskId.value) return

  try {
    const result = await taskAPI.getTaskDetail(selectedTaskId.value)
    const taskDetail: any = result.data

    // 转换数据格式以适配 TaskDialog
    const transformedTask = {
      ...taskDetail,
      assigneeId: taskDetail.taskLeaderId, // 任务负责人
      participants: taskDetail.participants?.map((p: any) => p.userId) || [], // 参与人员ID数组
      needReview: taskDetail.isReviewRequired, // 是否需要审核
      reviewers:
        taskDetail.reviewConfig?.reviewStages?.reduce((acc: Record<string, string>, stage: any) => {
          acc[stage.stepConfigId] = stage.reviewerId
          return acc
        }, {}) || {}, // 审核人员映射
    }

    currentTask.value = transformedTask as any

    taskDialogVisible.value = true
  } catch (error: any) {
    ElMessage.error(error.message || '获取任务详情失败')
  }
}

// 删除任务
const handleDeleteTask = async () => {
  const task = taskList.value.find((t) => t.id === selectedTaskId.value)
  if (!task) return

  try {
    await ElMessageBox.confirm(`确定要删除任务"${task.taskName}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await taskAPI.deleteTask(task.id)
    ElMessage.success('删除成功')
    // 刷新任务列表
    await fetchTaskList(route.query.projectId as string)
    selectedTaskId.value = taskList.value.length > 0 ? taskList.value[0].id : undefined
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 任务对话框成功回调
const handleTaskSuccess = async () => {
  const formData = taskDialogRef.value?.formData
  if (!formData) return

  try {
    if (currentTask.value) {
      // 编辑
      await taskAPI.updateTask(currentTask.value.id, {
        id: currentTask.value.id,
        taskName: formData.taskName,
        description: formData.description,
        attachments: formData.attachments,
      })
      ElMessage.success('更新成功')
    } else {
      // 新建
      const newTask = await taskAPI.createTask({
        taskName: formData.taskName,
        projectId: route.query.projectId as string,
        taskCategoryId: formData.taskCategoryId,
        taskLeaderId: formData.assigneeId || '',
        participantIds: formData.participants,
        isReviewRequired: formData.needReview,
        reviewStageAssignments: formData.needReview
          ? Object.entries(formData.reviewers).map(([stepConfigId, reviewerId]) => ({
              stepConfigId,
              stepName: '', // 这里需要从审核步骤中获取
              reviewerId,
            }))
          : undefined,
        description: formData.description,
        attachments: formData.attachments,
      })
      ElMessage.success('创建成功')
      selectedTaskId.value = newTask.data.id
    }
    // 刷新任务列表
    await fetchTaskList(route.query.projectId as string)
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

onMounted(() => {
  fetchProjectDetail()
})
</script>

<style scoped lang="scss">
.workflow-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  background: var(--body-background);

  .workflow-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    background: var(--component-background);
    border-bottom: 1px solid var(--border-color-light);
    flex-shrink: 0;

    .header-left,
    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;

      .label {
        font-size: 14px;
        color: var(--text-color-secondary);
        white-space: nowrap;
      }

      .project-name {
        font-size: 16px;
        font-weight: 500;
        color: var(--text-color);
      }
    }

    .header-right {
      .el-button {
        &:not(:disabled) {
          &:hover {
            transform: scale(1.1);
            transition: transform 0.2s;
          }
        }
      }
    }
  }

  .workflow-content {
    flex: 1;
    overflow: auto;
    padding: 16px 24px;

    .workflow-section {
      height: 100%;
      background: var(--component-background);
      border: 1px solid var(--border-color-light);
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .workflow-canvas {
        width: 100%;
        height: 100%;
      }
    }
  }

  .loading-container {
    flex: 1;
    padding: 24px;
    background: var(--component-background);
    border: 1px solid var(--border-color-light);
    border-radius: 8px;
    margin: 16px 24px;
  }
}
</style>
