/**
 * 节点配置文件 - 定义节点样式、颜色和连接线样式
 */

// 节点尺寸配置
export const NODE_SIZE = {
  WIDTH: 100,   // 节点宽度
  HEIGHT: 60    // 节点高度
};

// 节点状态颜色配置
export const NODE_COLORS = {
  // 默认节点颜色（无变更）
  DEFAULT: {
    fill: '#ffffff',
    border: '#1890ff'
  },
  // 变更/拒绝节点颜色
  CHANGED: {
    fill: '#fff7e6',
    border: '#fa8c16'
  }
};

// 连接线样式配置
export const CONNECTION_STYLES = {
  // 连接线类型
  TYPES: {
    SOLID: 'solid',    // 实线
    DASHED: 'dashed'   // 虚线
  },
  
  // 连接线样式
  DEFAULT: {
    style: 'solid',
    color: '#666666',
    width: 1.5
  },
  
  APPROVAL: {
    style: 'solid',
    color: '#52c41a',
    width: 2
  },
  
  REJECTION: {
    style: 'dashed',
    color: '#f5222d',
    width: 1.5
  },
  
  CHANGE: {
    style: 'dashed',
    color: '#fa8c16',
    width: 1.5
  }
};

/**
 * 颜色管理器 - 管理节点颜色分配
 */
class ColorManager {
  // 已使用的颜色集合
  private usedColors: Set<string> = new Set();
  
  /**
   * 获取节点颜色
   * @param isChanged 是否为变更节点
   * @returns 节点颜色对象
   */
  getNodeColor(isChanged: boolean) {
    return isChanged ? NODE_COLORS.CHANGED : NODE_COLORS.DEFAULT;
  }
  
  /**
   * 重置已使用的颜色
   */
  resetUsedColors() {
    this.usedColors.clear();
  }
}

/**
 * 获取连接线样式
 * @param type 连接类型
 * @returns 连接线样式
 */
export function getConnectionStyle(type: string) {
  switch (type) {
    case 'approval':
      return CONNECTION_STYLES.APPROVAL;
    case 'rejection':
      return CONNECTION_STYLES.REJECTION;
    case 'change':
      return CONNECTION_STYLES.CHANGE;
    default:
      return CONNECTION_STYLES.DEFAULT;
  }
}

// 导出颜色管理器实例
export const colorManager = new ColorManager(); 