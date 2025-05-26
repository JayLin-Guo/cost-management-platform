<template>
  <div class="three-workflow-container">
    <div id="three-container" ref="threeContainer"></div>
    <div id="css-container" ref="cssContainer"></div>

    <!-- 添加动画控制按钮 -->
    <div class="animation-controls">
      <el-button type="primary" @click="startAnimation" :disabled="isPlaying">
        <el-icon><VideoPlay /></el-icon>开始文件流转
      </el-button>
      <el-button type="danger" @click="stopAnimation" :disabled="!isPlaying">
        <el-icon><VideoPause /></el-icon>停止演示
      </el-button>
    </div>

    <!-- 文件信息弹窗 -->
    <el-dialog
      v-model="showFileInfo"
      title="文件详情"
      width="30%"
      destroy-on-close
    >
      <div v-if="selectedObject">
        <h3>{{ selectedObject.title }}</h3>
        <p>状态: {{ getStatusText(selectedObject.status) }}</p>
        <el-divider />
        <h4>相关文件</h4>
        <el-table :data="fileList" style="width: 100%">
          <el-table-column prop="name" label="文件名" />
          <el-table-column prop="size" label="大小" width="100" />
          <el-table-column label="操作" width="100">
            <template #default>
              <el-button link type="primary">下载</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showFileInfo = false">关闭</el-button>
          <el-button type="primary" @click="showFileInfo = false">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>



<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount, watch, reactive } from 'vue'
import useThreeWorkflow from './useThreeWorkflow'
import { ElMessage } from 'element-plus'
import { VideoPlay, VideoPause } from '@element-plus/icons-vue'

const threeContainer = ref<HTMLElement | null>(null)
const cssContainer = ref<HTMLElement | null>(null)

// THREE workflow核心功能
const { initialize, cleanup, selectedObject, startFlowAnimation, stopFlowAnimation, isAnimationPlaying } = useThreeWorkflow()

// 文件详情显示控制
const showFileInfo = ref(false)
const fileList = reactive([
  { name: 'document1.pdf', size: '1.2MB' },
  { name: 'document2.pdf', size: '0.8MB' }
])

// 动画状态
const isPlaying = ref(false)

// 启动动画
function startAnimation() {
  startFlowAnimation()
  isPlaying.value = true
  ElMessage.success('开始演示审核流程文件流转')
}

// 停止动画
function stopAnimation() {
  stopFlowAnimation()
  isPlaying.value = false
  ElMessage.info('已停止演示')
}

// 监听变化
watch(() => isAnimationPlaying, (newValue) => {
  if (typeof newValue === 'boolean') {
    isPlaying.value = newValue
  }
})

// 监听selectedObject变化，显示文件详情
watch(selectedObject, (newVal) => {
  if (newVal) {
    showFileInfo.value = true

    // 从对象数据中获取文件列表
    if (newVal.files) {
      fileList.length = 0 // 清空当前列表
      newVal.files.forEach((file: any) => {
        fileList.push(file)
      })
    }
  }
})

// 获取状态文本
function getStatusText(status: number): string {
  const statusMap: Record<number, string> = {
    0: '待审核',
    1: '审核中',
    2: '已通过',
    3: '已驳回',
    4: '已提交'
  }
  return statusMap[status] || '未知状态'
}

// 挂载时初始化 Three.js
onMounted(() => {
  if (threeContainer.value && cssContainer.value) {
    console.log('初始化Three.js组件...')
    try {
      // 传递两个容器元素
      initialize(threeContainer.value, cssContainer.value)
      console.log('Three.js初始化成功!')
    } catch (error) {
      console.error('Three.js初始化失败:', error)
    }
  } else {
    console.error('容器元素未找到，无法初始化Three.js')
  }
})

// 在组件卸载前清理资源
onBeforeUnmount(() => {
  console.log('清理Three.js资源...')
  cleanup()
})

// 额外的保障，确保一定会调用cleanup
onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.three-workflow-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

#three-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

#css-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 10;
}

/* 审核节点样式 */
:global(.review-node-label) {
  cursor: pointer;
  white-space: nowrap;
  transform: translateX(-50%);
  font-weight: 500;
}

:global(.review-node-action) {
  transform: translateX(-50%);
}

/* 弹窗动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

:global(.review-popup) {
  animation: fadeIn 0.3s ease-out;
}

/* 添加动画控制按钮样式 */
.animation-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  background: rgba(33, 50, 79, 0.8);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  gap: 10px;
}
</style>
