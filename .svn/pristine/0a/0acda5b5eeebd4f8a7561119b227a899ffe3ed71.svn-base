// 环境变量
const isDev = import.meta.env.MODE === 'development'

// 基础配置
export const config = {
  // 应用名称
  appName: '成本管理平台',

  // API地址
  baseUrl: isDev ? '/api' : 'https://api.example.com',

  // 上传文件地址
  uploadUrl: isDev ? '/api/upload' : 'https://api.example.com/upload',

  // 超时时间
  timeout: 10000,

  // 默认分页参数
  defaultPageSize: 10,

  // 主题相关
  theme: {
    // 主色
    primaryColor: '#409EFF',
    // 成功色
    successColor: '#67C23A',
    // 警告色
    warningColor: '#E6A23C',
    // 危险色
    dangerColor: '#F56C6C',
    // 信息色
    infoColor: '#909399',
  },

  // 本地存储前缀
  storagePrefix: 'cost_management_',

  // token在本地存储中的key
  tokenKey: 'cost_management_token',

  // 首页路径
  homePath: '/dashboard',
}

// API接口路径
export const apiUrls = {
  // 用户认证
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refreshToken: '/auth/refresh-token',
    userInfo: '/auth/user-info',
  },

  // 成本管理
  cost: {
    list: '/cost/list',
    detail: '/cost/detail',
    add: '/cost/add',
    update: '/cost/update',
    delete: '/cost/delete',
    import: '/cost/import',
    export: '/cost/export',
  },

  // 预算管理
  budget: {
    list: '/budget/list',
    detail: '/budget/detail',
    add: '/budget/add',
    update: '/budget/update',
    delete: '/budget/delete',
  },

  // 统计分析
  statistics: {
    overview: '/statistics/overview',
    costTrend: '/statistics/cost-trend',
    budgetUsage: '/statistics/budget-usage',
    categoryDistribution: '/statistics/category-distribution',
  },

  // 系统管理
  system: {
    userList: '/system/user/list',
    userAdd: '/system/user/add',
    userUpdate: '/system/user/update',
    userDelete: '/system/user/delete',
    roleList: '/system/role/list',
    menuList: '/system/menu/list',
  },
}
