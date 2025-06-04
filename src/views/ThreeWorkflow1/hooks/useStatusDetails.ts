import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 状态数据接口
interface StatusData {
  submitTime?: string
  reviewTime?: string
  duration?: string
  reviewComment?: string
  reviewer?: string
  reviewResult?: 'approved' | 'rejected' | 'pending'
  attachments?: Attachment[]
  history?: HistoryRecord[]
}

// 附件接口
interface Attachment {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadTime: string
  uploader?: string
}

// 历史记录接口
interface HistoryRecord {
  id: string
  operation: string
  operator: string
  time: string
  comment?: string
}

// 模拟API调用
const mockAPI = {
  async getNodeStatusDetails(nodeId: string) {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      data: {
        submitTime: '2024-01-15 10:30:00',
        reviewTime: '2024-01-15 14:20:00',
        reviewComment: '文档内容详实，技术方案合理，符合项目要求。建议在实施阶段注意进度控制。',
        reviewResult: 'approved' as const,
        attachments: [
          {
            id: '2',
            name: '技术说明书.pdf',
            size: 1536000,
            type: 'application/pdf',
            url: '/files/technical.pdf',
            uploadTime: '2024-01-15 09:20:00',
            uploader: '王工程师',
          },
        ],
      },
    }
  },

  async previewAttachment(attachmentId: string) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return {
      data: {
        previewUrl: `https://example.com/preview/${attachmentId}`,
      },
    }
  },

  async downloadAttachment(attachmentId: string) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    // 模拟文件下载数据
    return {
      data: new Blob(['模拟文件内容'], { type: 'application/octet-stream' }),
    }
  },
}

/**
 * 状态详情管理Hook
 */
export function useStatusDetails() {
  // 状态数据
  const statusData = reactive<StatusData>({
    submitTime: '',
    reviewTime: '',
    reviewComment: '',
    reviewer: '',
    reviewResult: 'pending',
    attachments: [],
  })

  // 加载状态
  const loading = ref(false)
  const error = ref('')

  /**
   * 获取状态详情
   */
  const fetchStatusDetails = async (nodeId: string) => {
    try {
      loading.value = true
      error.value = ''

      console.log('获取节点状态详情:', nodeId)

      // 调用模拟API获取状态详情
      const response = await mockAPI.getNodeStatusDetails(nodeId)

      // 更新状态数据
      Object.assign(statusData, response.data)

      console.log('状态详情数据:', statusData)
    } catch (err: any) {
      console.error('获取状态详情失败:', err)
      error.value = err.message || '获取状态详情失败'
      ElMessage.error('获取状态详情失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取状态文本
   */
  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: '待处理',
      'in-progress': '进行中',
      completed: '已完成',
      approved: '已通过',
      rejected: '已驳回',
      cancelled: '已取消',
      waiting: '等待中',
      reviewing: '审核中',
      failed: '失败',
      success: '成功',
      submitted: '已提交',
      'under-review': '审核中',
    }
    return statusMap[status] || status
  }

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 判断文件是否可以预览
   */
  const canPreview = (attachment: Attachment): boolean => {
    const previewableTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]

    return previewableTypes.includes(attachment.type)
  }

  /**
   * 预览文件
   */
  const handlePreviewFile = async (attachment: Attachment) => {
    try {
      console.log('预览文件:', attachment.name)

      if (!canPreview(attachment)) {
        ElMessage.warning('该文件类型不支持预览')
        return
      }

      // 调用预览API
      const response = await mockAPI.previewAttachment(attachment.id)

      // 打开预览窗口
      if (response.data.previewUrl) {
        window.open(response.data.previewUrl, '_blank')
      } else {
        ElMessage.warning('无法获取预览链接')
      }
    } catch (err: any) {
      console.error('预览文件失败:', err)
      ElMessage.error('预览文件失败')
    }
  }

  /**
   * 下载文件
   */
  const handleDownloadFile = async (attachment: Attachment) => {
    try {
      console.log('下载文件:', attachment.name)

      // 调用下载API
      const response = await mockAPI.downloadAttachment(attachment.id)

      // 创建下载链接
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', attachment.name)
      document.body.appendChild(link)
      link.click()

      // 清理
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      ElMessage.success('文件下载成功')
    } catch (err: any) {
      console.error('下载文件失败:', err)
      ElMessage.error('下载文件失败')
    }
  }

  /**
   * 重置状态数据
   */
  const resetStatusData = () => {
    Object.assign(statusData, {
      submitTime: '',
      reviewTime: '',
      duration: '',
      reviewComment: '',
      reviewer: '',
      reviewResult: 'pending',
      attachments: [],
      history: [],
    })
  }

  return {
    statusData,
    loading,
    error,
    fetchStatusDetails,
    getStatusText,
    formatFileSize,
    canPreview,
    handlePreviewFile,
    handleDownloadFile,
    resetStatusData,
  }
}

// 导出类型定义
export type { StatusData, Attachment, HistoryRecord }
