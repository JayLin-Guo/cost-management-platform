import { ComponentCustomProperties } from 'vue'
import { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import { Store } from 'pinia'

// 扩展 Vue 全局属性
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $router: Router
    $route: RouteLocationNormalizedLoaded
  }
}

// 扩展 ComponentPublicInstance
declare module 'vue' {
  interface ComponentCustomProperties {
    $message: (typeof import('element-plus'))['ElMessage']
    $notify: (typeof import('element-plus'))['ElNotification']
    $msgbox: (typeof import('element-plus'))['ElMessageBox']
    $alert: (typeof import('element-plus'))['ElMessageBox']['alert']
    $confirm: (typeof import('element-plus'))['ElMessageBox']['confirm']
    $prompt: (typeof import('element-plus'))['ElMessageBox']['prompt']
    $loading: (typeof import('element-plus'))['ElLoading']['service']
  }
}

// 路由元数据
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    keepAlive?: boolean
    requireAuth?: boolean
    icon?: string
    hidden?: boolean
    roles?: string[]
    permissions?: string[]
  }
}
