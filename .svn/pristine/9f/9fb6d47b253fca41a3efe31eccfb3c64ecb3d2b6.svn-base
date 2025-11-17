<template>
  <div class="large-screen-example">
    <div class="example-bg"></div>

    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">大屏组件示例</h1>
      <p class="page-subtitle">展示统一的大屏表单和对话框组件</p>
    </div>

    <!-- 示例内容 -->
    <div class="example-content">
      <!-- 表单示例 -->
      <div class="example-section">
        <h2 class="section-title">表单组件示例</h2>
        <LargeScreenForm :label-width="'140px'" label-position="left">
          <LargeScreenFormItem
            v-model="formData.projectName"
            type="input"
            label="项目名称"
            placeholder="请输入项目名称"
            :required="true"
          />

          <LargeScreenFormItem
            v-model="formData.projectType"
            type="select"
            label="项目类型"
            placeholder="请选择项目类型"
            :options="projectTypeOptions"
            :required="true"
          />

          <LargeScreenFormItem
            v-model="formData.budget"
            type="input"
            label="预算金额"
            placeholder="请输入预算金额"
            input-type="number"
          />

          <LargeScreenFormItem
            v-model="formData.description"
            type="textarea"
            label="项目描述"
            placeholder="请输入项目描述"
            :rows="4"
          />

          <LargeScreenFormItem
            v-model="formData.manager"
            type="select"
            label="负责人"
            placeholder="请选择负责人"
            :options="managerOptions"
          />

          <div class="form-actions">
            <LargeScreenFormItem
              type="button"
              button-type="primary"
              button-text="保存项目"
              @click="handleSave"
            />
            <LargeScreenFormItem
              type="button"
              button-type="secondary"
              button-text="重置表单"
              @click="handleReset"
            />
            <LargeScreenFormItem
              type="button"
              button-type="danger"
              button-text="删除项目"
              @click="handleDelete"
            />
          </div>
        </LargeScreenForm>
      </div>

      <!-- 对话框示例 -->
      <div class="example-section">
        <h2 class="section-title">对话框组件示例</h2>
        <div class="dialog-buttons">
          <LargeScreenFormItem
            type="button"
            button-type="primary"
            button-text="打开信息对话框"
            @click="showInfoDialog = true"
          />
          <LargeScreenFormItem
            type="button"
            button-type="secondary"
            button-text="打开表单对话框"
            @click="showFormDialog = true"
          />
          <LargeScreenFormItem
            type="button"
            button-type="danger"
            button-text="打开确认对话框"
            @click="showConfirmDialog = true"
          />
        </div>
      </div>
    </div>

    <!-- 信息对话框 -->
    <LargeScreenDialog
      v-model:visible="showInfoDialog"
      title="项目信息"
      width="600px"
      height="400px"
    >
      <div class="dialog-content">
        <h3>当前项目详情</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">项目名称：</span>
            <span class="info-value">{{ formData.projectName || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">项目类型：</span>
            <span class="info-value">{{
              getProjectTypeName(formData.projectType) || '未选择'
            }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">预算金额：</span>
            <span class="info-value">{{ formData.budget ? `¥${formData.budget}` : '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">负责人：</span>
            <span class="info-value">{{ getManagerName(formData.manager) || '未选择' }}</span>
          </div>
          <div class="info-item full-width">
            <span class="info-label">项目描述：</span>
            <span class="info-value">{{ formData.description || '无描述' }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <LargeScreenFormItem
          type="button"
          button-type="primary"
          button-text="确定"
          @click="showInfoDialog = false"
        />
      </template>
    </LargeScreenDialog>

    <!-- 表单对话框 -->
    <LargeScreenDialog
      v-model:visible="showFormDialog"
      title="编辑项目信息"
      width="800px"
      height="600px"
    >
      <LargeScreenForm :label-width="'120px'" label-position="left">
        <LargeScreenFormItem
          v-model="dialogFormData.projectId"
          type="input"
          label="项目编号"
          placeholder="自动生成"
          :readonly="true"
        />

        <LargeScreenFormItem
          v-model="dialogFormData.projectName"
          type="input"
          label="项目名称"
          placeholder="请输入项目名称"
          :required="true"
        />

        <LargeScreenFormItem
          v-model="dialogFormData.priority"
          type="select"
          label="优先级"
          placeholder="请选择优先级"
          :options="priorityOptions"
        />

        <LargeScreenFormItem
          v-model="dialogFormData.notes"
          type="textarea"
          label="备注信息"
          placeholder="请输入备注信息"
          :rows="3"
        />
      </LargeScreenForm>

      <template #footer>
        <LargeScreenFormItem
          type="button"
          button-type="primary"
          button-text="保存"
          @click="handleDialogSave"
        />
        <LargeScreenFormItem
          type="button"
          button-type="secondary"
          button-text="取消"
          @click="showFormDialog = false"
        />
      </template>
    </LargeScreenDialog>

    <!-- 确认对话框 -->
    <LargeScreenDialog
      v-model:visible="showConfirmDialog"
      title="确认删除"
      width="500px"
      height="300px"
    >
      <div class="confirm-content">
        <div class="confirm-icon">
          <svg viewBox="0 0 24 24" width="48" height="48">
            <path
              fill="#ff3366"
              d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"
            />
          </svg>
        </div>
        <h3>确认删除项目</h3>
        <p>您确定要删除当前项目吗？此操作不可撤销。</p>
      </div>

      <template #footer>
        <LargeScreenFormItem
          type="button"
          button-type="danger"
          button-text="确认删除"
          @click="handleConfirmDelete"
        />
        <LargeScreenFormItem
          type="button"
          button-type="secondary"
          button-text="取消"
          @click="showConfirmDialog = false"
        />
      </template>
    </LargeScreenDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { LargeScreenDialog, LargeScreenForm, LargeScreenFormItem } from '@/components/LargeScreen'

// 表单数据
const formData = reactive({
  projectName: '',
  projectType: '',
  budget: '',
  description: '',
  manager: '',
})

// 对话框表单数据
const dialogFormData = reactive({
  projectId: 'PRJ-' + Date.now(),
  projectName: '',
  priority: '',
  notes: '',
})

// 对话框显示状态
const showInfoDialog = ref(false)
const showFormDialog = ref(false)
const showConfirmDialog = ref(false)

// 选项数据
const projectTypeOptions = [
  { label: '住宅建筑', value: 'residential' },
  { label: '商业建筑', value: 'commercial' },
  { label: '工业建筑', value: 'industrial' },
  { label: '公共建筑', value: 'public' },
]

const managerOptions = [
  { label: '张三', value: 'zhangsan' },
  { label: '李四', value: 'lisi' },
  { label: '王五', value: 'wangwu' },
  { label: '赵六', value: 'zhaoliu' },
]

const priorityOptions = [
  { label: '高优先级', value: 'high' },
  { label: '中优先级', value: 'medium' },
  { label: '低优先级', value: 'low' },
]

// 获取项目类型名称
const getProjectTypeName = (value: string) => {
  const option = projectTypeOptions.find((opt) => opt.value === value)
  return option?.label || ''
}

// 获取负责人名称
const getManagerName = (value: string) => {
  const option = managerOptions.find((opt) => opt.value === value)
  return option?.label || ''
}

// 事件处理
const handleSave = () => {
  console.log('保存项目:', formData)
  alert('项目保存成功！')
}

const handleReset = () => {
  Object.assign(formData, {
    projectName: '',
    projectType: '',
    budget: '',
    description: '',
    manager: '',
  })
  alert('表单已重置！')
}

const handleDelete = () => {
  showConfirmDialog.value = true
}

const handleDialogSave = () => {
  console.log('保存对话框数据:', dialogFormData)
  showFormDialog.value = false
  alert('对话框数据保存成功！')
}

const handleConfirmDelete = () => {
  console.log('确认删除项目')
  showConfirmDialog.value = false
  alert('项目已删除！')
}
</script>

<style scoped>
.large-screen-example {
  position: relative;
  min-height: 100vh;
  padding: 40px;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
  overflow-x: hidden;
}

.example-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(0, 128, 255, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
  z-index: -1;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 60px;
}

.page-title {
  font-size: 36px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
  margin-bottom: 16px;
  font-family: 'Microsoft YaHei', sans-serif;
}

.page-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Microsoft YaHei', sans-serif;
}

/* 示例内容 */
.example-content {
  max-width: 1200px;
  margin: 0 auto;
}

.example-section {
  background: linear-gradient(135deg, rgba(26, 31, 58, 0.3) 0%, rgba(16, 20, 45, 0.3) 100%);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  padding: 40px;
  margin-bottom: 40px;
  backdrop-filter: blur(10px);
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  color: #00ffff;
  margin-bottom: 30px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  font-family: 'Microsoft YaHei', sans-serif;
}

/* 表单操作按钮 */
.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid rgba(0, 255, 255, 0.2);
}

/* 对话框按钮 */
.dialog-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

/* 对话框内容 */
.dialog-content h3 {
  color: #00ffff;
  font-size: 20px;
  margin-bottom: 24px;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
  font-family: 'Microsoft YaHei', sans-serif;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-item.full-width {
  grid-column: 1 / -1;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.info-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
  min-width: 80px;
  font-family: 'Microsoft YaHei', sans-serif;
}

.info-value {
  color: #ffffff;
  font-size: 14px;
  font-family: 'Microsoft YaHei', sans-serif;
}

/* 确认对话框 */
.confirm-content {
  text-align: center;
  padding: 20px;
}

.confirm-icon {
  margin-bottom: 20px;
}

.confirm-content h3 {
  color: #ff3366;
  font-size: 20px;
  margin-bottom: 16px;
  font-family: 'Microsoft YaHei', sans-serif;
}

.confirm-content p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  line-height: 1.5;
  font-family: 'Microsoft YaHei', sans-serif;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .large-screen-example {
    padding: 20px;
  }

  .page-title {
    font-size: 28px;
  }

  .page-subtitle {
    font-size: 16px;
  }

  .example-section {
    padding: 20px;
  }

  .section-title {
    font-size: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .dialog-buttons {
    flex-direction: column;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
