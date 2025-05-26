# HTTP请求工具使用文档

## 概述

这是一个企业级的HTTP请求工具，提供了以下核心功能：

- 自动处理token认证
- 请求/响应拦截
- 统一的错误处理
- 请求取消机制
- Loading状态控制
- 文件上传/下载
- 类型安全支持

## 系统架构

整个HTTP请求工具由以下几个核心组件组成：

### 1. 类型定义 (`types.ts`)

负责定义系统中使用的各种类型接口，保证类型安全。

### 2. 请求取消管理 (`requestCancel.ts`)

管理请求取消逻辑，避免重复请求和无效请求。

### 3. Loading管理 (`loadingManager.ts`)

控制全局Loading状态，优化用户体验。

### 4. HTTP服务核心 (`httpService.ts`)

提供核心HTTP请求功能，包括请求/响应拦截器。

### 5. 导出文件 (`index.ts` 和 `request.ts`)

简化API调用，统一导出方法。

## 入口文件 (`request.ts`)

入口文件是所有HTTP请求相关功能的统一导出入口，同时提供了一些高级特性和便捷功能：

### 环境配置

`request.ts`文件根据不同环境提供了不同的默认配置：

```typescript
// 根据环境设置不同的配置
if (import.meta.env.MODE === 'development') {
  // 开发环境配置
  httpService.getAxios().defaults.timeout = 60000 // 开发环境超时时间更长
} else if (import.meta.env.MODE === 'production') {
  // 生产环境配置
  httpService.getAxios().defaults.timeout = 30000
}
```

### 全局拦截器

您可以在入口文件中添加全局拦截器，用于处理项目特定的逻辑：

```typescript
// 全局请求拦截器
httpService.getAxios().interceptors.request.use(
  (config) => {
    // 记录API请求（仅在开发环境）
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config)
    }
    return config
  }
)

// 全局响应拦截器
httpService.getAxios().interceptors.response.use(
  (response) => {
    // 记录API响应（仅在开发环境）
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
    }
    return response
  }
)
```

### API客户端工厂

`request.ts`提供了一个便捷的API客户端工厂函数`createApiClient`，可以为特定模块创建专用的API请求器实例：

```typescript
import { createApiClient } from '@/utils/request';

// 创建用户模块的API客户端
const userApi = createApiClient('/user', {
  // 该模块的默认选项
  showLoading: true,
  showErrorMsg: true
});

// 使用专用客户端
export function login(params) {
  // 会自动应用基础路径和默认选项
  return userApi.post('/login', params);
}

export function getUserInfo() {
  return userApi.get('/info');
}
```

这种方式的优势：
1. 避免在每个API方法中重复基础路径
2. 可以为不同模块设置不同的默认选项
3. 代码更加简洁和一致

### 使用示例

#### 传统使用方式：

```typescript
import { get, post } from '@/utils/request';

// 用户API
export function login(params) {
  return post('/user/login', params, { showLoading: true });
}

export function getUserInfo() {
  return get('/user/info');
}

// 订单API
export function getOrderList(params) {
  return get('/order/list', params, { showLoading: true });
}

export function createOrder(data) {
  return post('/order/create', data, { showLoading: true });
}
```

#### 使用API客户端工厂：

```typescript
import { createApiClient } from '@/utils/request';

// 创建用户模块的API客户端
const userApi = createApiClient('/user', { showLoading: true });

// 用户API
export function login(params) {
  return userApi.post('/login', params);
}

export function getUserInfo() {
  return userApi.get('/info');
}

// 创建订单模块的API客户端
const orderApi = createApiClient('/order', { showLoading: true });

// 订单API
export function getOrderList(params) {
  return orderApi.get('/list', params);
}

export function createOrder(data) {
  return orderApi.post('/create', data);
}
```

## 入口文件的重要性

为什么我们需要一个单独的`request.ts`入口文件，而不是直接使用`http/index.ts`？

1. **解耦基础设施和应用层**：
   - `http/`目录中的文件提供了基础的HTTP请求功能，是基础设施层
   - `request.ts`是应用层的适配器，可以根据项目需求进行定制

2. **项目特定配置**：
   - 在`request.ts`中可以添加项目特定的配置和逻辑，而不影响基础设施层
   - 例如：特定的日志记录、性能监控、错误处理策略等

3. **简化导入路径**：
   - 使用`@/utils/request`比`@/utils/http/index`更简洁
   - 统一的导入路径使代码更易维护

