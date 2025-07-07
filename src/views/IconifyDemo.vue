<template>
  <div class="iconify-demo">
    <div class="demo-header">
      <h1>Iconify 图标展示</h1>
      <p>项目中集成的图标库展示和测试页面</p>
    </div>

    <div class="demo-sections">
      <!-- 基本使用 -->
      <section class="demo-section">
        <h2>基本使用</h2>
        <div class="icon-grid">
          <div class="icon-item">
            <IconifyIcon icon="mdi:home" size="24" />
            <span>mdi:home</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:user" size="24" />
            <span>mdi:user</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:settings" size="24" />
            <span>mdi:settings</span>
          </div>
        </div>
      </section>

      <!-- 不同大小 -->
      <section class="demo-section">
        <h2>不同大小</h2>
        <div class="size-demo">
          <div class="icon-item">
            <IconifyIcon icon="mdi:star" size="16" />
            <span>16px</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:star" size="24" />
            <span>24px</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:star" size="32" />
            <span>32px</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:star" size="48" />
            <span>48px</span>
          </div>
        </div>
      </section>

      <!-- 不同颜色 -->
      <section class="demo-section">
        <h2>不同颜色</h2>
        <div class="color-demo">
          <div class="icon-item">
            <IconifyIcon icon="mdi:heart" size="32" color="#ff0000" />
            <span>红色</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:heart" size="32" color="#00A6FB" />
            <span>腾讯蓝</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:heart" size="32" color="#10b981" />
            <span>绿色</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:heart" size="32" color="#f59e0b" />
            <span>黄色</span>
          </div>
        </div>
      </section>

      <!-- 用户相关图标 -->
      <section class="demo-section">
        <h2>用户相关</h2>
        <div class="icon-grid">
          <div class="icon-item">
            <IconifyIcon icon="mdi:account" size="24" />
            <span>mdi:account</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:account-group" size="24" />
            <span>mdi:account-group</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:account-supervisor" size="24" />
            <span>mdi:account-supervisor</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:account-circle" size="24" />
            <span>mdi:account-circle</span>
          </div>
        </div>
      </section>

      <!-- 操作相关图标 -->
      <section class="demo-section">
        <h2>操作相关</h2>
        <div class="icon-grid">
          <div class="icon-item">
            <IconifyIcon icon="mdi:plus" size="24" />
            <span>mdi:plus</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:pencil" size="24" />
            <span>mdi:pencil</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:delete" size="24" />
            <span>mdi:delete</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:eye" size="24" />
            <span>mdi:eye</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:refresh" size="24" />
            <span>mdi:refresh</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:download" size="24" />
            <span>mdi:download</span>
          </div>
        </div>
      </section>

      <!-- 状态相关图标 -->
      <section class="demo-section">
        <h2>状态相关</h2>
        <div class="icon-grid">
          <div class="icon-item">
            <IconifyIcon icon="mdi:check-circle" size="24" color="#10b981" />
            <span>mdi:check-circle</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:alert-circle" size="24" color="#f59e0b" />
            <span>mdi:alert-circle</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:close-circle" size="24" color="#ef4444" />
            <span>mdi:close-circle</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:information" size="24" color="#3b82f6" />
            <span>mdi:information</span>
          </div>
        </div>
      </section>

      <!-- 媒体控制图标 -->
      <section class="demo-section">
        <h2>媒体控制</h2>
        <div class="icon-grid">
          <div class="icon-item">
            <IconifyIcon icon="mdi:play" size="24" />
            <span>mdi:play</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:pause" size="24" />
            <span>mdi:pause</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:stop" size="24" />
            <span>mdi:stop</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:skip-next" size="24" />
            <span>mdi:skip-next</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:skip-previous" size="24" />
            <span>mdi:skip-previous</span>
          </div>
        </div>
      </section>

      <!-- 导航相关图标 -->
      <section class="demo-section">
        <h2>导航相关</h2>
        <div class="icon-grid">
          <div class="icon-item">
            <IconifyIcon icon="mdi:chevron-up" size="24" />
            <span>mdi:chevron-up</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:chevron-down" size="24" />
            <span>mdi:chevron-down</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:chevron-left" size="24" />
            <span>mdi:chevron-left</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:chevron-right" size="24" />
            <span>mdi:chevron-right</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:arrow-down" size="24" />
            <span>mdi:arrow-down</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:arrow-up" size="24" />
            <span>mdi:arrow-up</span>
          </div>
        </div>
      </section>

      <!-- 业务相关图标 -->
      <section class="demo-section">
        <h2>业务相关</h2>
        <div class="icon-grid">
          <div class="icon-item">
            <IconifyIcon icon="mdi:workflow" size="24" />
            <span>mdi:workflow</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:clock-check" size="24" />
            <span>mdi:clock-check</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:vector-point" size="24" />
            <span>mdi:vector-point</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:timeline" size="24" />
            <span>mdi:timeline</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:chart-line" size="24" />
            <span>mdi:chart-line</span>
          </div>
          <div class="icon-item">
            <IconifyIcon icon="mdi:clipboard-check" size="24" />
            <span>mdi:clipboard-check</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconifyIcon from '@/components/IconifyIcon.vue';
</script>

<style scoped>
.iconify-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f8fafc;
  min-height: 100vh;
}

.demo-header {
  text-align: center;
  margin-bottom: 40px;
}

.demo-header h1 {
  font-size: 2.5rem;
  color: #1f2937;
  margin-bottom: 10px;
}

.demo-header p {
  font-size: 1.1rem;
  color: #6b7280;
}

.demo-sections {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.demo-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  font-size: 1.5rem;
  color: #1f2937;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid #00A6FB;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.size-demo {
  display: flex;
  gap: 30px;
  align-items: center;
  justify-content: center;
}

.color-demo {
  display: flex;
  gap: 30px;
  align-items: center;
  justify-content: center;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.icon-item:hover {
  background: #f1f5f9;
  border-color: #00A6FB;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 166, 251, 0.15);
}

.icon-item span {
  font-size: 0.875rem;
  color: #4b5563;
  font-family: 'Courier New', monospace;
  text-align: center;
}

@media (max-width: 768px) {
  .iconify-demo {
    padding: 16px;
  }
  
  .demo-header h1 {
    font-size: 2rem;
  }
  
  .icon-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 16px;
  }
  
  .size-demo,
  .color-demo {
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .demo-section {
    padding: 16px;
  }
}
</style> 