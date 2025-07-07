# Iconify 图标使用指南

## 概述
项目已集成 [Iconify](https://iconify.design/) 图标库，提供超过 18 万个图标，支持多种图标集合。

## 安装
```bash
npm install --save @iconify/vue
```

## 使用方法

### 1. 导入组件
```vue
<script setup>
import IconifyIcon from '@/components/IconifyIcon.vue';
</script>
```

### 2. 基本使用
```vue
<template>
  <!-- 基本使用 -->
  <IconifyIcon icon="mdi:home" />
  
  <!-- 指定大小 -->
  <IconifyIcon icon="mdi:user" size="24" />
  
  <!-- 指定颜色 -->
  <IconifyIcon icon="mdi:heart" color="#ff0000" />
  
  <!-- 自定义样式 -->
  <IconifyIcon 
    icon="mdi:star" 
    size="32" 
    color="#00A6FB" 
    className="custom-icon"
  />
</template>
```

## 推荐图标集合

### Material Design Icons (mdi)
- 最全面的图标集合，超过 7000 个图标
- 适合各种场景使用
- 例子：`mdi:home`, `mdi:user`, `mdi:settings`

### Tabler Icons (tabler)
- 现代简洁的图标风格
- 适合专业界面
- 例子：`tabler:home`, `tabler:user`, `tabler:settings`

### Heroicons (heroicons)
- Tailwind CSS 团队设计
- 有 outline 和 solid 两种风格
- 例子：`heroicons:home`, `heroicons:user-solid`

### Lucide Icons (lucide)
- 轻量级、一致性强
- 适合现代应用
- 例子：`lucide:home`, `lucide:user`, `lucide:settings`

## 常用图标示例

### 用户相关
```vue
<IconifyIcon icon="mdi:account" />          <!-- 用户 -->
<IconifyIcon icon="mdi:account-group" />    <!-- 用户组 -->
<IconifyIcon icon="mdi:account-supervisor" /> <!-- 管理员 -->
```

### 操作相关
```vue
<IconifyIcon icon="mdi:plus" />           <!-- 添加 -->
<IconifyIcon icon="mdi:pencil" />         <!-- 编辑 -->
<IconifyIcon icon="mdi:delete" />         <!-- 删除 -->
<IconifyIcon icon="mdi:eye" />            <!-- 查看 -->
<IconifyIcon icon="mdi:refresh" />        <!-- 刷新 -->
```

### 状态相关
```vue
<IconifyIcon icon="mdi:check-circle" />   <!-- 成功 -->
<IconifyIcon icon="mdi:alert-circle" />   <!-- 警告 -->
<IconifyIcon icon="mdi:close-circle" />   <!-- 错误 -->
<IconifyIcon icon="mdi:information" />    <!-- 信息 -->
```

### 媒体控制
```vue
<IconifyIcon icon="mdi:play" />           <!-- 播放 -->
<IconifyIcon icon="mdi:pause" />          <!-- 暂停 -->
<IconifyIcon icon="mdi:stop" />           <!-- 停止 -->
<IconifyIcon icon="mdi:skip-next" />      <!-- 下一个 -->
<IconifyIcon icon="mdi:skip-previous" />  <!-- 上一个 -->
```

### 导航相关
```vue
<IconifyIcon icon="mdi:chevron-up" />     <!-- 向上 -->
<IconifyIcon icon="mdi:chevron-down" />   <!-- 向下 -->
<IconifyIcon icon="mdi:chevron-left" />   <!-- 向左 -->
<IconifyIcon icon="mdi:chevron-right" />  <!-- 向右 -->
<IconifyIcon icon="mdi:arrow-down" />     <!-- 箭头向下 -->
```

### 业务相关
```vue
<IconifyIcon icon="mdi:workflow" />       <!-- 工作流 -->
<IconifyIcon icon="mdi:clock-check" />    <!-- 时间检查 -->
<IconifyIcon icon="mdi:vector-point" />   <!-- 节点 -->
<IconifyIcon icon="mdi:timeline" />       <!-- 时间线 -->
```

## 查找图标
1. 访问 [Iconify 官网](https://iconify.design/)
2. 搜索需要的图标
3. 复制图标名称（格式：`图标集:图标名`）
4. 在项目中使用

## 注意事项
1. 图标名称格式：`图标集:图标名`，如 `mdi:home`
2. 推荐使用 Material Design Icons (mdi) 作为主要图标集
3. 保持项目中图标风格的一致性
4. 合理设置图标大小，避免过大或过小
5. 考虑图标的语义化，选择合适的图标表达功能

## 自定义图标组件属性
- `icon`: 图标名称（必填）
- `size`: 图标大小（可选，默认 1em）
- `color`: 图标颜色（可选）
- `width`: 图标宽度（可选）
- `height`: 图标高度（可选）
- `className`: 自定义CSS类名（可选） 