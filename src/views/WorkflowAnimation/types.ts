// 审核人接口
export interface Reviewer {
  id: string;
  name: string;
  [key: string]: any;
}

// 时间点接口
export interface TimePoint {
  id: string;
  name?: string;
  date?: string;
  [key: string]: any;
}

// 连接接口
export interface Connection {
  id?: string;
  toNodeId: string;
  style?: {
    type?: string;
    color?: string;
    width?: number;
  };
  [key: string]: any;
}

// 工作流节点接口
export interface WorkflowNode {
  id: string;
  title: string;
  status: string;
  stateInfo?: string;
  reviewerId: string;
  timePointId: string;
  connections?: Connection[];
  [key: string]: any;
}

// 处理后的连接线接口
export interface ProcessedConnection {
  id: string;
  path: string;
  color: string;
  width: number;
  dashArray: string;
  startPosition?: { x: number, y: number };
  endPosition?: { x: number, y: number };
}

// 位置接口
export interface Position {
  x: number;
  y: number;
} 