/**
 * AI命名助手API
 *
 * 支持多种AI服务提供商：
 * 1. OpenAI (GPT-3.5/GPT-4)
 * 2. Anthropic (Claude)
 * 3. 国内大模型：通义千问、文心一言、讯飞星火等
 */

import request from '@/utils/request'

export interface GenerateNamingRequest {
  description: string
  type: 'variable' | 'function' | 'class' | 'constant' | 'interface'
  language: 'javascript' | 'typescript' | 'vue' | 'react'
  prompt?: string
}

export interface NamingResult {
  name: string
  style: string
  styleLabel: string
  description: string
}

export interface GenerateNamingResponse {
  success: boolean
  result?: NamingResult[]
  content?: string
  error?: string
}

/**
 * 调用AI生成命名建议
 */
export const generateNaming = (data: GenerateNamingRequest) => {
  return request<GenerateNamingResponse>({
    url: '/api/ai/generate-naming',
    method: 'post',
    data,
  })
}

/**
 * ===== 以下是后端实现示例 =====
 *
 * 后端需要实现 /api/ai/generate-naming 接口
 * 可以选择以下任一AI服务提供商：
 */

// ===== 示例1: 使用 OpenAI API =====
/*
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // 如果在国内，可以使用代理或API转发服务
  baseURL: 'https://api.openai.com/v1' // 或使用代理地址
})

export async function generateNamingWithOpenAI(req) {
  const { description, type, language, prompt } = req.body

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // 或 'gpt-4'
      messages: [
        {
          role: 'system',
          content: '你是一个专业的编程命名助手，擅长为各种编程场景生成符合规范的命名建议。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    const content = completion.choices[0].message.content

    return {
      success: true,
      content: content
    }
  } catch (error) {
    console.error('OpenAI API调用失败:', error)
    throw new Error('AI服务暂时不可用')
  }
}
*/

// ===== 示例2: 使用 Anthropic Claude API =====
/*
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function generateNamingWithClaude(req) {
  const { description, type, language, prompt } = req.body

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const content = message.content[0].text

    return {
      success: true,
      content: content
    }
  } catch (error) {
    console.error('Claude API调用失败:', error)
    throw new Error('AI服务暂时不可用')
  }
}
*/

// ===== 示例3: 使用阿里云通义千问 =====
/*
import axios from 'axios'

export async function generateNamingWithQianwen(req) {
  const { description, type, language, prompt } = req.body

  try {
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: 'qwen-turbo',
        input: {
          messages: [
            {
              role: 'system',
              content: '你是一个专业的编程命名助手'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        parameters: {
          result_format: 'message'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const content = response.data.output.choices[0].message.content

    return {
      success: true,
      content: content
    }
  } catch (error) {
    console.error('通义千问API调用失败:', error)
    throw new Error('AI服务暂时不可用')
  }
}
*/

// ===== 示例4: 使用百度文心一言 =====
/*
import axios from 'axios'

// 先获取access_token
async function getAccessToken() {
  const response = await axios.post(
    `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${process.env.WENXIN_API_KEY}&client_secret=${process.env.WENXIN_SECRET_KEY}`
  )
  return response.data.access_token
}

export async function generateNamingWithWenxin(req) {
  const { description, type, language, prompt } = req.body

  try {
    const accessToken = await getAccessToken()

    const response = await axios.post(
      `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?access_token=${accessToken}`,
      {
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }
    )

    const content = response.data.result

    return {
      success: true,
      content: content
    }
  } catch (error) {
    console.error('文心一言API调用失败:', error)
    throw new Error('AI服务暂时不可用')
  }
}
*/

// ===== 完整的后端路由示例 (Node.js + Express) =====
/*
import express from 'express'

const router = express.Router()

// AI命名生成接口
router.post('/api/ai/generate-naming', async (req, res) => {
  try {
    // 选择一个AI服务提供商
    const result = await generateNamingWithOpenAI(req)
    // 或: const result = await generateNamingWithClaude(req)
    // 或: const result = await generateNamingWithQianwen(req)
    // 或: const result = await generateNamingWithWenxin(req)

    res.json(result)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router
*/
