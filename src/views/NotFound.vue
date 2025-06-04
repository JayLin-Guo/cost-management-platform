<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="not-found">
    <h1>404</h1>
    <h2>页面不存在</h2>
    <p>您访问的页面不存在或已被删除</p>
    <el-button type="primary" @click="goHome">返回首页</el-button>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
}

h1 {
  margin: 0;
  font-size: 6rem;
  color: #409eff;
}

h2 {
  margin: 1rem 0;
  font-size: 2rem;
  color: #303133;
}

p {
  margin-bottom: 2rem;
  font-size: 1.2rem;
  color: #606266;
}
</style>
