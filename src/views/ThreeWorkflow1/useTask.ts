import { ref } from 'vue'
import { getProjectList } from '@/api/project'

export const useTask = () => {
  const taskDialogVisible = ref(false)
  const taskDialogType = ref<'add' | 'view'>('add')
  const formData = ref({})
  const tasksList = ref<any[]>([])

  // 是否显示任务列表
  const showTaskList = ref(false)
  const handleAddTask = () => {
    taskDialogType.value = 'add'
    taskDialogVisible.value = true
  }

  const handleDialogClosed = () => {
    taskDialogVisible.value = false
  }
  const handleViewTask = () => {
    taskDialogType.value = 'view'
    taskDialogVisible.value = true
  }

  // 初始化加载项目列表
  const initLoadProjectList = async () => {
    const response = await getProjectList()
    tasksList.value = response.data
  }

  const handleDeleteTask = () => {}

  // 切换任务列表显示状态
  const toggleTaskList = () => {
    showTaskList.value = !showTaskList.value
  }

const submitForm = ()=>{
  
}

  return {
    showTaskList,
    taskDialogVisible,
    taskDialogType,
    formData,
    tasksList,
    toggleTaskList,
    initLoadProjectList,
    handleAddTask,
    handleDialogClosed,
    handleViewTask,
    handleDeleteTask,
    submitForm,
  }
}
