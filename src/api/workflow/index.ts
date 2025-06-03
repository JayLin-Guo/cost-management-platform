import request from '@/utils/request'
import type { WorkflowNode } from '@/views/ThreeWorkflow1/types'
import type { Reviewer, TimePoint } from '@/views/ThreeWorkflow1/useMockData'

// 获取工作流节点
export const getWorkflowNodes = (projectId: string) => 
  request.get<WorkflowNode[]>('/workflow/nodes', { projectId })

// 获取工作流审核人
export const getWorkflowReviewers = (projectId: string) => 
  request.get<Reviewer[]>('/workflow/reviewers', { projectId })

// 获取工作流时间点
export const getWorkflowTimePoints = (projectId: string) => 
  request.get<TimePoint[]>('/workflow/timePoints', { projectId })

// 获取所有工作流数据
export const getWorkflowData = (projectId: string) => 
   request.get<{
    reviewers: Reviewer[],
    timePoints: TimePoint[],
    workflowNodes: WorkflowNode[]
  }>('/workflow/data', { projectId }, {
    withToken: false
  }) 