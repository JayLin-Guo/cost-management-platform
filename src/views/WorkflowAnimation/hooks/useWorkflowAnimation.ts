import { ref, nextTick } from 'vue';
import type { WorkflowNode, Position, ProcessedConnection } from '../types';

export function useWorkflowAnimation() {
  // 动画节点位置和状态
  const animationNodePosition = ref<Position>({ x: 0, y: 0 });
  const animationNodeVisible = ref<boolean>(false);
  const animationPath = ref<Position[]>([]);
  const animationPathNodes = ref<(WorkflowNode | null)[]>([]); // 记录每个路径点对应的节点
  const currentPathIndex = ref<number>(0);
  const animationFrameId = ref<number | null>(null);
  const shouldRestart = ref<boolean>(false); // 标记是否需要重新开始

  /**
   * 找到开始节点
   */
  const findStartNode = (nodeData: WorkflowNode[]): WorkflowNode | null => {
    if (!nodeData || !Array.isArray(nodeData) || nodeData.length === 0) {
      return null;
    }
    
    // 查找没有被其他节点连接的节点（入度为0）作为起始节点
    const connectedNodeIds = new Set<string>();
    
    nodeData.forEach(node => {
      if (node.connections && Array.isArray(node.connections)) {
        node.connections.forEach(conn => {
          connectedNodeIds.add(conn.toNodeId);
        });
      }
    });
    
    // 找到第一个不在连接目标集合中的节点
    const startNode = nodeData.find(node => !connectedNodeIds.has(node.id));
    
    // 如果没有找到，就使用第一个节点
    return startNode || nodeData[0];
  };

  /**
   * 获取节点的位置
   */
  const getNodePosition = (nodeId: string): Position | null => {
    const nodeElement = document.querySelector(`.workflow-node[data-node-id="${nodeId}"]`);
    if (!nodeElement) return null;
    
    const rect = nodeElement.getBoundingClientRect();
    const viewRect = document.querySelector('.workflow-view')?.getBoundingClientRect() || { left: 0, top: 0 };
    
    // 计算相对于工作流视图的位置
    return {
      x: rect.left + rect.width / 2 - viewRect.left,
      y: rect.top + rect.height / 2 - viewRect.top
    };
  };

  /**
   * 构建动画路径
   */
  const buildAnimationPath = (nodeData: WorkflowNode[], processedConnections: ProcessedConnection[]) => {
    // 清空现有路径和节点数据
    animationPath.value = [];
    animationPathNodes.value = [];
    
    console.log('开始构建动画路径，节点数据:', nodeData.map(node => ({
      id: node.id,
      title: node.title,
      status: node.status
    })));
    
    // 根据连接线构建完整路径
    if (processedConnections.length === 0) return;
    
    // 找到开始节点
    const startNode = findStartNode(nodeData);
    if (!startNode) return;
    
    // 已访问过的节点ID
    const visitedNodeIds = new Set<string>();
    
    // 递归构建路径
    const buildPath = (currentNodeId: string, depth = 0, maxDepth = 30) => {
      // 防止无限循环
      if (depth > maxDepth || visitedNodeIds.has(currentNodeId)) return;
      
      // 标记当前节点已访问
      visitedNodeIds.add(currentNodeId);
      
      // 获取当前节点位置
      const nodePos = getNodePosition(currentNodeId);
      if (nodePos) {
        animationPath.value.push(nodePos);
        animationPathNodes.value.push(nodeData.find(node => node.id === currentNodeId) || null);
      }
      
      // 找到从当前节点出发的所有连接
      const connections = nodeData
        .find(node => node.id === currentNodeId)
        ?.connections || [];
      
      // 对于每个连接，继续构建路径
      connections.forEach(conn => {
        const targetNodeId = conn.toNodeId;
        
        // 获取目标节点位置
        const targetPos = getNodePosition(targetNodeId);
        if (targetPos) {
          // 添加连接中间点以实现平滑移动
          const currentPos = animationPath.value[animationPath.value.length - 1];
          if (currentPos) {
            // 为路径添加多个中间点，使动画更加平滑
            const steps = 15; // 中间点数量
            const currentNode = nodeData.find(node => node.id === currentNodeId) || null;
            
            for (let i = 1; i <= steps; i++) {
              const ratio = i / (steps + 1);
              animationPath.value.push({
                x: currentPos.x + (targetPos.x - currentPos.x) * ratio,
                y: currentPos.y + (targetPos.y - currentPos.y) * ratio
              });
              // 中间点保持当前节点的引用
              animationPathNodes.value.push(currentNode);
            }
          }
          
          // 添加目标节点位置
          animationPath.value.push(targetPos);
          animationPathNodes.value.push(nodeData.find(node => node.id === targetNodeId) || null);
          
          // 继续构建路径
          buildPath(targetNodeId, depth + 1, maxDepth);
        }
      });
    };
    
    // 从开始节点构建路径
    buildPath(startNode.id);
    
    // 如果路径不为空，启动动画
    if (animationPath.value.length > 0) {
      currentPathIndex.value = 0;
      animationNodeVisible.value = true;
      animationNodePosition.value = { ...animationPath.value[0] };
      startAnimation();
    }
  };

  /**
   * 检查是否为流程结束状态
   */
  const isEndStatus = (status: string): boolean => {
    return status.toLowerCase() === 'end';
  };

  /**
   * 动画循环
   */
  const animateNode = () => {
  
    if (animationPath.value.length === 0) {
      animationNodeVisible.value = false;
      return;
    }
    
    // 获取当前位置和目标位置
    const currentPosition = animationNodePosition.value;
    const targetPosition = animationPath.value[currentPathIndex.value];
    
    // 计算移动速度
    const speed = 2; // 调整速度
    const dx = (targetPosition.x - currentPosition.x) / speed;
    const dy = (targetPosition.y - currentPosition.y) / speed;
    
    // 如果距离目标点足够近，则移动到下一个点
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
      // 检查当前位置对应的节点状态
      const currentNode = animationPathNodes.value[currentPathIndex.value];
      
      // 如果当前节点状态表示流程结束，停止动画并重置后重新开始
      if (currentNode && isEndStatus(currentNode.status)) {
        console.log('动画到达流程结束节点，停止动画并重置后重新开始:', {
          nodeId: currentNode.id,
          title: currentNode.title,
          status: currentNode.status
        });
        stopAnimation();
        // 延迟一下再重置并标记需要重新开始
        setTimeout(() => {
          resetAnimation();
          // 标记需要重新开始
          shouldRestart.value = true;
        }, 1000);
        return;
      }
      
      // 检查是否到达路径终点
      if (currentPathIndex.value >= animationPath.value.length - 1) {
        // 到达路径终点，停止动画并重置后重新开始
        console.log('动画到达路径终点，停止动画并重置后重新开始');
        stopAnimation();
        setTimeout(() => {
          resetAnimation();
          // 标记需要重新开始
          shouldRestart.value = true;
        }, 1000);
        return;
      }
      
      // 正常移动到下一个点
      currentPathIndex.value += 1;
    } else {
      // 更新位置
      animationNodePosition.value = {
        x: currentPosition.x + dx,
        y: currentPosition.y + dy
      };
    }
    
    // 请求下一帧动画
    animationFrameId.value = requestAnimationFrame(animateNode);
  };

  /**
   * 开始动画
   */
  const startAnimation = () => {
    // 如果路径为空，不能启动动画
    if (animationPath.value.length === 0) {
      console.log('动画路径为空，无法启动动画。请先调用 buildAnimationPath');
      return;
    }
    
    // 如果已经有动画在运行，先停止
    if (animationFrameId.value !== null) {
      cancelAnimationFrame(animationFrameId.value);
    }
    
    // 确保动画节点可见且在正确位置
    animationNodeVisible.value = true;
    if (currentPathIndex.value >= animationPath.value.length) {
      currentPathIndex.value = 0;
    }
    if (animationPath.value[currentPathIndex.value]) {
      animationNodePosition.value = { ...animationPath.value[currentPathIndex.value] };
    }
    
    console.log('开始动画，路径长度:', animationPath.value.length);
    
    // 开始新的动画循环
    animationFrameId.value = requestAnimationFrame(animateNode);
  };

  /**
   * 重新开始动画（重新构建路径并开始）
   */
  const restartAnimation = (nodeData: WorkflowNode[], processedConnections: ProcessedConnection[]) => {
    console.log('重新开始动画');
    // 先重置状态
    resetAnimation();
    // 重新构建路径并开始动画
    buildAnimationPath(nodeData, processedConnections);
  };

  /**
   * 停止动画
   */
  const stopAnimation = () => {
    if (animationFrameId.value !== null) {
      cancelAnimationFrame(animationFrameId.value);
      animationFrameId.value = null;
    }
    
    // 动画停止后，节点保持在当前位置，不立即清空数据
    // 这样可以看到动画节点停留在最终位置
    console.log('动画已停止，节点保持在当前位置');
  };

  /**
   * 重置动画状态（用于重新开始动画）
   */
  const resetAnimation = () => {
    // 清空所有动画数据
    animationNodeVisible.value = false;
    animationPath.value = [];
    animationPathNodes.value = [];
    currentPathIndex.value = 0;
    animationNodePosition.value = { x: 0, y: 0 };
    console.log('动画状态已重置');
  };

  /**
   * 检查是否需要重新开始并清除标志
   */
  const checkAndClearRestartFlag = () => {
    const needRestart = shouldRestart.value;
    shouldRestart.value = false;
    return needRestart;
  };

  return {
    animationNodePosition,
    animationNodeVisible,
    shouldRestart,
    isEndStatus,
    buildAnimationPath,
    startAnimation,
    stopAnimation,
    resetAnimation,
    checkAndClearRestartFlag,
    restartAnimation
  };
} 