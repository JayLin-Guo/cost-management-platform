import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 路由配置
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Examples/LargeScreenExample.vue'),
    meta: {
      title: '首页'
    }
  },
  {
    path: '/threeworkflow1',
    name: 'ThreeWorkflow1',
    component: () => import('@/views/ThreeWorkflow1/index.vue'),
    meta: {
      title: '三维工作流1'
    }
  },
  {
    path: '/workflow-animation',
    name: 'WorkflowAnimation',
    component: () => import('@/views/WorkflowAnimation/index.vue'),
    meta: {
      title: '控制价审核工作流动画'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面未找到'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全局前置守卫
router.beforeEach((to) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 成本管理平台`
  }
})

export default router
