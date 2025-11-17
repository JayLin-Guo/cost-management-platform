<template>
  <LargeScreenDialog
    v-model:visible="visible"
    title="状态详情"
    width="700px"
    height="650px"
    :close-on-click-modal="false"
    @update:visible="$emit('update:visible', $event)"
  >
    <div v-if="nodeData" class="status-dialog-content">
      <!-- 基本状态信息 -->
      <div class="status-info-section">
        <h3 class="section-title">状态信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">状态:</span>
            <span class="value status" :class="nodeData.status">
              {{ getStatusText(nodeData.status) }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">状态描述:</span>
            <span class="value">{{ nodeData.stateInfo || '无' }}</span>
          </div>
          <div class="info-item">
            <span class="label">提交时间:</span>
            <span class="value">{{ statusData.submitTime || '无' }}</span>
          </div>
          <div class="info-item">
            <span class="label">审核时间:</span>
            <span class="value">{{ statusData.reviewTime || '无' }}</span>
          </div>
        </div>
      </div>
      <!-- 审核意见 -->
      <div v-if="statusData.reviewComment" class="review-comment-section">
        <h3 class="section-title">审核意见</h3>
        <div class="comment-content">
          <div class="comment-text">{{ statusData.reviewComment }}</div>
          <div class="comment-meta">
            <span class="reviewer">审核人: {{ statusData.reviewer || '未知' }}</span>
            <span class="review-result" :class="statusData.reviewResult">
              {{
                statusData.reviewResult === 'approved'
                  ? '通过'
                  : statusData.reviewResult === 'rejected'
                    ? '驳回'
                    : '待审核'
              }}
            </span>
          </div>
        </div>
      </div>

      <!-- 附件列表 -->
      <div v-if="statusData.attachments?.length" class="attachments-section">
        <h3 class="section-title">附件文件 ({{ statusData.attachments.length }})</h3>
        <div class="attachments-list">
          <div
            v-for="(attachment, index) in statusData.attachments"
            :key="index"
            class="attachment-item"
          >
            <div class="attachment-info">
              <div class="attachment-name">
                <svg class="file-icon" viewBox="0 0 24 24">
                  <path
                    d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                  />
                </svg>
                {{ attachment.name }}
              </div>
              <div class="attachment-meta">
                <span class="file-size">{{ formatFileSize(attachment.size) }}</span>
                <span class="upload-time">{{ attachment.uploadTime }}</span>
              </div>
            </div>
            <div class="attachment-actions">
              <button
                class="action-btn view-btn"
                :disabled="!canPreview(attachment)"
                @click="handlePreviewFile(attachment)"
              >
                <svg viewBox="0 0 24 24">
                  <path
                    d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"
                  />
                </svg>
                预览
              </button>
              <button class="action-btn download-btn" @click="handleDownloadFile(attachment)">
                <svg viewBox="0 0 24 24">
                  <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                </svg>
                下载
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 连接关系信息（当点击连接线标签时显示） -->
      <div v-if="nodeData.connectionDetails" class="connection-info-section">
        <h3 class="section-title">连接关系</h3>
        <div class="connection-flow">
          <!-- 上一个节点 -->
          <div v-if="nodeData.connectionDetails.previousNode" class="connection-node">
            <div class="node-header">上一个节点</div>
            <div class="node-info">
              <!-- <div class="node-id">{{ nodeData.connectionDetails.previousNode.id }}</div> -->
              <div class="node-title">{{
                nodeData.connectionDetails.previousNode.title || '无标题'
              }}</div>
              <div class="node-status" :class="nodeData.connectionDetails.previousNode.status">
                {{ getStatusText(nodeData.connectionDetails.previousNode.status) }}
              </div>
            </div>
          </div>

          <!-- 连接箭头 -->
          <div class="connection-arrow">
            <div class="arrow-line"></div>
            <div class="arrow-head">▶</div>
            <div class="connection-status">
              {{ getStatusText(nodeData.connectionDetails.connectionStatus || '') }}
            </div>
          </div>

          <!-- 下一个节点 -->
          <div v-if="nodeData.connectionDetails.nextNode" class="connection-node">
            <div class="node-header">下一个节点</div>
            <div class="node-info">
              <!-- <div class="node-id">{{ nodeData.connectionDetails.nextNode.id }}</div> -->
              <div class="node-title">{{
                nodeData.connectionDetails.nextNode.title || '无标题'
              }}</div>
              <div class="node-status" :class="nodeData.connectionDetails.nextNode.status">
                {{ getStatusText(nodeData.connectionDetails.nextNode.status) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer-actions">
        <button class="large-screen-button primary" @click="$emit('update:visible', false)">
          <div class="button-bg"></div>
          <span class="button-text">确定</span>
          <div class="button-glow"></div>
        </button>
      </div>
    </template>
  </LargeScreenDialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { LargeScreenDialog } from '@/components/LargeScreen'
import { useStatusDetails } from '../hooks/useStatusDetails'

interface Props {
  visible: boolean
  nodeData: any
  labelData?: any
}

interface Emits {
  (e: 'update:visible', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 使用状态详情hooks
const {
  statusData,
  getStatusText,
  formatFileSize,
  canPreview,
  handlePreviewFile,
  handleDownloadFile,
  fetchStatusDetails,
} = useStatusDetails()

// 监听节点数据变化，重新获取详情
const nodeId = computed(() => props.nodeData?.id)

// 当弹窗打开且有节点数据时，获取详情
const visible = computed(() => props.visible)
watch(
  [visible, nodeId],
  ([isVisible, id]) => {
    if (isVisible && id) {
      fetchStatusDetails(id)
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.status-dialog-content {
  padding: 20px;
  color: #ffffff;
  max-height: 500px;
  overflow-y: auto;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #00ccff;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 200, 255, 0.3);
  text-shadow: 0 0 5px rgba(0, 200, 255, 0.5);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0, 50, 100, 0.2);
  border-radius: 6px;
  border: 1px solid rgba(0, 200, 255, 0.2);
}

.info-item .label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin-right: 8px;
  min-width: 80px;
}

.info-item .value {
  font-size: 13px;
  color: #ffffff;
  font-weight: 500;
}

.info-item .value.status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

/* 状态样式 */
.value.status.pending,
.node-status.pending,
.review-result.pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.value.status.approved,
.node-status.approved,
.review-result.approved {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.value.status.rejected,
.node-status.rejected,
.review-result.rejected {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.3);
}

/* 审核意见区域 */
.review-comment-section {
  margin-bottom: 20px;
}

.comment-content {
  background: rgba(0, 50, 100, 0.2);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 8px;
  padding: 16px;
}

.comment-text {
  font-size: 14px;
  line-height: 1.6;
  color: #ffffff;
  margin-bottom: 12px;
}

.comment-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 200, 255, 0.2);
}

.reviewer {
  font-size: 12px;
  color: #00ccff;
}

.review-result {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}

/* 附件区域 */
.attachments-section {
  margin-bottom: 20px;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(0, 50, 100, 0.2);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.attachment-item:hover {
  background: rgba(0, 50, 100, 0.3);
  border-color: rgba(0, 200, 255, 0.4);
}

.attachment-info {
  flex: 1;
}

.attachment-name {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 4px;
}

.file-icon {
  width: 16px;
  height: 16px;
  fill: #00ccff;
  margin-right: 8px;
}

.attachment-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.attachment-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.view-btn {
  background: rgba(0, 123, 255, 0.2);
  color: #007bff;
  border: 1px solid rgba(0, 123, 255, 0.3);
}

.view-btn:hover:not(:disabled) {
  background: rgba(0, 123, 255, 0.3);
  box-shadow: 0 0 8px rgba(0, 123, 255, 0.4);
}

.view-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.download-btn {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.download-btn:hover {
  background: rgba(40, 167, 69, 0.3);
  box-shadow: 0 0 8px rgba(40, 167, 69, 0.4);
}

/* 连接关系样式 */
.connection-info-section {
  margin-bottom: 20px;
}

.connection-flow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(26, 31, 58, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(0, 204, 255, 0.3);
}

.connection-node {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: rgba(0, 204, 255, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(0, 204, 255, 0.3);
}

.node-header {
  font-size: 12px;
  font-weight: bold;
  color: #00ccff;
  margin-bottom: 8px;
  text-align: center;
}

.node-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.node-id {
  font-size: 13px;
  color: #ffffff;
  font-weight: bold;
  text-align: center;
}

.node-title {
  font-size: 11px;
  color: #cccccc;
  text-align: center;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  text-align: center;
}

.connection-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 16px;
  min-width: 80px;
}

.arrow-line {
  width: 40px;
  height: 2px;
  background: #00ccff;
  margin-bottom: 4px;
}

.arrow-head {
  font-size: 16px;
  color: #00ccff;
  margin-bottom: 4px;
}

.connection-status {
  font-size: 10px;
  color: #ffffff;
  font-weight: 500;
  text-align: center;
  background: rgba(255, 193, 7, 0.2);
  padding: 2px 6px;
  border-radius: 8px;
  border: 1px solid rgba(255, 193, 7, 0.5);
}

/* 历史记录 */
.history-section {
  margin-bottom: 20px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  padding: 12px;
  background: rgba(0, 50, 100, 0.2);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 6px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
}

.operation {
  color: #00ccff;
  font-weight: 500;
}

.operator {
  color: rgba(255, 255, 255, 0.8);
}

.time {
  color: rgba(255, 255, 255, 0.6);
}

.history-content {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

/* 弹窗按钮样式 */
.dialog-footer-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.large-screen-button {
  position: relative;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Microsoft YaHei', sans-serif;
  transition: all 0.3s ease;
  overflow: hidden;
  min-width: 120px;
}

.button-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: all 0.3s ease;
}

.button-text {
  position: relative;
  z-index: 2;
}

.button-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.large-screen-button.primary .button-bg {
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
}

.large-screen-button.primary .button-text {
  color: #000000;
}

.large-screen-button.primary:hover .button-glow {
  opacity: 1;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
}

/* 滚动条样式 */
.status-dialog-content::-webkit-scrollbar,
.history-list::-webkit-scrollbar {
  width: 6px;
}

.status-dialog-content::-webkit-scrollbar-track,
.history-list::-webkit-scrollbar-track {
  background: rgba(0, 50, 100, 0.2);
  border-radius: 3px;
}

.status-dialog-content::-webkit-scrollbar-thumb,
.history-list::-webkit-scrollbar-thumb {
  background: rgba(0, 200, 255, 0.3);
  border-radius: 3px;
}

.status-dialog-content::-webkit-scrollbar-thumb:hover,
.history-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 200, 255, 0.5);
}
</style>
