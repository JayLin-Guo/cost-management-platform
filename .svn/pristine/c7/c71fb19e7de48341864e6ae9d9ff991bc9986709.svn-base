import { defineStore } from 'pinia'
import { ref } from 'vue'

interface UserInfo {
  id?: number
  username?: string
  nickname?: string
  avatar?: string
}

interface LoginParams {
  username: string
  password: string
}

// 使用组合式API方式创建store
export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    const userInfo = ref<UserInfo>({})

    // 模拟登录
    const login = async (params: LoginParams) => {
      // 实际项目中这里应该调用API
      return new Promise<void>((resolve, reject) => {
        if (params.username === 'admin' && params.password === '123456') {
          token.value = 'mock_token_' + Math.random().toString(36).substring(2)
          userInfo.value = {
            id: 1,
            username: params.username,
            nickname: 'Admin',
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          }
          resolve()
        } else if (params.username === 'user' && params.password === '123456') {
          token.value = 'mock_token_' + Math.random().toString(36).substring(2)
          userInfo.value = {
            id: 2,
            username: params.username,
            nickname: '普通用户',
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          }
          resolve()
        } else if (params.username === 'manager' && params.password === '123456') {
          token.value = 'mock_token_' + Math.random().toString(36).substring(2)
          userInfo.value = {
            id: 3,
            username: params.username,
            nickname: '项目经理',
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          }
          resolve()
        } else {
          reject(new Error('用户名或密码错误'))
        }
      })
    }

    // 获取用户信息
    const getUserInfo = async () => {
      // 实际项目中这里应该调用API
      return new Promise<void>((resolve) => {
        resolve()
      })
    }

    // 退出登录
    const logout = () => {
      token.value = ''
      userInfo.value = {}
    }

    return {
      token,
      userInfo,
      login,
      getUserInfo,
      logout,
    }
  },
  {
    persist: true,
  },
)
