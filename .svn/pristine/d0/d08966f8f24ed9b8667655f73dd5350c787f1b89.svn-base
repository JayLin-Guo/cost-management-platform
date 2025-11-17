/**
 * 任务相关的Mock数据
 */

// 任务分类列表
const taskCategories = [
  { id: '1', name: '招标控制价' },
  { id: '2', name: '施工图预算' },
  { id: '3', name: '概算编制' },
  { id: '4', name: '结算审核' },
  { id: '5', name: '竣工决算' }
]

// 参与人员列表
const participants = [
  { id: '1', name: '张三', department: '预算部' },
  { id: '2', name: '李四', department: '工程部' },
  { id: '3', name: '王五', department: '审计部' },
  { id: '4', name: '赵六', department: '设计部' },
  { id: '5', name: '钱七', department: '采购部' }
]

// 任务负责人列表（通常是与参与人员相同，但可能职级较高）
const responsibles = [
  { id: '1', name: '张三', department: '预算部', title: '部门经理' },
  { id: '2', name: '李四', department: '工程部', title: '部门经理' },
  { id: '3', name: '王五', department: '审计部', title: '部门经理' }
]

// 审核级别列表
const reviewLevels = [
  { id: '1', name: '一审' },
  { id: '2', name: '二审' },
  { id: '3', name: '三审' }
]

// 审核人员列表
const reviewers = [
  { id: '1', name: '张智慧', department: '审计部', title: '审计专员' },
  { id: '2', name: '王明', department: '审计部', title: '高级审计师' },
  { id: '3', name: '李欣', department: '财务部', title: '财务总监' },
  { id: '4', name: '刘强', department: '技术部', title: '技术总监' }
]

// 任务列表
let tasks = [
  {
    id: '1',
    name: '某商场改造项目招标控制价编制',
    projectId: '1',
    projectName: '某商场改造项目',
    category: '1',
    participants: '1,2',
    responsible: '1',
    needReview: '2',
    reviewers: [
      { level: '一审', name: '张智慧' },
      { level: '二审', name: '王明' }
    ],
    description: '编制某商场改造项目的招标控制价文件，包括工程量清单和最高投标限价',
    attachments: [],
    status: '进行中',
    createTime: '2023-05-01',
    deadline: '2023-05-15'
  },
  {
    id: '2',
    name: '住宅小区施工图预算',
    projectId: '2',
    projectName: '某住宅小区项目',
    category: '2',
    participants: '2,3',
    responsible: '2',
    needReview: '3',
    reviewers: [
      { level: '一审', name: '张智慧' },
      { level: '二审', name: '王明' },
      { level: '三审', name: '李欣' }
    ],
    description: '编制住宅小区项目施工图预算，包括土建、安装、装饰等分部分项工程',
    attachments: [],
    status: '未开始',
    createTime: '2023-05-05',
    deadline: '2023-06-05'
  }
]

/**
 * 提供给前端的Mock API
 */
module.exports = [
  // 获取任务分类
  {
    url: '/api/task/categories',
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: taskCategories
      }
    }
  },
  
  // 获取参与人员
  {
    url: '/api/task/participants',
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: participants
      }
    }
  },
  
  // 获取任务负责人
  {
    url: '/api/task/responsibles',
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: responsibles
      }
    }
  },
  
  // 获取审核级别
  {
    url: '/api/task/review-levels',
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: reviewLevels
      }
    }
  },
  
  // 获取审核人员
  {
    url: '/api/task/reviewers',
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: reviewers
      }
    }
  },
  
  // 创建任务
  {
    url: '/api/task',
    method: 'post',
    response: (req) => {
      const task = req.body
      task.id = (tasks.length + 1).toString()
      task.createTime = new Date().toISOString().split('T')[0]
      tasks.push(task)
      
      return {
        code: 200,
        data: task,
        message: '任务创建成功'
      }
    }
  },
  
  // 更新任务
  {
    url: '/api/task/:id',
    method: 'put',
    response: (req) => {
      const { id } = req.params
      const updatedTask = req.body
      
      const index = tasks.findIndex(task => task.id === id)
      if (index === -1) {
        return {
          code: 404,
          message: '任务不存在'
        }
      }
      
      tasks[index] = { ...tasks[index], ...updatedTask }
      
      return {
        code: 200,
        data: tasks[index],
        message: '任务更新成功'
      }
    }
  },
  
  // 删除任务
  {
    url: '/api/task/:id',
    method: 'delete',
    response: (req) => {
      const { id } = req.params
      
      const index = tasks.findIndex(task => task.id === id)
      if (index === -1) {
        return {
          code: 404,
          message: '任务不存在'
        }
      }
      
      const deletedTask = tasks[index]
      tasks = tasks.filter(task => task.id !== id)
      
      return {
        code: 200,
        data: deletedTask,
        message: '任务删除成功'
      }
    }
  }
] 