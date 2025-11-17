import { ref } from 'vue'

export interface Reviewer {
  id: string
  name: string
  role: string
  avatar?: string
}

export interface NodeData {
  id: string
  reviewerId: string
  time: string
  type: string
  status: string
  remark?: string
  children?: NodeData[]
}

export function useMockData() {
  // 审核人列表 - 控制价业务相关角色
  const reviewers = ref<Reviewer[]>([
    { id: 'user1', name: '张三', role: '造价工程师' },
    { id: 'user2', name: '李四', role: '一审审核员' },
    { id: 'user3', name: '王五', role: '二审审核员' },
    { id: 'user4', name: '赵六', role: '三审审核员' },
  ])

  // 时间轴（日期）- 控制价项目审核流程时间节点
  const timeline = ref<string[]>([
    '2023-06-01',
    '2023-06-05',
    '2023-06-10',
    '2023-06-15',
    '2023-06-20',
    '2023-06-25',
    '2023-06-30',
    '2023-07-05',
    '2023-07-10',
  ])

  // 审核节点树 - 控制价业务流程
  const nodeTree = ref<NodeData>({
    id: 'root',
    reviewerId: 'user1',
    time: '2023-06-01',
    type: '初步成果文件',
    status: '提交一审',
    children: [
      {
        id: 'node1',
        reviewerId: 'user2',
        time: '2023-06-05',
        type: '一审送审文件',
        status: '提交二审',
        children: [
          {
            id: 'node3',
            reviewerId: 'user3',
            time: '2023-06-10',
            type: '二审结果文件',
            status: '提交三审',
            children: [
              {
                id: 'node5',
                reviewerId: 'user4',
                time: '2023-06-15',
                type: '三审送审文件',
                status: '审核通过',
                children: [
                  {
                    id: 'node6',
                    reviewerId: 'user1',
                    time: '2023-06-20',
                    type: '最终文件',
                    status: '审核完成',
                  },
                ],
              },
            ],
          },
        ],
      },
      // 驳回流程示例 - 二审驳回后重新开始
      {
        id: 'node2',
        reviewerId: 'user1',
        time: '2023-06-25',
        type: '初步成果文件(修订)',
        status: '提交一审',
        children: [
          {
            id: 'node4',
            reviewerId: 'user2',
            time: '2023-06-30',
            type: '一审送审文件(修订)',
            status: '已驳回',
            children: [
              {
                id: 'node7',
                reviewerId: 'user1',
                time: '2023-07-05',
                type: '初步成果文件(再修订)',
                status: '提交一审',
                children: [
                  {
                    id: 'node8',
                    reviewerId: 'user2',
                    time: '2023-07-10',
                    type: '一审送审文件(再修订)',
                    status: '审核中',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  })

  // 带状态信息的日历数据 - 匹配上面的节点结构
  const dateOptions = ref([
    {
      title: '张三',
      timeLine: [
        { time: '2023-06-01', status: '提交一审', tag: '1', tagColor: '#00aaff' },
        { time: '2023-06-20', status: '审核完成', tag: '20', tagColor: '#00cc66' },
        { time: '2023-06-25', status: '提交一审', tag: '25', tagColor: '#00aaff' },
        { time: '2023-07-05', status: '提交一审', tag: '35', tagColor: '#00aaff' },
      ],
    },
    {
      title: '李四',
      timeLine: [
        { time: '2023-06-05', status: '提交二审', tag: '5', tagColor: '#ffaa00' },
        { time: '2023-06-30', status: '已驳回', tag: '30', tagColor: '#ff3366' },
        { time: '2023-07-10', status: '审核中', tag: '40', tagColor: '#888888' },
      ],
    },
    {
      title: '王五',
      timeLine: [{ time: '2023-06-10', status: '提交三审', tag: '10', tagColor: '#ffcc00' }],
    },
    {
      title: '赵六',
      timeLine: [{ time: '2023-06-15', status: '审核通过', tag: '15', tagColor: '#00ff66' }],
    },
  ])

  return {
    reviewers,
    timeline,
    nodeTree,
    dateOptions,
  }
}