4. **便于模块替换**：
   - 如果将来需要更改底层HTTP请求库(例如从axios切换到fetch)，只需要修改`request.ts`，而不需要修改所有使用它的地方

## 详细文档

### 类型定义 (`types.ts`)

这个文件定义了HTTP请求工具中使用的各种类型接口：

```typescript
// 接口响应标准格式
interface ApiResponse<T = any> {
  code: number      // 状态码
  data: T           // 响应数据
  message: string   // 响应消息
  success: boolean  // 是否成功
}

// 自定义请求配置选项
interface RequestOptions {
  showLoading?: boolean      // 是否显示loading
  showErrorMsg?: boolean     // 是否显示错误消息
  showSuccessMsg?: boolean   // 是否显示成功消息
  errorMsg?: string          // 自定义错误消息
  successMsg?: string        // 自定义成功消息
  withToken?: boolean        // 是否需要token
  retryCount?: number        // 重试次数
  retryDelay?: number        // 重试延迟时间
  ignoreCancelToken?: boolean // 是否忽略取消令牌
  joinParamsToUrl?: boolean  // 是否将参数拼接到URL
}
```

### 请求取消管理 (`requestCancel.ts`)

这个类负责管理请求的取消操作，避免重复请求和处理竞态条件：

```typescript
class AxiosCanceler {
  // 存储请求标识和取消控制器
  private pendingMap = new Map<string, AbortController>()

  // 添加请求到pending队列
  addPending(config: AxiosRequestConfig): void

  // 从pending队列中移除请求
  removePending(config: AxiosRequestConfig): void

  // 清除所有pending中的请求
  clearPending(): void

  // 重置状态
  reset(): void
}
```

### Loading管理 (`loadingManager.ts`)

控制全局Loading状态，支持并发请求的Loading计数：

```typescript
class LoadingManager {
  // 显示Loading
  show(options?: Record<string, any>): void

  // 隐藏Loading
  hide(): void

  // 强制关闭所有Loading
  forceClose(): void
}
```

### HTTP服务核心 (`httpService.ts`)

核心服务类，提供HTTP请求方法和拦截器：

```typescript
class HttpService {
  // 获取axios实例
  getAxios(): AxiosInstance

  // 获取配置选项
  getOptions(): CreateAxiosOptions

  // GET请求
  get<T = any>(url: string, params?: any, options?: RequestOptions): Promise<ApiResponse<T>>

  // POST请求
  post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>

  // PUT请求
  put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>

  // DELETE请求
  delete<T = any>(url: string, params?: any, options?: RequestOptions): Promise<ApiResponse<T>>

  // 上传文件
  upload<T = any>(url: string, file: File | FormData, options?: RequestOptions): Promise<ApiResponse<T>>

  // 下载文件
  download(url: string, params?: any, fileName?: string, options?: RequestOptions): Promise<void>
}
```

## 使用方法

### 基本使用

```typescript
import { get, post, put, del } from '@/utils/request';

// GET请求示例
get('/api/users').then(res => {
  console.log(res.data);
});

// POST请求示例
post('/api/users', { name: '张三', age: 25 }).then(res => {
  console.log('创建成功:', res.data);
});

// 带参数的GET请求
get('/api/users', { departmentId: 1 }).then(res => {
  console.log('部门用户:', res.data);
});

// 带自定义选项的POST请求
post('/api/login', { username: 'admin', password: '123456' }, {
  showLoading: true,
  showErrorMsg: true
}).then(res => {
  console.log('登录成功:', res.data);
});
```

### 创建API模块

推荐的做法是为每个业务模块创建专门的API文件：

```typescript
// src/api/user.ts
import { get, post } from '@/utils/request';

// 用户登录
export function login(params: { username: string; password: string }) {
  return post('/user/login', params, {
    showLoading: true,
    showErrorMsg: true
  });
}

// 获取用户信息
export function getUserInfo() {
  return get('/user/info');
}

// 修改密码
export function changePassword(params: { oldPassword: string; newPassword: string }) {
  return post('/user/change-password', params, {
    showSuccessMsg: true,
    successMsg: '密码修改成功！'
  });
}
```

然后在组件中使用：

