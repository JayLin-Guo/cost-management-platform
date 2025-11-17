# 样式文件说明

## 📁 文件结构

```
styles/
├── index.scss          # 样式入口文件
├── variables.scss      # 全局变量定义
├── reset.scss          # 样式重置
├── element-dark.scss   # Element Plus 暗色主题覆盖
└── README.md          # 说明文档
```

## 🎨 主题配色方案

### 当前使用：标准深灰色方案 ✨

采用业界主流的深灰色配色方案，参考了 GitHub、VS Code、Omni 等优秀暗色主题。

```scss
// 标准深灰色方案
$dark-bg-primary: #1e1e1e; // 主背景
$dark-bg-secondary: #252526; // 卡片/组件背景
$dark-bg-tertiary: #2d2d30; // 三级背景（表头等）
$dark-bg-hover: #37373d; // 悬停背景
```

**配色特点**：

- ✅ 标准深灰色，舒适不刺眼
- ✅ 适合长时间使用，降低视觉疲劳
- ✅ 与主流暗色主题一致的体验
- ✅ 专业、现代、简洁
- ✅ 搭配亮蓝色主题色 (#3b82f6)

### 颜色层级说明

| 层级     | 颜色值    | 用途                 |
| -------- | --------- | -------------------- |
| 主背景   | `#1e1e1e` | 页面整体背景         |
| 组件背景 | `#252526` | 卡片、表格、输入框等 |
| 三级背景 | `#2d2d30` | 表头、高亮区域       |
| 悬停背景 | `#37373d` | 鼠标悬停效果         |
| 边框色   | `#3e3e42` | 组件边框             |

### 主题色

- **主色调**: `#3b82f6` - 标准蓝色
- **成功色**: `#10b981` - 绿色
- **警告色**: `#f59e0b` - 橙色
- **错误色**: `#ef4444` - 红色

## 🛠️ 已覆盖的 Element Plus 组件

- ✅ Table 表格
- ✅ Card 卡片
- ✅ Input 输入框
- ✅ Button 按钮
- ✅ Pagination 分页
- ✅ Dropdown 下拉菜单
- ✅ Select 选择器
- ✅ Descriptions 描述列表
- ✅ Empty 空状态
- ✅ Tag 标签
- ✅ Divider 分割线
- ✅ Avatar 头像
- ✅ Checkbox 复选框
- ✅ Message 消息提示
- ✅ Notification 通知
- ✅ Dialog 对话框
- ✅ Drawer 抽屉
- ✅ Tooltip 工具提示
- ✅ Page Header 页面头
- ✅ Skeleton 骨架屏
- ✅ Loading 加载
- ✅ Icon 图标
- ✅ Link 链接
- ✅ 滚动条美化

## 📝 自定义修改

如需修改某个组件的样式，直接在 `element-dark.scss` 中找到对应的组件区块进行修改即可。

例如，修改表格的背景色：

```scss
.el-table {
  --el-table-bg-color: #你的颜色;
  // ...
}
```

## 💡 配色参考

当前配色方案参考了以下优秀的暗色主题：

- GitHub Dark Theme
- VS Code Dark+ Theme
- Omni Theme
- Tailwind CSS Dark Mode

这些都是业界公认的优秀暗色主题设计。

## 🎯 最佳实践

1. **统一管理**：所有 Element Plus 组件的暗色样式都在 `element-dark.scss` 中
2. **变量优先**：优先使用 SCSS 变量，方便批量修改
3. **保持一致**：确保所有组件的颜色风格保持一致
4. **注释清晰**：添加必要的注释说明

## 🔄 更新日志

- 2025-01-28: 采用标准深灰色配色方案，参考主流暗色主题
- 2025-01-28: 创建暗色主题文件，完整覆盖 Element Plus 组件
