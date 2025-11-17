import { post, get } from '../utils/request'

// API基础路径
const baseUrl = '/user'

// 接口类型定义
interface LoginParams {
  username: string
  password: string
}

interface LoginResult {
  token: string
  userInfo: {
    id: number
    username: string
    nickname: string
    role: string
    permissions: string[]
    avatar?: string
  }
}

interface UserInfo {
  id: number
  username: string
  nickname: string
  role: string
  permissions: string[]
  avatar?: string
  email?: string
  phone?: string
  createTime?: string
  updateTime?: string
}

// API方法

/**
 * 用户登录
 * @param params 登录参数
 */
export function login(params: LoginParams) {
  return post<LoginResult>(`${baseUrl}/login`, params, {
    showLoading: true,
    showErrorMsg: true,
  })
}

/**
 * 用户登出
 */
export function logout() {
  return post(
    `${baseUrl}/logout`,
    {},
    {
      showLoading: true,
    },
  )
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return get<UserInfo>(`${baseUrl}/info`)
}

/**
 * 刷新Token
 */
export function refreshToken() {
  return post<{ token: string }>(`${baseUrl}/refresh-token`)
}

/**
 * 修改密码
 */
export function changePassword(params: { oldPassword: string; newPassword: string }) {
  return post(`${baseUrl}/change-password`, params, {
    showLoading: true,
    showSuccessMsg: true,
    successMsg: '密码修改成功！',
  })
}

/**
 * 修改用户信息
 */
export function updateUserInfo(params: Partial<UserInfo>) {
  return post(`${baseUrl}/update-info`, params, {
    showLoading: true,
    showSuccessMsg: true,
    successMsg: '用户信息更新成功！',
  })
}

/**
 * 上传头像
 */
export function uploadAvatar(file: File) {
  return post<{ avatarUrl: string }>(
    `${baseUrl}/upload-avatar`,
    { file },
    {
      showLoading: true,
      showSuccessMsg: true,
      successMsg: '头像上传成功！',
    },
  )
}
