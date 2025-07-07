import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 路由配置
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/WorkflowAnimation/index.vue'),
    meta: {
      title: '首页',
      icon: 'mdi:home'
    }
  },
  {
    path: '/threeworkflow1',
    name: 'ThreeWorkflow1',
    component: () => import('@/views/ThreeWorkflow1/index.vue'),
    meta: {
      title: '三维工作流',
      icon: 'mdi:workflow'
    }
  },
  {
    path: '/workflow-animation',
    name: 'WorkflowAnimation',
    component: () => import('@/views/WorkflowAnimation/index.vue'),
    meta: {
      title: '工作流动画',
      icon: 'mdi:animation'
    }
  },
  {
    path: '/examples',
    name: 'Examples',
    component: () => import('@/views/Examples/LargeScreenExample.vue'),
    meta: {
      title: '示例页面',
      icon: 'mdi:view-dashboard'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面未找到',
      icon: 'mdi:alert-circle'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 成本管理平台`
  }
  
  // 页面加载进度（可选）
  // NProgress.start()
  
  next()
})

// 全局后置守卫
router.afterEach(() => {
  // 页面加载完成（可选）
  // NProgress.done()
})

export default router
