import request from '@/utils/request'

export const getWorkflowNodes = (projectId: string) =>
  request.get('/newWorkflow/getWorkflowNodes', { projectId })

export const getWorkflowTimePoints = async (projectId: string) =>
  request.get('/newWorkflow/getTimePoints', { projectId })

export const getWorkflowReviewers = async (projectId: string) =>
  request.get('/newWorkflow/getReviewers', { projectId })