```typescript
import { login, getUserInfo } from '@/api/user';

// 登录
const handleLogin = async () => {
  try {
    const res = await login({
      username: 'admin',
      password: '123456'
    });
    
    if (res.success) {
      // 登录成功处理
    }
  } catch (error) {
    // 错误已经被拦截器处理
  }
};

// 获取用户信息
const fetchUserInfo = async () => {
  const res = await getUserInfo();
  userInfo.value = res.data;
};
```

### 文件上传

```typescript
import { upload } from '@/utils/request';

// 单文件上传
const handleUpload = (file: File) => {
  upload('/api/upload', file, {
    showLoading: true,
    showSuccessMsg: true,
    successMsg: '上传成功！'
  }).then(res => {
    console.log('文件URL:', res.data.url);
  });
};

// 使用FormData上传多个文件
const handleMultipleUpload = (files: FileList) => {
  const formData = new FormData();
  
  Array.from(files).forEach((file, index) => {
    formData.append(`file${index}`, file);
  });
  
  upload('/api/upload/multiple', formData).then(res => {
    console.log('上传结果:', res.data);
  });
};
```

### 文件下载

```typescript
import { download } from '@/utils/request';

// 下载文件
const handleDownload = () => {
  download(
    '/api/download',
    { fileId: 123 },
    '文件名.pdf'  // 可选，如果不提供则使用服务器返回的文件名
  );
};
```

### 自定义请求配置

```typescript
import { get } from '@/utils/request';

// 指定不显示错误消息
get('/api/users', null, { showErrorMsg: false });

// 指定成功消息
post('/api/users', data, {
  showSuccessMsg: true,
  successMsg: '保存成功！'
});

// 不显示Loading
get('/api/status', null, { showLoading: false });

// 不需要Token验证
get('/api/public-data', null, { withToken: false });
```

## 请求拦截器

请求拦截器的主要功能：

1. 自动添加token到请求头
2. 处理请求Loading状态
3. 防止重复请求
4. 添加时间戳和客户端信息

```typescript
// 在请求发出前执行
axiosInstance.interceptors.request.use(
  (config) => {
    // 处理token
    // 管理Loading状态
    // 防止重复请求
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

## 响应拦截器

响应拦截器的主要功能：

1. 统一处理响应格式
2. 显示成功/错误消息
3. 处理特定错误码（如401, 403）
4. 关闭Loading状态

```typescript
// 在收到响应后执行
axiosInstance.interceptors.response.use(
  (response) => {
    // 业务成功处理
    // 显示成功消息
    return response.data;
  },
  (error) => {
    // 错误处理
    // 登录失效处理
    // 错误消息显示
    return Promise.reject(error);
  }
);
```

## 高级功能

### 请求取消

系统会自动处理重复请求的取消，但您也可以手动取消请求：

```typescript
import { clearPendingRequests } from '@/utils/request';

// 取消所有pending的请求
clearPendingRequests();
```

### 配置全局默认选项

可以在创建HTTP服务实例时配置全局默认选项：

```typescript
// 默认配置
const defaultConfig = {
  baseURL: '/api',
  timeout: 30000,
  requestOptions: {
    showLoading: false,
    showErrorMsg: true,
    withToken: true
  }
};
```

## 完整示例

### 用户登录/登出流程

```typescript
// api/user.js
import { post, get } from '@/utils/request';

// 登录
export function login(data) {
  return post('/user/login', data, {
    showLoading: true,
    showErrorMsg: true
  });
}

// 登出
export function logout() {
  return post('/user/logout', null, {
    showLoading: true
  });
}

// LoginPage.vue
import { login } from '@/api/user';

const handleLogin = async () => {
  try {
    const res = await login({
      username: username.value,
      password: password.value
    });
    
    if (res.success) {
      userStore.setToken(res.data.token);
      userStore.setUserInfo(res.data.userInfo);
      router.push('/');
    }
  } catch (error) {
    // 错误已经在拦截器中处理
    console.error('登录失败', error);
  }
};
```

### 文件上传与进度监控

```typescript
import { httpService } from '@/utils/request';

