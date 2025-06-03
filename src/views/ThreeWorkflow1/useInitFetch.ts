import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getTaskCategories,
  getParticipants,
  getResponsibles,
  getReviewLevels,
  getReviewers,
} from '@/api/task'

export interface SelectOption {
  id: string
  name: string
  [key: string]: any
}

/**
 * 初始化数据获取Hook
 * 用于集中加载任务相关的下拉选项数据
 */
export function useInitFetch() {
  // 是否已经初始化标志
  const initialized = ref(false)

  // 加载状态
  const loading = ref({
    categories: false,
    participants: false,
    responsibles: false,
    reviewLevels: false,
    reviewers: false,
  })

  // 错误状态
  const errors = ref({
    categories: '',
    participants: '',
    responsibles: '',
    reviewLevels: '',
    reviewers: '',
  })

  // 数据存储
  const taskBaseDocMap = reactive<any>({
    taskCategories: [],
    participants: [],
    responsibles: [],
    reviewLevels: [],
    reviewers: [],
  })

  // 加载任务分类
  const fetchTaskCategories = async () => {
    try {
      loading.value.categories = true
      errors.value.categories = ''

      const response = await getTaskCategories()

      taskBaseDocMap.taskCategories = response.data

      return response.data
    } catch (error) {
      console.error('获取任务分类失败:', error)
      errors.value.categories = '获取任务分类失败'
      ElMessage.error('获取任务分类失败')
      return []
    } finally {
      loading.value.categories = false
    }
  }

  // 加载参与人员
  const fetchParticipants = async () => {
    try {
      loading.value.participants = true
      errors.value.participants = ''

      const response = await getParticipants()
      taskBaseDocMap.participants = response.data

      return response.data
    } catch (error) {
      console.error('获取参与人员失败:', error)
      errors.value.participants = '获取参与人员失败'
      ElMessage.error('获取参与人员失败')
      return []
    } finally {
      loading.value.participants = false
    }
  }

  // 加载任务负责人
  const fetchResponsibles = async () => {
    try {
      loading.value.responsibles = true
      errors.value.responsibles = ''

      const response = await getResponsibles()
      taskBaseDocMap.responsibles = response.data

      return response.data
    } catch (error) {
      console.error('获取任务负责人失败:', error)
      errors.value.responsibles = '获取任务负责人失败'
      ElMessage.error('获取任务负责人失败')
      return []
    } finally {
      loading.value.responsibles = false
    }
  }

  // 加载审核级别
  const fetchReviewLevels = async () => {
    try {
      loading.value.reviewLevels = true
      errors.value.reviewLevels = ''

      const response = await getReviewLevels()
      taskBaseDocMap.reviewLevels = response.data

      return response.data
    } catch (error) {
      console.error('获取审核级别失败:', error)
      errors.value.reviewLevels = '获取审核级别失败'
      ElMessage.error('获取审核级别失败')
      return []
    } finally {
      loading.value.reviewLevels = false
    }
  }

  // 加载审核人员
  const fetchReviewers = async () => {
    try {
      loading.value.reviewers = true
      errors.value.reviewers = ''

      const response = await getReviewers()
      taskBaseDocMap.reviewers = response.data

      return response.data
    } catch (error) {
      console.error('获取审核人员失败:', error)
      errors.value.reviewers = '获取审核人员失败'
      ElMessage.error('获取审核人员失败')
      return []
    } finally {
      loading.value.reviewers = false
    }
  }

  // 初始化所有数据
  const initAllData = async () => {
    // 如果已经初始化过，不再重复请求
    if (initialized.value) {
      return {
        success: true,
        message: '数据已初始化',
      }
    }

    try {
      // 并行加载所有数据
      await Promise.all([
        fetchTaskCategories(),
        fetchParticipants(),
        fetchResponsibles(),
        fetchReviewLevels(),
        fetchReviewers(),
      ])

      // 标记为已初始化
      initialized.value = true

      return {
        success: true,
        message: '所有数据初始化完成',
      }
    } catch (error) {
      console.error('初始化数据失败:', error)
      return {
        success: false,
        message: '初始化数据失败',
      }
    }
  }

  // 暴露数据和方法
  return {
    taskBaseDocMap,
    // 状态
    loading,
    errors,
    initialized,

    // 方法
    fetchTaskCategories,
    fetchParticipants,
    fetchResponsibles,
    fetchReviewLevels,
    fetchReviewers,
    initAllData,
  }
}
