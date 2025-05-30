import * as THREE from 'three'
import type { WorkflowNode } from './types'

/**
 * 流程颜色配置
 * 每个配置包含动画节点颜色和固定节点颜色，以及相关的材质参数
 */
export interface FlowColorConfig {
  // 基本颜色
  animationColor: number;       // 动画节点颜色
  nodeColor: number;            // 固定节点颜色
  edgeColor: number;            // 边缘线颜色
  emissiveColor: number;        // 发光颜色
  
  // 材质参数
  emissiveIntensity: number;    // 发光强度
  opacity: number;              // 不透明度
  metalness: number;            // 金属度
  roughness: number;            // 粗糙度
  
  // 动画参数
  pulseSpeed: number;           // 脉冲速度
  pulseAmount: number;          // 脉冲幅度
  floatHeight: number;          // 悬浮高度
  floatSpeed: number;           // 悬浮速度
}

/**
 * 预定义的流程颜色配置
 * 用于区分不同的审核流程
 */
export const FLOW_COLOR_CONFIGS: FlowColorConfig[] = [
  {
    // 第一个审核流程 - 紫蓝色调
    animationColor: 0x8844ff,    // 紫色
    nodeColor: 0x4287f5,         // 蓝色
    edgeColor: 0xaa88ff,         // 亮紫色边缘
    emissiveColor: 0x6600ff,     // 紫色发光
    
    emissiveIntensity: 0.8,      // 较强发光
    opacity: 0.85,               // 较高不透明度
    metalness: 0.7,              // 中等金属感
    roughness: 0.2,              // 较光滑
    
    pulseSpeed: 0.003,           // 中等脉冲速度
    pulseAmount: 0.2,            // 中等脉冲幅度
    floatHeight: 50,             // 标准悬浮高度
    floatSpeed: 0.002            // 标准悬浮速度
  },
  {
    // 第二个审核流程 - 橙黄色调（驳回后重新开始）
    animationColor: 0xff8800,    // 橙色
    nodeColor: 0xf5a742,         // 黄色
    edgeColor: 0xffaa44,         // 亮橙色边缘
    emissiveColor: 0xff6600,     // 橙色发光
    
    emissiveIntensity: 0.9,      // 较强发光
    opacity: 0.8,                // 中等不透明度
    metalness: 0.6,              // 中等金属感
    roughness: 0.25,             // 较光滑
    
    pulseSpeed: 0.0035,          // 较快脉冲速度
    pulseAmount: 0.25,           // 较大脉冲幅度
    floatHeight: 55,             // 较高悬浮高度
    floatSpeed: 0.0025           // 较快悬浮速度
  },
  {
    // 第三个审核流程 - 绿色调
    animationColor: 0x00ff44,    // 绿色
    nodeColor: 0x42f584,         // 浅绿色
    edgeColor: 0x44ffaa,         // 亮绿色边缘
    emissiveColor: 0x00cc66,     // 绿色发光
    
    emissiveIntensity: 0.7,      // 中等发光
    opacity: 0.9,                // 较高不透明度
    metalness: 0.5,              // 中等金属感
    roughness: 0.15,             // 很光滑
    
    pulseSpeed: 0.0025,          // 较慢脉冲速度
    pulseAmount: 0.15,           // 较小脉冲幅度
    floatHeight: 45,             // 较低悬浮高度
    floatSpeed: 0.0018           // 较慢悬浮速度
  },
  {
    // 第四个审核流程 - 深紫色调
    animationColor: 0x8800ff,    // 深紫色
    nodeColor: 0xb042f5,         // 淡紫色
    edgeColor: 0xaa44ff,         // 亮紫色边缘
    emissiveColor: 0x6600cc,     // 紫色发光
    
    emissiveIntensity: 0.85,     // 较强发光
    opacity: 0.8,                // 中等不透明度
    metalness: 0.8,              // 较高金属感
    roughness: 0.1,              // 很光滑
    
    pulseSpeed: 0.004,           // 较快脉冲速度
    pulseAmount: 0.22,           // 中等脉冲幅度
    floatHeight: 52,             // 中等悬浮高度
    floatSpeed: 0.0022           // 中等悬浮速度
  },
  {
    // 第五个审核流程 - 红色调
    animationColor: 0xff0000,    // 红色
    nodeColor: 0xf54242,         // 粉红色
    edgeColor: 0xff4444,         // 亮红色边缘
    emissiveColor: 0xcc0000,     // 红色发光
    
    emissiveIntensity: 1.0,      // 强发光
    opacity: 0.85,               // 较高不透明度
    metalness: 0.9,              // 高金属感
    roughness: 0.05,             // 非常光滑
    
    pulseSpeed: 0.005,           // 快脉冲速度
    pulseAmount: 0.3,            // 大脉冲幅度
    floatHeight: 60,             // 高悬浮高度
    floatSpeed: 0.003            // 快悬浮速度
  }
]

