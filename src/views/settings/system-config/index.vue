<template>
  <div class="system-config">
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">系统配置</h2>
        <p class="page-description">管理系统基础配置和参数设置</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleSave">
          <el-icon><Check /></el-icon>
          保存配置
        </el-button>
      </div>
    </div>

    <div class="config-sections">
      <!-- 基础设置 -->
      <div class="config-section">
        <div class="section-header">
          <h3>基础设置</h3>
          <p>系统基本信息和显示配置</p>
        </div>
        <div class="section-content">
          <el-form :model="configForm" label-width="120px">
            <el-form-item label="系统名称">
              <el-input v-model="configForm.systemName" placeholder="请输入系统名称" />
            </el-form-item>
            <el-form-item label="系统描述">
              <el-input
                v-model="configForm.systemDescription"
                type="textarea"
                :rows="3"
                placeholder="请输入系统描述"
              />
            </el-form-item>
            <el-form-item label="系统版本">
              <el-input v-model="configForm.systemVersion" placeholder="请输入系统版本" />
            </el-form-item>
            <el-form-item label="公司名称">
              <el-input v-model="configForm.companyName" placeholder="请输入公司名称" />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 安全设置 -->
      <div class="config-section">
        <div class="section-header">
          <h3>安全设置</h3>
          <p>用户登录和会话安全配置</p>
        </div>
        <div class="section-content">
          <el-form :model="configForm" label-width="120px">
            <el-form-item label="会话超时">
              <el-input-number
                v-model="configForm.sessionTimeout"
                :min="5"
                :max="1440"
                controls-position="right"
              />
              <span class="form-help">分钟</span>
            </el-form-item>
            <el-form-item label="密码强度">
              <el-select v-model="configForm.passwordStrength" placeholder="请选择密码强度">
                <el-option label="低（6位以上）" value="low" />
                <el-option label="中（8位以上，包含字母数字）" value="medium" />
                <el-option label="高（8位以上，包含字母数字特殊字符）" value="high" />
              </el-select>
            </el-form-item>
            <el-form-item label="登录失败限制">
              <el-input-number
                v-model="configForm.loginFailLimit"
                :min="3"
                :max="10"
                controls-position="right"
              />
              <span class="form-help">次</span>
            </el-form-item>
            <el-form-item label="启用验证码">
              <el-switch v-model="configForm.enableCaptcha" />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 邮件设置 -->
      <div class="config-section">
        <div class="section-header">
          <h3>邮件设置</h3>
          <p>系统邮件发送配置</p>
        </div>
        <div class="section-content">
          <el-form :model="configForm" label-width="120px">
            <el-form-item label="SMTP服务器">
              <el-input v-model="configForm.smtpHost" placeholder="请输入SMTP服务器地址" />
            </el-form-item>
            <el-form-item label="SMTP端口">
              <el-input-number
                v-model="configForm.smtpPort"
                :min="1"
                :max="65535"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="发送邮箱">
              <el-input v-model="configForm.smtpUser" placeholder="请输入发送邮箱" />
            </el-form-item>
            <el-form-item label="邮箱密码">
              <el-input
                v-model="configForm.smtpPassword"
                type="password"
                placeholder="请输入邮箱密码"
                show-password
              />
            </el-form-item>
            <el-form-item label="启用SSL">
              <el-switch v-model="configForm.smtpSsl" />
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'

// 配置表单
const configForm = reactive({
  // 基础设置
  systemName: '造价管理平台',
  systemDescription: '专业的工程造价管理系统',
  systemVersion: '1.0.0',
  companyName: '某某科技有限公司',

  // 安全设置
  sessionTimeout: 30,
  passwordStrength: 'medium',
  loginFailLimit: 5,
  enableCaptcha: true,

  // 邮件设置
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPassword: '',
  smtpSsl: true,
})

// 加载配置
const loadConfig = async () => {
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 300))
    // 这里会从后端加载实际配置
  } catch (error) {
    ElMessage.error('加载配置失败')
  }
}

// 保存配置
const handleSave = async () => {
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500))
    ElMessage.success('配置保存成功')
  } catch (error) {
    ElMessage.error('配置保存失败')
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<style scoped lang="scss">
.system-config {
  padding: 24px;
  background: var(--body-background);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    padding: 24px;
    background: var(--component-background);
    border-radius: 8px;
    box-shadow: var(--shadow-1);

    .header-content {
      .page-title {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--text-color);
      }

      .page-description {
        margin: 0;
        color: var(--text-color-secondary);
        font-size: 14px;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .config-sections {
    display: flex;
    flex-direction: column;
    gap: 24px;

    .config-section {
      background: var(--component-background);
      border-radius: 8px;
      box-shadow: var(--shadow-1);
      overflow: hidden;

      .section-header {
        padding: 20px 24px;
        border-bottom: 1px solid var(--border-color-light);
        background: var(--hover-background);

        h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-color);
        }

        p {
          margin: 0;
          font-size: 14px;
          color: var(--text-color-secondary);
        }
      }

      .section-content {
        padding: 24px;

        .el-form {
          max-width: 600px;

          .form-help {
            margin-left: 8px;
            font-size: 12px;
            color: var(--text-color-secondary);
          }

          :deep(.el-form-item__label) {
            color: var(--text-color);
            font-weight: 500;
          }
        }
      }
    }
  }
}
</style>
