<template>
  <footer class="app-footer">
    <div class="footer-content">
      <p class="copyright">
        © 2024 成本管理平台. 版权所有 | 构建版本：v1.0.0
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>

<style scoped>
.app-footer {
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 24px;
}

.copyright {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-content {
    padding: 12px 16px;
  }
  
  .copyright {
    font-size: 12px;
  }
}
</style> 