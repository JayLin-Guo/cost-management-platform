// 变量声明
interface ImportMeta {
  readonly env: ImportMetaEnv
  readonly url: string
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_API_BASE_URL: string
  // 更多环境变量...
}

// Node.js 全局变量，帮助 Vite 配置
declare var __dirname: string
declare var __filename: string
declare var process: {
  env: {
    NODE_ENV: 'development' | 'production'
    [key: string]: string | undefined
  }
} 