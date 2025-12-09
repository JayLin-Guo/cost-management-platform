import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 路由配置
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
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
    redirect: '/project',
    children: [
      {
        path: '/project',
        name: 'Projectask',
        component: () => import('../views/project/index.vue'),
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
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('../views/settings/index.vue'),
        redirect: '/settings/user-management',
        meta: {
          title: '系统设置',
          keepAlive: true,
          requireAuth: false,
        },
        children: [
          {
            path: 'user-management',
            name: 'SettingsUserManagement',
            component: () => import('../views/settings/user-management/index.vue'),
            meta: {
              title: '用户管理',
              keepAlive: true,
              requireAuth: false,
            },
          },
          {
            path: 'system-config',
            name: 'SettingsSystemConfig',
            component: () => import('../views/settings/system-config/index.vue'),
            meta: {
              title: '系统配置',
              keepAlive: true,
              requireAuth: false,
            },
          },
          {
            path: 'role-management',
            name: 'SettingsRoleManagement',
            component: () => import('../views/settings/role-management/index.vue'),
            meta: {
              title: '角色管理',
              keepAlive: true,
              requireAuth: false,
            },
          },
          {
            path: 'department-management',
            name: 'SettingsDepartmentManagement',
            component: () => import('../views/settings/department-management/index.vue'),
            meta: {
              title: '部门管理',
              keepAlive: true,
              requireAuth: false,
            },
          },
          {
            path: 'reviewer-management',
            name: 'SettingsReviewerManagement',
            component: () => import('../views/settings/reviewer-management/index.vue'),
            meta: {
              title: '审核人员配置',
              keepAlive: true,
              requireAuth: false,
            },
          },
          {
            path: 'task-category-management',
            name: 'SettingsTaskCategoryManagement',
            component: () => import('../views/settings/task-category-management/index.vue'),
            meta: {
              title: '任务分类管理',
              keepAlive: true,
              requireAuth: false,
            },
          },
        ],
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
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title} | 业务管理平台`

  // 权限检查
  if (to.meta.requireAuth !== false) {
    // 这里可以添加登录检查逻辑
    // const userStore = useUserStore()
    // if (!userStore.token) {
    //   next('/login')
    //   return
    // }
  }

  next()
})

export default router
