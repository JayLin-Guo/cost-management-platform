<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- 左侧：欢迎区域 -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h1 class="system-title">造价管理平台</h1>
          <p class="system-subtitle">Cost Management Platform</p>
          <div class="welcome-illustration">
            <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color: #1890ff; stop-opacity: 1" />
                  <stop offset="100%" style="stop-color: #096dd9; stop-opacity: 1" />
                </linearGradient>
              </defs>
              <circle cx="200" cy="150" r="80" fill="url(#gradient1)" opacity="0.2" />
              <circle cx="200" cy="150" r="60" fill="url(#gradient1)" opacity="0.4" />
              <circle cx="200" cy="150" r="40" fill="url(#gradient1)" opacity="0.6" />
              <path d="M 160 150 L 200 110 L 240 150 L 200 190 Z" fill="#1890ff" opacity="0.8" />
            </svg>
          </div>
        </div>
      </div>

      <!-- 右侧：登录表单 -->
      <div class="form-section">
        <div class="form-wrapper">
          <div class="form-header">
            <h2>欢迎登录</h2>
            <p>请输入您的账号和密码</p>
          </div>

          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            @keyup.enter="handleLogin"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                size="large"
                clearable
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                show-password
                clearable
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item>
              <div class="form-options">
                <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
              </div>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                class="login-button"
                @click="handleLogin"
              >
                {{ loading ? '登录中...' : '登 录' }}
              </el-button>
            </el-form-item>
          </el-form>

          <div class="form-footer">
            <div class="tips">
              <el-icon><InfoFilled /></el-icon>
              <span>测试账号：admin / 123456</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, InfoFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 登录表单数据
const loginForm = reactive({
  username: 'admin',
  password: '123456',
  rememberMe: true,
})

// 表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      await userStore.login({
        username: loginForm.username,
        password: loginForm.password,
      })

      ElMessage.success('登录成功！')

      // 跳转到首页
      router.push('/home')
    } catch (error: any) {
      ElMessage.error(error.message || '登录失败，请检查用户名和密码')
    } finally {
      loading.value = false
    }
  })
}

// 组件挂载时的动画
onMounted(() => {
  // 可以在这里添加进入动画
  const loginCard = document.querySelector('.login-card') as HTMLElement
  if (loginCard) {
    loginCard.style.opacity = '0'
    loginCard.style.transform = 'translateY(20px)'

    setTimeout(() => {
      loginCard.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
      loginCard.style.opacity = '1'
      loginCard.style.transform = 'translateY(0)'
    }, 100)
  }
})
</script>

<style scoped lang="scss">
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--body-background);
  display: flex;
  align-items: center;
  justify-content: center;
}

// 背景装饰
.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;

  .circle {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
    animation: float 20s infinite;

    &.circle-1 {
      width: 500px;
      height: 500px;
      top: -100px;
      left: -100px;
      animation-delay: 0s;
    }

    &.circle-2 {
      width: 600px;
      height: 600px;
      bottom: -150px;
      right: -150px;
      animation-delay: 5s;
    }

    &.circle-3 {
      width: 400px;
      height: 400px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation-delay: 10s;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
    }
  }
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

// 登录卡片
.login-card {
  position: relative;
  display: flex;
  width: 1000px;
  max-width: 95%;
  height: 600px;
  background: var(--component-background);
  border-radius: 16px;
  border: 1px solid var(--border-color-light);
  box-shadow: var(--shadow-3);
  overflow: hidden;
  z-index: 1;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    min-height: 500px;
  }
}

// 欢迎区域
.welcome-section {
  flex: 1;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%);
  border-right: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  color: var(--text-color);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 40px 20px;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }

  .welcome-content {
    text-align: center;
    position: relative;
    z-index: 1;

    .system-title {
      font-size: 42px;
      font-weight: 700;
      margin: 0 0 10px 0;
      letter-spacing: 2px;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;

      @media (max-width: 768px) {
        font-size: 32px;
      }
    }

    .system-subtitle {
      font-size: 18px;
      opacity: 0.6;
      margin: 0 0 40px 0;
      font-weight: 300;
      color: var(--text-color-secondary);

      @media (max-width: 768px) {
        font-size: 16px;
        margin-bottom: 20px;
      }
    }

    .welcome-illustration {
      svg {
        width: 100%;
        max-width: 300px;
        height: auto;
      }
    }
  }
}

// 表单区域
.form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 50px;
  background: var(--component-background-light);

  @media (max-width: 768px) {
    padding: 40px 30px;
  }

  .form-wrapper {
    width: 100%;
    max-width: 400px;
  }

  .form-header {
    margin-bottom: 40px;

    h2 {
      font-size: 32px;
      font-weight: 600;
      color: var(--text-color);
      margin: 0 0 10px 0;
    }

    p {
      font-size: 14px;
      color: var(--text-color-secondary);
      margin: 0;
    }
  }

  .login-form {
    .el-form-item {
      margin-bottom: 24px;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .login-button {
      width: 100%;
      height: 48px;
      font-size: 16px;
      font-weight: 500;
      letter-spacing: 2px;
      border-radius: 8px;
    }
  }

  .form-footer {
    margin-top: 30px;

    .tips {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 8px;
      color: var(--primary-color);
      font-size: 13px;

      .el-icon {
        font-size: 16px;
      }
    }
  }
}
</style>