const uploadWithProgress = (file: File, onProgress?: (percent: number) => void) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return httpService.request({
    method: 'POST',
    url: '/upload',
    data: formData,
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress && onProgress(percent);
      }
    },
    requestOptions: {
      showLoading: false,
      showSuccessMsg: true,
      successMsg: '上传成功'
    }
  });
};
```

## 请求重复判定机制

### 请求重复判定原理

在我们的HTTP请求工具中，判定重复请求的核心逻辑位于`requestCancel.ts`中。系统使用以下因素来判断一个请求是否为重复请求：

1. **相同的URL路径**
2. **相同的请求方法** (GET, POST, PUT, DELETE等)
3. **相同的请求参数** (query参数)
4. **相同的请求体数据** (body数据)

这四个因素共同组成了一个请求的唯一标识。

### 实现细节

请求的唯一标识是通过以下方式生成的：

```typescript
private generateRequestKey(config: AxiosRequestConfig): string {
  const { url, method, params, data } = config
  return [url, method, JSON.stringify(params), JSON.stringify(data)].join('&')
}
```

这个方法将请求的URL、方法、参数和数据组合成一个字符串，用`&`符号连接，作为请求的唯一标识。

例如，如果有两个请求：
- `GET /api/users?id=1`
- `GET /api/users?id=1`

它们会被识别为相同的请求，因为它们有相同的URL、方法和参数。

### 请求取消机制

当系统检测到重复请求时，会自动取消前一个尚未完成的请求，以避免资源浪费和数据不一致。具体流程如下：

1. 每个请求发出前，系统生成该请求的唯一标识
2. 检查该标识是否已存在于`pendingMap`中
3. 如果存在，则取消前一个请求
4. 将新请求添加到`pendingMap`中
5. 请求完成后，从`pendingMap`中移除

```typescript
addPending(config: AxiosRequestConfig): void {
  // 如果配置了忽略取消则跳过
  if (this.checkIgnoreCancelToken(config)) {
    return
  }
  
  // 生成请求标识
  const requestKey = this.generateRequestKey(config)
  
  // 如果存在相同标识的请求，先取消前一个
  if (this.pendingMap.has(requestKey)) {
    const controller = this.pendingMap.get(requestKey)
    controller && controller.abort()
    this.pendingMap.delete(requestKey)
  }
  
  // 创建新的AbortController，添加到Map中
  const controller = new AbortController()
  config.signal = controller.signal
  this.pendingMap.set(requestKey, controller)
}
```

### 忽略请求取消检查

有些情况下，我们可能不希望取消重复请求。例如：
- 轮询操作
- 并发的独立操作

这时可以通过配置`ignoreCancelToken`选项来忽略请求取消检查：

```typescript
// 跳过重复请求检查
get('/api/status', null, { ignoreCancelToken: true })
```

系统会根据此配置决定是否执行重复请求检查：

```typescript
private checkIgnoreCancelToken(config: AxiosRequestConfig): boolean {
  // 转换为扩展的请求配置类型
  const extendConfig = config as ExtendAxiosRequestConfig
  const ignoreCancelToken = extendConfig?.requestOptions?.ignoreCancelToken
  
  return !!(
    ignoreCancelToken || 
    (config.headers && config.headers['ignoreCancelToken'])
  )
}
```

### 场景示例

#### 场景1：表单重复提交防止

当用户多次点击提交按钮时，只有第一次点击会发送请求，后续的点击会自动取消前一个请求：

```typescript
// 提交表单
submitForm() {
  // 不需要额外防重复提交逻辑，系统会自动处理
  post('/api/form', this.formData)
}
```

#### 场景2：快速切换页面导致的重复加载

当用户在表格中快速切换页码时，前一页的数据加载请求会被自动取消：

```typescript
// 加载表格数据
loadTableData(page) {
  get('/api/table', { page })
}
```

#### 场景3：需要并发请求的情况

某些情况下，我们需要同时发送多个相似请求，此时可以配置忽略取消检查：

```typescript
// 批量获取多个用户信息
async fetchMultipleUsers(userIds) {
  const promises = userIds.map(id => 
    get(`/api/users/${id}`, null, { ignoreCancelToken: true })
  )
  const results = await Promise.all(promises)
  return results
}
```

## 最佳实践

1. **集中管理API**: 将所有API调用集中在`src/api`目录下，按模块组织
2. **使用类型**: 为请求参数和响应数据定义TypeScript接口
3. **处理错误**: 业务层面的错误处理应该在catch中进行
4. **控制Loading**: 批量请求时应考虑是否显示loading
5. **防止重复提交**: 表单提交等操作要避免重复点击
6. **默认开启重复请求检查**：大多数情况下应该保持开启，以防止资源浪费
7. **合理使用忽略选项**：对于确实需要并发的相同请求，使用`ignoreCancelToken`
8. **使用API客户端工厂**：对于相同模块的API，使用`createApiClient`创建专用客户端
9. **环境差异配置**：在`request.ts`中根据不同环境配置不同的参数

## 注意事项

1. 默认情况下，所有请求都会带上token，如果某个请求不需要token，可以设置`withToken: false`
2. 文件下载需要特殊处理，应使用专门的`download`方法
3. 全局loading默认关闭，需要时可通过`showLoading: true`开启
4. 错误消息默认显示，可通过`showErrorMsg: false`关闭
5. 成功消息默认不显示，需要时可通过`showSuccessMsg: true`和`successMsg`配置
6. 相同的URL、方法、参数和数据会被视为重复请求，系统会自动取消前一个尚未完成的请求
7. 请在`request.ts`中添加环境特定的配置，而不是修改`http/`目录中的文件

希望这份文档能帮助您更好地使用我们的HTTP请求工具！如有任何问题，请随时反馈。

## 多域名服务请求

在企业级应用中，通常需要调用多个不同域名的服务。我们的HTTP请求工具已经设计了一套完整的方案来处理这种场景。

### 开发环境配置

在开发环境中，我们使用Vite的代理功能来处理跨域请求：

```typescript
// vite.config.ts
server: {
  proxy: {
    // 主服务API
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    },
    // 用户服务
    '/user-api': {
      target: 'http://user-service.example.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/user-api/, '/api')
    },
    // 订单服务
    '/order-api': {
      target: 'http://order-service.example.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/order-api/, '/api')
    }
    // ...其他服务代理
  }
}
```

### 服务路径配置

在`request.ts`中，我们定义了对应的服务路径常量：

```typescript
export const ServicePath = {
  // 主服务
  MAIN: '/api',
  // 用户服务 
  USER: '/user-api',
  // 订单服务
  ORDER: '/order-api',
  // 支付服务
  PAYMENT: '/payment-api',
  // 文件服务
  FILE: '/file-api',
  // 第三方服务
  THIRD_PARTY: '/third-party-api'
}
```

### 预定义API客户端

为了更方便地调用不同服务，我们预定义了一系列API客户端：

```typescript
export const apiClient = {
  // 主服务
  main: createApiClient(ServicePath.MAIN),
  
  // 用户服务
  user: createApiClient(ServicePath.USER),
  
  // 订单服务
  order: createApiClient(ServicePath.ORDER),
  
  // 文件服务
  file: createApiClient(ServicePath.FILE, { 
    showLoading: true // 文件服务默认显示加载状态
  }),
  
  // 第三方服务
  thirdParty: createApiClient(ServicePath.THIRD_PARTY, {
    withToken: false // 第三方服务可能使用不同的认证方式
  })
}
```

### 使用示例

```typescript
import { apiClient } from '@/utils/request';

