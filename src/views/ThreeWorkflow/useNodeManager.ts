import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { ReviewNode, ReviewNodeStatus, createReviewNode } from './useReviewNode';

// 流程线连接点
interface ConnectionPoint {
  fromNodeId: string;
  toNodeId: string;
  fromPosition: THREE.Vector3;
  toPosition: THREE.Vector3;
}

export function useNodeManager() {
  // 存储所有节点的引用
  const nodes = new Map<string, ReviewNode>();

  // 存储连接线
  const connections = new Map<string, {
    line: THREE.Line,
    points: THREE.Vector3[],
    fromId: string,
    toId: string
  }>();

  /**
   * 创建审核节点
   */
  function createNode(scene: THREE.Scene, options: {
    id: string;
    title: string;
    position: THREE.Vector3;
    status: ReviewNodeStatus;
    files?: Array<{name: string, url: string, size?: string}>;
    onStatusChange?: (nodeId: string, newStatus: ReviewNodeStatus, comment?: string) => void;
    onClick?: (nodeId: string) => void;
  }) {
    // 创建节点
    const node = createReviewNode(options);

    // 添加到场景
    node.addToScene(scene);

    // 存储引用
    nodes.set(options.id, node);

    return node;
  }

  /**
   * 连接两个节点
   */
  function connectNodes(scene: THREE.Scene, fromNodeId: string, toNodeId: string) {
    const fromNode = nodes.get(fromNodeId);
    const toNode = nodes.get(toNodeId);

    if (!fromNode || !toNode) {
      console.error('连接节点失败：节点不存在');
      return null;
    }

    // 获取节点位置
    const fromPoint = fromNode.getMesh().position.clone();
    const toPoint = toNode.getMesh().position.clone();

    // 保持Y坐标不变，以便所有线条都在同一水平面上
    const y = fromPoint.y;

    // 处理节点在同一行的情况
    if (Math.abs(fromPoint.z - toPoint.z) < 0.1) {
      // 水平连接
      const points: THREE.Vector3[] = [];
      // 起点
      points.push(new THREE.Vector3(fromPoint.x, y, fromPoint.z));
      // 终点
      points.push(new THREE.Vector3(toPoint.x, y, toPoint.z));

      // 创建连接线
      const line = createConnectionLine(scene, points, fromNode, toNode);

      // 存储连接线信息
      const connectionId = `${fromNodeId}_to_${toNodeId}`;
      connections.set(connectionId, {
        line,
        points,
        fromId: fromNodeId,
        toId: toNodeId
      });

      return {
        line,
        points,
        fromId: fromNodeId,
        toId: toNodeId
      };
    } else {
      // 不在同一行，创建L形连接（先水平后垂直）
      const points: THREE.Vector3[] = [];
      // 起点
      points.push(new THREE.Vector3(fromPoint.x, y, fromPoint.z));
      // 水平中间点
      points.push(new THREE.Vector3(toPoint.x, y, fromPoint.z));
      // 终点
      points.push(new THREE.Vector3(toPoint.x, y, toPoint.z));

      // 创建连接线
      const line = createConnectionLine(scene, points, fromNode, toNode);

      // 存储连接线信息
      const connectionId = `${fromNodeId}_to_${toNodeId}`;
      connections.set(connectionId, {
        line,
        points,
        fromId: fromNodeId,
        toId: toNodeId
      });

      return {
        line,
        points,
        fromId: fromNodeId,
        toId: toNodeId
      };
    }
  }

  /**
   * 创建连接线的辅助函数
   */
  function createConnectionLine(scene: THREE.Scene, points: THREE.Vector3[], fromNode: ReviewNode, toNode: ReviewNode): THREE.Line {
    // 从节点ID中提取审核人信息，确定连接线颜色
    const fromReviewer = fromNode.getMesh().userData.id?.split('_')[0] || '';

    // 计算连接线颜色
    const color = getReviewerColor(fromReviewer);

    // 决定是实线还是虚线
    const fromNodeId = fromNode.getMesh().userData.id || '';
    const toNodeId = toNode.getMesh().userData.id || '';
    const isDashed = fromNodeId.includes('市场文件') || toNodeId.includes('市场需求文件');

    // 创建线条材质 - 根据状态和文档类型决定样式
    let material;

    if (isDashed) {
      // 创建虚线材质
      material = new THREE.LineDashedMaterial({
        color: color,
        dashSize: 6,
        gapSize: 3,
        linewidth: 2,
        opacity: 0.85,
        transparent: true
      });
    } else {
      // 创建实线材质
      material = new THREE.LineBasicMaterial({
        color: color,
        linewidth: 2,
        opacity: 0.85,
        transparent: true
      });
    }

    // 创建线条几何体
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);

    // 如果是虚线，需要计算线段长度
    if (isDashed && material instanceof THREE.LineDashedMaterial) {
      line.computeLineDistances();
    }

    // 存储关联节点ID，用于后续交互
    line.userData = {
      fromNodeId: fromNodeId,
      toNodeId: toNodeId,
      type: 'connection'
    };

    scene.add(line);
    return line;
  }

  /**
   * 获取两个节点之间的连接线
   */
  function getConnection(fromNodeId: string, toNodeId: string) {
    // 尝试直接匹配
    const connectionId = `${fromNodeId}_to_${toNodeId}`;
    if (connections.has(connectionId)) {
      return connections.get(connectionId);
    }

    // 如果没有直接匹配，尝试模糊匹配
    // 这在处理基于正则表达式的节点ID时很有用
    for (const [key, connection] of connections.entries()) {
      if (connection.fromId === fromNodeId && connection.toId === toNodeId) {
        return connection;
      }
    }

    // 没有找到连接
    return null;
  }

  /**
   * 根据审核人获取特定颜色
   */
  function getReviewerColor(reviewerName: string): number {
    // 为不同审核人分配固定颜色
    switch(reviewerName) {
      case '张三':
        return 0x3399ff; // 蓝色
      case '李四':
        return 0x00cc66; // 绿色
      case '王五':
        return 0xffcc00; // 黄色
      case '赵六':
        return 0xff6633; // 橙色
      default:
        return 0xaaaaaa; // 默认灰色
    }
  }

  /**
   * 根据节点状态获取连接线颜色
   */
  function getConnectionColor(node: ReviewNode): number {
    const status = node.getMesh().userData.status;

    switch(status) {
      case ReviewNodeStatus.APPROVED:
        return 0x00cc66; // 绿色
      case ReviewNodeStatus.REJECTED:
        return 0xff3366; // 红色
      case ReviewNodeStatus.REVIEWING:
        return 0xffcc00; // 黄色
      case ReviewNodeStatus.PENDING:
        return 0x888888; // 灰色
      case ReviewNodeStatus.SUBMITTED:
        return 0x00aaff; // 蓝色
      default:
        return 0xaaaaaa; // 默认灰色
    }
  }

  /**
   * 批量创建节点
   */
  function createNodesFromData(scene: THREE.Scene, nodesData: Array<{
    id: string;
    title: string;
    position: THREE.Vector3;
    status: ReviewNodeStatus;
    files?: Array<{name: string, url: string, size?: string}>;
    connections?: string[]; // 要连接到的节点ID列表
  }>, handlers: {
    onStatusChange?: (nodeId: string, newStatus: ReviewNodeStatus, comment?: string) => void;
    onClick?: (nodeId: string) => void;
  }) {
    // 首先创建所有节点
    nodesData.forEach(nodeData => {
      createNode(scene, {
        id: nodeData.id,
        title: nodeData.title,
        position: nodeData.position,
        status: nodeData.status,
        files: nodeData.files,
        onStatusChange: handlers.onStatusChange,
        onClick: handlers.onClick
      });
    });

    // 然后创建连接
    nodesData.forEach(nodeData => {
      if (nodeData.connections && nodeData.connections.length > 0) {
        nodeData.connections.forEach(targetId => {
          connectNodes(scene, nodeData.id, targetId);
        });
      }
    });
  }

  /**
   * 更新节点状态
   */
  function updateNodeStatus(nodeId: string, newStatus: ReviewNodeStatus): boolean {
    const node = nodes.get(nodeId);
    if (!node) {
      console.error(`未找到节点: ${nodeId}`);
      return false;
    }

    node.updateStatus(newStatus);
    return true;
  }

  /**
   * 获取节点
   */
  function getNode(nodeId: string): ReviewNode | undefined {
    return nodes.get(nodeId);
  }

  /**
   * 清理资源
   */
  function cleanup(scene: THREE.Scene) {
    // 清理所有节点
    for (const node of nodes.values()) {
      node.removeFromScene(scene);
    }
    nodes.clear();

    // 清理所有连接线
    for (const connection of connections.values()) {
      scene.remove(connection.line);
    }
    connections.clear();
  }

  /**
   * 为连接线添加标签
   * @param scene 场景对象
   * @param connection 连接对象，包含line和points属性
   * @param text 标签文本
   * @param statusColor 状态颜色（可选）
   */
  function addConnectionLabel(scene: THREE.Scene, connection: {
    line: THREE.Line,
    points: THREE.Vector3[],
    fromId: string,
    toId: string
  }, text: string, statusColor?: string) {
    // 获取连接线对象
    const line = connection.line;

    // 获取连接线上的点
    const points = connection.points;

    // 根据线条类型选择合适的标签位置
    let labelPosition = new THREE.Vector3();

    if (points.length === 2) {
      // 水平线 - 简单取中点
      const startPoint = points[0];
      const endPoint = points[1];

      // 计算中点
      labelPosition.addVectors(startPoint, endPoint).divideScalar(2);
    } else if (points.length === 3) {
      // 直角线（L形）- 选择第二个点（拐角）
      labelPosition.copy(points[1]);
    } else {
      // 其他情况，选择中间点
      const midIndex = Math.floor(points.length / 2);
      labelPosition.copy(points[midIndex]);
    }

    // 应用矩阵变换，转换到世界坐标
    const worldPosition = labelPosition.clone();
    worldPosition.applyMatrix4(line.matrixWorld);

    // 创建标签元素
    const labelDiv = document.createElement('div');
    labelDiv.className = 'connection-label';

    // 设置标签基本样式
    labelDiv.style.padding = '3px 8px';
    labelDiv.style.borderRadius = '10px';
    labelDiv.style.fontFamily = 'Microsoft YaHei, sans-serif';
    labelDiv.style.fontSize = '11px';
    labelDiv.style.fontWeight = 'bold';
    labelDiv.style.textAlign = 'center';
    labelDiv.style.pointerEvents = 'none';
    labelDiv.style.whiteSpace = 'nowrap';
    labelDiv.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.3)';

    // 如果提供了状态颜色，则使用它来设置标签样式
    if (statusColor) {
      // 设置边框颜色
      labelDiv.style.border = `1px solid ${statusColor}`;

      // 设置文本颜色为状态颜色
      labelDiv.style.color = statusColor;

      // 使用半透明的深色背景
      labelDiv.style.backgroundColor = 'rgba(15, 35, 75, 0.85)';

      // 添加内部阴影效果
      labelDiv.style.textShadow = '0 1px 2px rgba(0,0,0,0.5)';
    } else {
      // 默认样式
      labelDiv.style.backgroundColor = 'rgba(15, 35, 75, 0.85)';
      labelDiv.style.color = 'white';
      labelDiv.style.border = '1px solid rgba(255, 255, 255, 0.3)';
    }

    // 文本内容
    labelDiv.textContent = text;

    // 创建CSS2D对象
    const labelObject = new CSS2DObject(labelDiv);
    labelObject.position.copy(worldPosition);

    // 使标签位置略微上移，以免挡住连接线
    labelObject.position.y += 5;

    // 将标签添加到场景
    scene.add(labelObject);

    // 存储连接线与标签的关系
    line.userData.label = labelObject;

    return labelObject;
  }

  return {
    createNode,
    getNode,
    connectNodes,
    addConnectionLabel,
    createNodesFromData,
    updateNodeStatus,
    getConnection,
    cleanup
  };
}
