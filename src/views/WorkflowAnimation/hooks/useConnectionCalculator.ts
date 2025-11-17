import { ref, nextTick } from 'vue';
import type { WorkflowNode, ProcessedConnection } from '../types';

export function useConnectionCalculator() {
  const processedConnections = ref<ProcessedConnection[]>([]);

  /**
   * 计算连接线
   */
  const calculateConnections = (
    nodeData: WorkflowNode[],
    connectionsLayer: SVGElement | null
  ) => {
    processedConnections.value = [];
    
    if (!nodeData || !Array.isArray(nodeData)) return;
    
    // 创建节点ID到DOM元素的映射
    const nodeElements = new Map<string, Element>();
    
    // 记录连接的节点对，用于避免重叠
    const connectionPairs = new Map<string, number>();
    
    // 等待DOM更新完成
    nextTick(() => {
      // 收集所有节点元素
      document.querySelectorAll('.workflow-node:not(.animation-node)').forEach((el: Element) => {
        const nodeId = el.getAttribute('data-node-id');
        if (nodeId) {
          nodeElements.set(nodeId, el);
        }
      });
      
      // 处理每个节点的连接
      nodeData.forEach((node: WorkflowNode) => {
        if (!node.connections || !Array.isArray(node.connections)) return;
        
        const fromElement = nodeElements.get(node.id);
        if (!fromElement) return;
        
        node.connections.forEach((connection) => {
          const toElement = nodeElements.get(connection.toNodeId);
          if (!toElement) return;
          
          // 计算连接线路径
          const connectionPath = calculateConnectionPath(
            fromElement,
            toElement,
            node.id,
            connection.toNodeId,
            connectionPairs,
            connectionsLayer
          );
          
          if (connectionPath) {
            processedConnections.value.push({
              id: connection.id || `${node.id}-${connection.toNodeId}`,
              path: connectionPath.path,
              color: connection.style?.color || '#3aa0ff',
              width: connection.style?.width || 1.5,
              dashArray: connection.style?.type === 'dashed' ? '5,3' : 'none',
              startPosition: connectionPath.startPosition,
              endPosition: connectionPath.endPosition
            });
          }
        });
      });
    });
  };

  /**
   * 计算单条连接线路径
   */
  const calculateConnectionPath = (
    fromElement: Element,
    toElement: Element,
    fromNodeId: string,
    toNodeId: string,
    connectionPairs: Map<string, number>,
    connectionsLayer: SVGElement | null
  ) => {
    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();
    
    const fromCenterX = fromRect.left + fromRect.width / 2;
    const fromCenterY = fromRect.top + fromRect.height / 2;
    const toCenterX = toRect.left + toRect.width / 2;
    const toCenterY = toRect.top + toRect.height / 2;
    
    // 判断连接方向
    const isHorizontal = Math.abs(toCenterX - fromCenterX) > Math.abs(toCenterY - fromCenterY);
    
    // 计算偏移量以避免重叠
    const [id1, id2] = [fromNodeId, toNodeId].sort();
    const nodePairKey = `${id1}-${id2}`;
    let connectionCount = connectionPairs.get(nodePairKey) || 0;
    connectionPairs.set(nodePairKey, connectionCount + 1);
    
    let offsetX = 0;
    let offsetY = 0;
    
    if (connectionCount > 0) {
      const offsetAmount = 20 * connectionCount;
      if (isHorizontal) {
        offsetY = offsetAmount;
      } else {
        offsetX = offsetAmount;
      }
    }
    
    // 计算起点和终点
    let startX: number, startY: number, endX: number, endY: number;
    
    if (isHorizontal) {
      startX = fromCenterX + (fromCenterX < toCenterX ? fromRect.width / 2 : -fromRect.width / 2);
      startY = fromCenterY + offsetY;
      endX = toCenterX + (toCenterX < fromCenterX ? toRect.width / 2 : -toRect.width / 2);
      endY = toCenterY + offsetY;
    } else {
      startX = fromCenterX + offsetX;
      startY = fromCenterY + (fromCenterY < toCenterY ? fromRect.height / 2 : -fromRect.height / 2);
      endX = toCenterX + offsetX;
      endY = toCenterY + (toCenterY < fromCenterY ? toRect.height / 2 : -toRect.height / 2);
    }
    
    // 调整SVG坐标系
    const svgRect = connectionsLayer?.getBoundingClientRect();
    if (svgRect) {
      startX -= svgRect.left;
      startY -= svgRect.top;
      endX -= svgRect.left;
      endY -= svgRect.top;
    }
    
    return {
      path: `M ${startX} ${startY} L ${endX} ${endY}`,
      startPosition: { x: fromCenterX, y: fromCenterY },
      endPosition: { x: toCenterX, y: toCenterY }
    };
  };

  return {
    processedConnections,
    calculateConnections
  };
} 