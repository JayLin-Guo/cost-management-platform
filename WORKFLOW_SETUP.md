# 工作流动画系统设置指南

这是一个完整的工作流动画系统，包含前端Vue.js应用和后端Node.js Mock API服务。

## 项目结构

```
cost-management-platform/
├── src/
│   ├── views/WorkflowAnimation/           # 工作流动画页面
│   │   ├── index.vue                      # 主页面组件
│   │   └── components/                    # 子组件
│   │       ├── WorkflowMatrix.vue         # 工作流矩阵组件
│   │       └── WorkflowDetails.vue        # 工作流详情组件
│   ├── api/
│   │   ├── workflow.ts                    # 前端API服务
│   │   └── mockData/                      # 后端Mock数据服务
│   │       ├── workflowMockData.js        # Mock数据定义
│   │       ├── workflowAPI.js             # Node.js API服务
│   │       ├── package.json               # 后端依赖配置
│   │       └── README.md                  # 后端API文档
│   └── types/
│       └── workflow.ts                    # TypeScript类型定义
├── scripts/                               # 启动脚本
│   ├── start-dev.bat                      # Windows批处理启动脚本
│   └── start-dev.ps1                      # PowerShell启动脚本
└── WORKFLOW_SETUP.md                      # 本文档
```

## 功能特性

### 前端功能
- 🎯 **工作流矩阵视图**: 2D表格展示时间点、审核人员和工作流节点
- 📊 **动态状态显示**: 实时显示节点状态（待处理、已完成、已批准、已拒绝）
- 👥 **审核人员管理**: 显示审核人员信息和在线状态
- 📁 **文件关联**: 每个节点可关联相关文件
- 🔗 **连接关系**: 显示节点间的连接和依赖关系
- 📱 **响应式设计**: 适配不同屏幕尺寸
- ⚡ **实时更新**: 支持状态实时更新和动画效果

### 后端功能
- 🚀 **RESTful API**: 完整的工作流数据API
- 📊 **数据过滤**: 支持按状态、审核人、时间点等过滤
- ⏱️ **模拟延迟**: 模拟真实网络请求延迟
- 🔄 **状态更新**: 支持节点状态的CRUD操作
- 📝 **详细日志**: 完善的错误处理和日志记录
- 🌐 **CORS支持**: 跨域请求支持

## 快速开始

### 方法一：使用启动脚本（推荐）

#### Windows用户
```bash
# 双击运行或在PowerShell中执行
.\scripts\start-dev.ps1
```

#### 或者使用批处理文件
```bash
# 双击运行
.\scripts\start-dev.bat
```

### 方法二：手动启动

#### 1. 启动后端API服务
```bash
cd src/api/mockData
npm install
npm run dev
```
后端服务将在 `http://localhost:3001` 启动

#### 2. 启动前端应用
```bash
# 在项目根目录
npm install
npm run dev
```
前端应用将在 `http://localhost:5173` 启动

## 访问地址

- **前端应用**: http://localhost:5173
- **后端API**: http://localhost:3001
- **API文档**: http://localhost:3001/

## 主要API接口

### 数据获取接口
- `GET /api/workflow/data` - 获取完整工作流数据
- `GET /api/workflow/nodes` - 获取工作流节点
- `GET /api/workflow/reviewers` - 获取审核人员
- `GET /api/workflow/timepoints` - 获取时间点
- `GET /api/workflow/files` - 获取文件信息

### 详情查询接口
- `GET /api/workflow/nodes/:id` - 获取节点详情
- `GET /api/workflow/files/:id` - 获取文件详情

### 状态更新接口
- `PUT /api/workflow/nodes/:id/status` - 更新节点状态

## 数据结构说明

### 工作流节点 (WorkflowNode)
```typescript
interface WorkflowNode {
  id: string                    // 节点ID
  title: string                 // 节点标题
  status: 'pending' | 'completed' | 'approved' | 'rejected'
  type: string                  // 节点类型
  reviewerId: string            // 审核人ID
  timePointId: string           // 时间点ID
  createdAt: string             // 创建时间
  fileId?: string               // 关联文件ID
  stateInfo: string             // 状态信息
  connections: Connection[]     // 连接关系
  position: { x: number; y: number; z: number }
}
```

