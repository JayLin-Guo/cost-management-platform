import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 路由配置
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/ThreeWorkflow1/index.vue'),
    meta: {
      title: '首页概览',
      keepAlive: true,
      requireAuth: false,
    },
  },
  {
    path: '/threeworkflow',
    name: 'ThreeWorkflow',
    component: () => import('../views/ThreeWorkflow/index.vue'),
    meta: {
      title: '三维工作流',
    },
  },
  {
    path: '/threeworkflow1',
    name: 'ThreeWorkflow1',
    component: () => import('../views/ThreeWorkflow1/index.vue'),
    meta: {
      title: '三维工作流',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: {
      title: '404',
      keepAlive: true,
      requireAuth: false,
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title} | 业务管理平台`
  next()
})

export default router