// 调用主服务
const fetchMainData = async () => {
  const res = await apiClient.main.get('/data');
  return res.data;
};

// 调用用户服务
const fetchUserProfile = async () => {
  const res = await apiClient.user.get('/profile');
  return res.data;
};

// 调用订单服务
const createNewOrder = async (orderData) => {
  const res = await apiClient.order.post('/orders', orderData);
  return res.data;
};

// 上传文件到文件服务
const uploadDocument = async (file) => {
  const res = await apiClient.file.upload('/documents', file);
  return res.data;
};

// 调用第三方服务
const fetchExternalData = async () => {
  const res = await apiClient.thirdParty.get('/data');
  return res.data;
};
```

### 生产环境配置

在生产环境中，通常有两种方式处理多域名服务：

1. **通过Nginx代理**：使用Nginx将不同路径代理到不同的后端服务
   ```nginx
   location /api/ {
     proxy_pass http://main-service.example.com/;
   }
   
   location /user-api/ {
     proxy_pass http://user-service.example.com/api/;
   }
   
   location /order-api/ {
     proxy_pass http://order-service.example.com/api/;
   }
   ```

2. **通过API网关**：使用API网关(如Kong、Zuul等)统一管理各个服务的路由

这种设计的优势:

1. **统一前端调用方式**：无论是开发环境还是生产环境，前端代码保持一致
2. **解决跨域问题**：自动处理跨域请求问题 
3. **环境隔离**：前端不需要知道后端服务的真实地址，便于环境切换
4. **特定服务特定配置**：可以为不同服务设置不同的请求配置
