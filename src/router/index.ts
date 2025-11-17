import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 路由配置
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
<<<<<<< HEAD
    name: 'Root',
    redirect: '/home',
    meta: {
      title: '造价平台',
      keepAlive: true,
      requireAuth: false,
    },
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/home/index.vue'),
    redirect: '/task',
    children: [
      {
        path: '/task',
        name: 'Task',
        component: () => import('../views/task/index.vue'),
        meta: {
          title: '任务列表',
          keepAlive: true,
          requireAuth: false,
        },
      },
      {
        path: '/workflow',
        name: 'Workflow',
        component: () => import('../views/workflow/index.vue'),
        meta: {
          title: '流程页面',
          keepAlive: true,
          requireAuth: false,
        },
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: {
      title: '登录',
      keepAlive: true,
      requireAuth: false,
    },
=======
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
>>>>>>> b47ac77b7d0c5f82b1a6064ade020ebaaa72013b
  },

  // {
  //   path: '/threeworkflow',
  //   name: 'ThreeWorkflow',
  //   component: () => import('../views/ThreeWorkflow/index.vue'),
  //   meta: {
  //     title: '三维工作流',
  //   },
  // },
  // {
  //   path: '/threeworkflow1',
  //   name: 'ThreeWorkflow1',
  //   component: () => import('../views/ThreeWorkflow1/index.vue'),
  //   meta: {
  //     title: '三维工作流',
  //   },
  // },
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
<<<<<<< HEAD
router.beforeEach((to, _from, next) => {
=======
router.beforeEach((to) => {
>>>>>>> b47ac77b7d0c5f82b1a6064ade020ebaaa72013b
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 成本管理平台`
  }
})

export default router