/**
 * 动画序列项
 */
export interface AnimationSequenceItem {
  id: string;                     // 元素ID（节点ID或连接线ID）
  type: 'node' | 'connection';    // 元素类型：节点或连接线
  position: THREE.Vector3;        // 位置
  sequence: number;               // 序列值（顺序）
  flowColorIndex: number;         // 流程颜色索引，用于区分不同的审核流程
  flowColorConfig: FlowColorConfig; // 流程颜色配置
  status?: string;                // 状态
}

/**
 * 计算动画序列
 * @param nodes 工作流节点数据
 * @param nodePositions 节点位置集合
 * @param labelPositions 连接线标签位置集合（包含labelText属性）
 * @returns 动画序列项集合
 */
export function calculateAnimationSequence(
  nodes: WorkflowNode[],
  nodePositions: THREE.Vector3[],
  labelPositions: { position: THREE.Vector3; labelText: string }[]
): AnimationSequenceItem[] {
  // 结果集合
  const sequenceItems: AnimationSequenceItem[] = [];
  
  // 如果没有节点数据，返回空数组
  if (!nodes.length) {
    console.warn('没有工作流节点数据，无法计算动画序列');
    return sequenceItems;
  }
  
  console.log(`开始计算${nodes.length}个工作流节点的动画序列`);
  
  // 构建节点ID到位置的映射
  const nodeIdToPositionMap = new Map<string, THREE.Vector3>();
  for (let i = 0; i < nodes.length; i++) {
    if (i < nodePositions.length) {
      nodeIdToPositionMap.set(nodes[i].id, nodePositions[i]);
    }
  }
  
  // 按节点ID排序（node1, node2, ...）
  const sortedNodes = [...nodes].sort((a, b) => {
    const numA = parseInt(a.id.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.id.replace(/\D/g, '')) || 0;
    return numA - numB;
  });
  
  console.log('排序后的节点顺序:', sortedNodes.map(n => n.id).join(', '));
  
  // 初始序列值和流程颜色索引
  let currentSequence = 1;
  let currentFlowColorIndex = 0;
  
  // 遍历排序后的节点
  for (let i = 0; i < sortedNodes.length; i++) {
    const node = sortedNodes[i];
    const nodePosition = nodeIdToPositionMap.get(node.id);
    
    if (!nodePosition) {
      console.warn(`找不到节点${node.id}的位置信息`);
      continue;
    }
    
    // 获取当前流程颜色配置
    const flowColorConfig = FLOW_COLOR_CONFIGS[currentFlowColorIndex % FLOW_COLOR_CONFIGS.length];
    
    // 添加节点到序列
    sequenceItems.push({
      id: node.id,
      type: 'node',
      position: nodePosition.clone(),
      sequence: currentSequence,
      flowColorIndex: currentFlowColorIndex,
      flowColorConfig: flowColorConfig,
      status: node.status
    });
    
    console.log(`添加节点 ${node.id}, 状态: ${node.status}, 序列值: ${currentSequence}, 流程颜色索引: ${currentFlowColorIndex}`);
    
    // 如果不是最后一个节点且当前节点状态不是end，添加连接线
    if (i < sortedNodes.length - 1 && node.status !== 'end') {
      const nextNode = sortedNodes[i + 1];
      const connectionId = `${node.id}->${nextNode.id}`;
      
      // 增加序列值
      currentSequence++;
      
      // 查找连接线标签位置
      const labelPosition = findLabelBetweenNodes(node.id, nextNode.id, labelPositions);
      
      if (labelPosition) {
        // 添加连接线到序列
        sequenceItems.push({
          id: connectionId,
          type: 'connection',
          position: labelPosition.position.clone(),
          sequence: currentSequence,
          flowColorIndex: currentFlowColorIndex,
          flowColorConfig: flowColorConfig
        });
        
        console.log(`添加连接线 ${connectionId}, 序列值: ${currentSequence}, 流程颜色索引: ${currentFlowColorIndex}`);
      } else {
        console.log(`未找到节点${node.id}到${nextNode.id}之间的连接线标签`);
        
        // 如果找不到标签，但两个节点都有位置，则创建一个虚拟连接线
        if (nodeIdToPositionMap.has(nextNode.id)) {
          const nextPosition = nodeIdToPositionMap.get(nextNode.id)!;
          const midPoint = new THREE.Vector3().addVectors(nodePosition, nextPosition).multiplyScalar(0.5);
          
          sequenceItems.push({
            id: connectionId,
            type: 'connection',
            position: midPoint,
            sequence: currentSequence,
            flowColorIndex: currentFlowColorIndex,
            flowColorConfig: flowColorConfig
          });
          
          console.log(`创建虚拟连接线 ${connectionId}, 序列值: ${currentSequence}, 流程颜色索引: ${currentFlowColorIndex}`);
        }
      }
      
      // 为下一个节点准备序列值
      currentSequence++;
    } else if (node.status === 'end') {
      // 修改：状态为end的节点不添加连接线，但不重置序列值
      // 如果不是最后一个节点，仍然增加序列值，确保完整循环
      if (i < sortedNodes.length - 1) {
        currentSequence++;
        // 当遇到end状态节点时，切换到下一个颜色
        currentFlowColorIndex = (currentFlowColorIndex + 1) % FLOW_COLOR_CONFIGS.length;
        console.log(`节点 ${node.id} 状态为end，切换流程颜色索引到: ${currentFlowColorIndex}`);
      } else {
        // 如果是最后一个节点且状态为end，序列值仍然增加
        currentSequence++;
      }
    } else {
      // 不是end状态但是最后一个节点，序列值仍然增加
      currentSequence++;
    }
  }
  
  console.log(`计算完成，共生成${sequenceItems.length}个动画序列项`);
  return sequenceItems;
}

/**
 * 查找两个节点之间的标签位置
 */
function findLabelBetweenNodes(
  nodeId1: string, 
  nodeId2: string, 
  labelPositions: { position: THREE.Vector3; labelText: string }[]
): { position: THREE.Vector3; labelText: string } | null {
  // 根据标签文本查找
  const labelText = `${nodeId1}->${nodeId2}`;
  const label = labelPositions.find(l => l.labelText === labelText);
  
  if (label) {
    return label;
  }
  
  // 如果找不到精确匹配，则查找包含两个节点ID的标签
  return labelPositions.find(l => 
    l.labelText.includes(nodeId1) && l.labelText.includes(nodeId2)
  ) || null;
}

/**
 * 获取按序列值排序的所有位置
 * @param sequenceItems 动画序列项集合
 * @returns 按序列值排序的位置数组
 */
export function getSortedPositions(sequenceItems: AnimationSequenceItem[]): THREE.Vector3[] {
  // 按序列值排序
  const sortedItems = [...sequenceItems].sort((a, b) => a.sequence - b.sequence);
  
  // 提取位置
  return sortedItems.map(item => item.position);
} 