### 审核人员 (Reviewer)
```typescript
interface Reviewer {
  id: string                    // 审核人ID
  name: string                  // 姓名
  role: string                  // 角色
  department: string            // 部门
  status: 'online' | 'busy' | 'offline'
  phone: string                 // 电话
  email: string                 // 邮箱
  avatar: string                // 头像URL
}
```

### 时间点 (TimePoint)
```typescript
interface TimePoint {
  id: string                    // 时间点ID
  date: string                  // 日期
  label: string                 // 标签
  isInterval: boolean           // 是否为时间段
  displayWidth: number          // 显示宽度
  hasNodes: boolean             // 是否有节点
  nodeCount: number             // 节点数量
}
```

## 开发说明

### 前端技术栈
- **Vue 3**: 组合式API
- **TypeScript**: 类型安全
- **Element Plus**: UI组件库
- **Vite**: 构建工具

### 后端技术栈
- **Node.js**: 运行环境
- **Express**: Web框架
- **CORS**: 跨域支持

### 开发规范
1. 所有API请求都有错误处理
2. 使用TypeScript确保类型安全
3. 组件采用组合式API编写
4. 遵循Vue 3最佳实践

## 自定义配置

### 修改API地址
如需修改后端API地址，请编辑 `src/api/workflow.ts` 中的 `BASE_URL` 常量：

```typescript
const BASE_URL = 'http://your-api-server:port/api/workflow'
```

### 添加新的Mock数据
在 `src/api/mockData/workflowMockData.js` 中添加新的数据：

```javascript
// 添加新的节点
const newNode = {
  id: 'node-009',
  title: '新的工作流节点',
  status: 'pending',
  // ... 其他属性
}

workflowNodes.push(newNode)
```

### 添加新的API接口
在 `src/api/mockData/workflowAPI.js` 中添加新的路由：

```javascript
app.get('/api/workflow/custom-endpoint', async (req, res) => {
  // 自定义逻辑
  res.json({ success: true, data: customData })
})
```

## 故障排除

### 常见问题

1. **端口被占用**
   - 修改 `src/api/mockData/workflowAPI.js` 中的 `PORT` 变量
   - 或设置环境变量 `PORT=3002`

2. **CORS错误**
   - 确保后端服务已启动
   - 检查前端API地址配置是否正确

3. **依赖安装失败**
   - 清除缓存：`npm cache clean --force`
   - 删除 `node_modules` 重新安装

4. **TypeScript类型错误**
   - 检查 `src/types/workflow.ts` 中的类型定义
   - 确保接口属性与实际数据结构匹配

### 调试技巧

1. **查看API请求**
   - 打开浏览器开发者工具
   - 查看Network标签页中的请求

2. **查看后端日志**
   - 后端控制台会显示所有API请求日志
   - 错误信息会详细显示

3. **检查数据结构**
   - 访问 `http://localhost:3001/api/workflow/data`
   - 直接查看API返回的数据结构

## 部署说明

### 开发环境
使用提供的启动脚本即可快速启动开发环境。

### 生产环境
1. 构建前端应用：`npm run build`
2. 部署静态文件到Web服务器
3. 部署后端API服务到Node.js服务器
4. 配置反向代理（如Nginx）

## 扩展功能

### 可扩展的功能点
1. **数据持久化**: 连接真实数据库
2. **用户认证**: 添加登录和权限控制
3. **实时通信**: 使用WebSocket实现实时更新
4. **文件上传**: 支持文件上传和预览
5. **导出功能**: 支持导出工作流图表
6. **移动端适配**: 优化移动端体验

### 性能优化
1. **虚拟滚动**: 处理大量节点数据
2. **懒加载**: 按需加载组件和数据
3. **缓存策略**: 实现数据缓存机制
4. **CDN加速**: 静态资源CDN部署

## 技术支持

如遇到问题，请检查：
1. Node.js版本是否 >= 14.0.0
2. npm版本是否为最新
3. 端口3001和5173是否被占用
4. 防火墙是否阻止了端口访问

## 更新日志

### v1.0.0 (2024-01-20)
- ✨ 初始版本发布
- 🎯 完整的工作流矩阵视图
- 📊 Node.js Mock API服务
- 🚀 自动化启动脚本
- 📝 完整的文档和类型定义 