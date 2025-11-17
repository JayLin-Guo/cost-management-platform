<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import useInitLoad from './hooks/useInitLoad'

// 平台基本信息
const platformInfo = ref({
  name: '造价管理平台',
  version: 'V1.0',
  currentDate: new Date()
    .toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    .replace(/\//g, '-'),
})

// 定义审核人员类型接口
interface Reviewer {
  id: number
  name: string
  position: string
  status: string
  progress: number
}

// 审核人员数据
const reviewers = ref<Reviewer[]>([])

// 模拟API请求获取审核人员数据
function fetchReviewers() {
  console.log('正在获取审核人员数据...')
  // 模拟网络延迟
  return new Promise<Reviewer[]>((resolve) => {
    setTimeout(() => {
      // 模拟后端返回的数据
      const mockData: Reviewer[] = [
        { id: 1, name: '张三', position: '经理', status: '已审核', progress: 100 },
        { id: 2, name: '赵四', position: '副经理', status: '审核中', progress: 65 },
        { id: 3, name: '王五', position: '工程师', status: '待审核', progress: 0 },
        { id: 4, name: '李六', position: '设计师', status: '已驳回', progress: 30 },
        { id: 5, name: '陈七', position: '财务', status: '待确认', progress: 50 },
      ]
      console.log('审核人员数据获取成功:', mockData.length, '条记录')
      resolve(mockData)
    }, 500) // 模拟0.5秒延迟
  })
}

const { initLoad, setCalendarPosition, setCalendarVisible, setGridVisible, selectedNode } = useInitLoad()

// 节点详情面板显示控制
const showNodeDetails = ref(false)

// 监听选中节点变化
watch(selectedNode, (newNode) => {
  if (newNode) {
    showNodeDetails.value = true
  }
})

// 关闭节点详情面板
const closeNodeDetails = () => {
  showNodeDetails.value = false
}

// 获取状态对应的颜色
const getStatusColor = (status: string): string => {
  switch(status) {
    case '已审核': return '#00ff66';
    case '已提交': return '#00aaff';
    case '审核中': return '#ffcc00';
    case '待审核': return '#888888';
    case '已驳回': return '#ff3366';
    case '未上传': return '#555555';
    default: return '#aaaaaa';
  }
}

onMounted(async () => {
  // 先获取审核人员数据
  const reviewerData = await fetchReviewers()
  initLoad()
  // 控制网格显隐
  setGridVisible(true) // 显示网格

  // 调整位置
  setCalendarPosition(0, 10, 0)

  // 控制显隐
  reviewers.value = reviewerData
})
</script>

<template>
  <div class="dashboard-container">
    <!-- 顶部标题栏 -->
    <div class="header">
      <div class="left-section">
        <div class="platform-logo">{{ platformInfo.name }}</div>
        <div class="progress-bar">
          <div class="progress-scale">
            <div v-for="i in 6" :key="i" class="scale-mark">
              <div class="mark-line"></div>
              <div class="mark-text">{{ (i - 1) * 20 }}</div>
            </div>
          </div>
          <div class="progress-track">
            <div class="progress-fill"></div>
          </div>
        </div>
      </div>
      <div class="center-section">
        <div class="current-time">{{ platformInfo.currentDate }}</div>
      </div>
      <div class="right-section">
        <div class="control-btns">
          <button class="control-btn" @click="$router.push('/threeworkflow')">原版工作流</button>
          <button class="control-btn" @click="$router.push('/threeworkflow1')">简化工作流</button>
          <button class="control-btn">切换状态</button>
          <button class="control-btn">管理系统</button>
          <button class="control-btn exit">退出</button>
        </div>
      </div>
    </div>

    <!-- 3D网格底部区域（包含日历时间轴） -->
    <div id="3d-container" class="grid-container"></div>

    <!-- 节点详情面板 -->
    <div v-if="showNodeDetails && selectedNode" class="node-details-panel">
      <div class="panel-header">
        <h3>节点详情</h3>
        <button class="close-btn" @click="closeNodeDetails">×</button>
      </div>
      <div class="panel-content">
        <div class="detail-item">
          <span class="label">类型:</span>
          <span class="value">{{ selectedNode.type }}</span>
        </div>
        <div class="detail-item">
          <span class="label">时间:</span>
          <span class="value">{{ selectedNode.time }}</span>
        </div>
        <div class="detail-item">
          <span class="label">状态:</span>
          <span class="value status-badge" :style="{backgroundColor: getStatusColor(selectedNode.status)}">
            {{ selectedNode.status }}
          </span>
        </div>
        <div class="detail-item" v-if="selectedNode.remark">
          <span class="label">备注:</span>
          <span class="value">{{ selectedNode.remark }}</span>
        </div>
      </div>
      <div class="panel-footer">
        <button class="action-btn">查看详情</button>
        <button class="action-btn">操作</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 重置全局样式，确保没有默认边距 */

html,
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.dashboard-container {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
  font-family: 'Microsoft YaHei', sans-serif;
  color: #fff;
  background-color: #0f2555; /* 更亮的深蓝色背景 */
}

/* 顶部标题栏样式 */

.header {
  position: relative;
  display: flex;
  flex-shrink: 0; /* 防止压缩 */
  justify-content: space-between;
  align-items: flex-start;
  height: 120px;
  padding: 15px 20px;
  background: linear-gradient(90deg, #1a3a7a 0%, #0f2555 100%); /* 更亮的渐变色 */
  border-bottom: 1px solid #1adfff; /* 更亮的边框色 */
}

.header::before,
.header::after {
  position: absolute;
  z-index: 2;
  width: 20px;
  height: 20px;
  border: 2px solid #1adfff; /* 更亮的边框色 */
  content: '';
}

.header::before {
  top: 10px;
  left: 10px;
  border-right: none;
  border-bottom: none;
}

.header::after {
  top: 10px;
  right: 10px;
  border-bottom: none;
  border-left: none;
}

.left-section {
  display: flex;
  flex-direction: column;
  width: 30%;
}

.platform-logo {
  position: relative;
  z-index: 1;
  margin-bottom: 20px;
  font-size: 2rem;
  font-weight: bold;
  color: #1adfff; /* 更亮的蓝色 */
  text-shadow: 0 0 10px rgb(26 223 255 / 0.6); /* 增强阴影效果 */
}

.platform-logo::after {
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 140%;
  height: 1px;
  background: linear-gradient(90deg, #1adfff, transparent); /* 更亮的渐变色 */
  content: '';
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 30px;
}

.progress-scale {
  position: relative;
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 5px;
}

.scale-mark {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mark-line {
  width: 1px;
  height: 5px;
  background-color: #0ff;
}

.mark-text {
  margin-top: 2px;
  font-size: 10px;
  color: #0ff;
}

.progress-track {
  height: 6px;
  overflow: hidden;
  background-color: rgb(0 255 255 / 0.1);
  border-radius: 3px;
}

.progress-fill {
  width: 65%;
  height: 100%;
  background: linear-gradient(90deg, #f00, #ff0, #0f0);
  border-radius: 3px;
}

.center-section {
  text-align: center;
}

.current-time {
  position: relative;
  display: inline-block;
  padding: 8px 15px;
  font-size: 1.2rem;
  color: #fff;
  background-color: rgb(26 223 255 / 0.15);
  border: 1px solid #1adfff;
  border-radius: 4px;
}

.right-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 30%;
}

.control-btns {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.control-btn {
  padding: 8px 15px;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
  background-color: rgb(26 223 255 / 0.2);
  border: 1px solid #1adfff;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.control-btn:hover {
  background-color: rgb(26 223 255 / 0.4);
}

.control-btn.exit {
  background-color: rgb(255 51 102 / 0.2);
  border-color: #f36;
}

.control-btn.exit:hover {
  background-color: rgb(255 51 102 / 0.4);
}

/* 3D网格区域 */

.grid-container {
  position: relative;
  flex-grow: 1;
  width: 100%;
  overflow: hidden;
}

/* 节点详情面板 */
.node-details-panel {
  position: absolute;
  top: 150px;
  right: 20px;
  width: 300px;
  background: rgba(26, 58, 122, 0.85);
  border: 1px solid #1adfff;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(26, 223, 255, 0.3);
  backdrop-filter: blur(5px);
  z-index: 1000;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: linear-gradient(90deg, #1a3a7a, #0f2555);
  border-bottom: 1px solid #1adfff;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1adfff;
  text-shadow: 0 0 5px rgba(26, 223, 255, 0.5);
}

.close-btn {
  width: 24px;
  height: 24px;
  font-size: 18px;
  line-height: 1;
  color: #fff;
  background: none;
  border: none;
  cursor: pointer;
}

.panel-content {
  padding: 15px;
}

.detail-item {
  margin-bottom: 12px;
}

.detail-item .label {
  display: inline-block;
  width: 60px;
  font-weight: bold;
  color: #aaccff;
}

.detail-item .value {
  color: #ffffff;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  color: #fff;
  border-radius: 10px;
}

.panel-footer {
  display: flex;
  justify-content: space-between;
  padding: 12px 15px;
  background: rgba(15, 37, 85, 0.5);
  border-top: 1px solid rgba(26, 223, 255, 0.3);
}

.action-btn {
  padding: 6px 12px;
  font-size: 14px;
  color: #fff;
  background-color: rgba(26, 223, 255, 0.3);
  border: 1px solid #1adfff;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: rgba(26, 223, 255, 0.5);
}
</style>
