// 三维时间线/流程图 mock 数据结构和示例数据

export interface Reviewer {
  id: string
  name: string
}

export type Timeline = string[]

export interface FileNode {
  id: string
  reviewerId: string
  time: string
  type: string
  status: string
  remark?: string
}

export interface FileEdge {
  from: string
  to: string
  type: string
}

// 树形结构节点
export interface FileNodeTree extends FileNode {
  children?: FileNodeTree[]
}

// 审核人员
export const reviewers: Reviewer[] = [
  { id: '1', name: '张三' },
  { id: '2', name: '李四' },
  { id: '3', name: '王五' },
  { id: '4', name: '赵六' },
]

// 时间轴
export const timeline: Timeline = [
  '2024-06-01',
  '2024-06-02',
  '2024-06-03',
  '2024-06-04',
  '2024-06-05',
  '2024-06-06',
  '2024-06-07',
  '2024-06-08',
  '2024-06-09',
]

// 树形结构节点示例
export const nodeTree: FileNodeTree = {
  id: 'n1',
  reviewerId: '1',
  time: '2024-06-01',
  type: '初步成果',
  status: '未上传',
  children: [
    {
      id: 'n2',
      reviewerId: '2',
      time: '2024-06-02',
      type: '一审',
      status: '已提交',
      children: [
        {
          id: 'n3',
          reviewerId: '2',
          time: '2024-06-03',
          type: '二审',
          status: '已提交',
          children: [
            {
              id: 'n4',
              reviewerId: '3',
              time: '2024-06-04',
              type: '三审',
              status: '已提交',
              children: [
                {
                  id: 'n5',
                  reviewerId: '4',
                  time: '2024-06-05',
                  type: '最终文件',
                  status: '已提交',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

// 连线
export const edges: FileEdge[] = [
  { from: 'n1', to: 'n2', type: '正常流转' },
  { from: 'n2', to: 'n3', type: '正常流转' },
  { from: 'n3', to: 'n4', type: '正常流转' },
  { from: 'n4', to: 'n5', type: '正常流转' },
]

export const mockDateOptions = [
  {
    title: '导入成果文件',
    timeLine: [
      {
        time: '2024-06-01',
        status: '未上传',
        remark: '未上传',
      },
      {
        time: '2024-06-02',
        status: '未上传',
        remark: '未上传',
      },
      {
        time: '2024-06-03',
        status: '导入',
        remark: '导入',
        tag: '假期',
        tagColor: '#ff9900',
      },
      {
        time: '2024-06-04',
        status: '未上传',
        remark: '未上传',
      },
      {
        time: '2024-06-05',
        status: '已提交',
        remark: '已提交',
        tag: '重要',
        tagColor: '#1adfff',
      },
      {
        time: '2024-06-06',
        status: '已提交',
        remark: '已提交',
      },
      {
        time: '2024-06-07',
        status: '未上传',
        remark: '未上传',
      },
      {
        time: '2024-06-08',
        status: '已提交',
        remark: '已提交',
      },
      {
        time: '2024-06-09',
        status: '已提交',
        remark: '已提交',
      },
    ],
  },
]
