<template>
  <div class="user-management">
    <div class="search-section">
      <div class="search-left">
        <el-input
          v-model="searchForm.keyword"
          placeholder="输入用户名或邮箱搜索"
          clearable
          style="width: 300px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="searchForm.status"
          placeholder="用户状态"
          clearable
          style="width: 150px"
        >
          <el-option label="全部" value="" />
          <el-option label="启用" value="true" />
          <el-option label="禁用" value="false" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      <div class="search-right">
        <el-button type="primary" @click="handleAddUser">
          <el-icon><Plus /></el-icon>
          新增用户
        </el-button>
      </div>
    </div>

    <div class="table-section">
      <el-table :data="userList" v-loading="loading" stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="phone" label="电话" min-width="120" />
        <el-table-column prop="department" label="部门" min-width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)"> 编辑 </el-button>
            <el-button
              :type="row.isActive ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.isActive ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="600px"
      @close="handleDialogClose"
    >
      <div class="dialog-content">
        <el-form ref="userFormRef" :model="userForm" :rules="userFormRules" label-width="80px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="userForm.username" placeholder="请输入用户名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="userForm.name" placeholder="请输入姓名" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="userForm.email" placeholder="请输入邮箱" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="电话" prop="phone">
                <el-input v-model="userForm.phone" placeholder="请输入电话" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="角色" prop="role">
                <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%">
                  <el-option label="管理员" value="ADMIN" />
                  <el-option label="经理" value="MANAGER" />
                  <el-option label="员工" value="STAFF" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="部门" prop="department">
                <el-input v-model="userForm.department" placeholder="请输入部门" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" v-if="!isEdit">
            <el-col :span="12">
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="userForm.password"
                  type="password"
                  placeholder="请输入密码"
                  show-password
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="userForm.confirmPassword"
                  type="password"
                  placeholder="请确认密码"
                  show-password
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="状态" prop="isActive">
            <el-switch v-model="userForm.isActive" active-text="启用" inactive-text="禁用" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { getUserList, createUser, updateUser, deleteUser } from '@/api/user'

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
})

// 分页信息
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0,
})

// 用户列表
const userList = ref<any[]>([])
const loading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const userFormRef = ref<FormInstance>()

// 用户表单
const userForm = reactive({
  id: '',
  username: '',
  name: '',
  email: '',
  phone: '',
  role: 'STAFF',
  department: '',
  password: '',
  confirmPassword: '',
  isActive: true,
})

// 表单验证规则
const userFormRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { max: 50, message: '姓名长度不能超过 50 个字符', trigger: 'blur' },
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
    { max: 100, message: '邮箱长度不能超过 100 个字符', trigger: 'blur' },
  ],
  phone: [{ max: 20, message: '电话长度不能超过 20 个字符', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  department: [{ max: 100, message: '部门长度不能超过 100 个字符', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 255, message: '密码长度在 6 到 255 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== userForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

// 获取角色标签类型
const getRoleTagType = (role: string): 'success' | 'warning' | 'info' | 'primary' | 'danger' => {
  const typeMap: Record<string, 'success' | 'warning' | 'info' | 'primary' | 'danger'> = {
    ADMIN: 'danger',
    MANAGER: 'warning',
    STAFF: 'info',
  }
  return typeMap[role] || 'info'
}

// 获取角色标签文本
const getRoleLabel = (role: string) => {
  const labelMap: Record<string, string> = {
    ADMIN: '管理员',
    MANAGER: '经理',
    STAFF: '员工',
  }
  return labelMap[role] || '未知'
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 加载用户列表
const loadUserList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.size,
      keyword: searchForm.keyword,
      status: searchForm.status,
    }

    const result = await getUserList(params)

    if (result && result.data) {
      userList.value = result.data.list || result.data
      pagination.total = result.data.total || result.data.length || 0
    } else {
      userList.value = []
      pagination.total = 0
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载用户列表失败')
    userList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadUserList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  handleSearch()
}

// 重置表单
const resetForm = () => {
  Object.assign(userForm, {
    id: '',
    username: '',
    name: '',
    email: '',
    phone: '',
    role: 'STAFF',
    department: '',
    password: '',
    confirmPassword: '',
    isActive: true,
  })
}

// 新增用户
const handleAddUser = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(userForm, {
    id: row.id,
    username: row.username,
    name: row.name,
    email: row.email || '',
    phone: row.phone || '',
    role: row.role,
    department: row.department || '',
    password: '',
    confirmPassword: '',
    isActive: row.isActive,
  })
  dialogVisible.value = true
}

// 对话框关闭
const handleDialogClose = () => {
  userFormRef.value?.resetFields()
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  if (!userFormRef.value) return

  await userFormRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      const formData: any = { ...userForm }
      delete formData.confirmPassword

      if (isEdit.value) {
        // 编辑模式，如果没有输入密码则不更新密码
        if (!formData.password) {
          delete formData.password
        }
        await updateUser(formData.id, formData)
        ElMessage.success('更新成功')
      } else {
        // 新增模式
        await createUser(formData)
        ElMessage.success('创建成功')
      }

      dialogVisible.value = false
      loadUserList()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 切换用户状态
const handleToggleStatus = async (row: any) => {
  const action = row.isActive ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}用户 ${row.username} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await updateUser(row.id, { isActive: !row.isActive })
    row.isActive = !row.isActive
    ElMessage.success(`${action}成功`)
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || `${action}失败`)
    }
  }
}

// 删除用户
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户 ${row.username} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await deleteUser(row.id)
    ElMessage.success('删除成功')
    loadUserList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.size = size
  loadUserList()
}

// 当前页改变
const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadUserList()
}

onMounted(() => {
  loadUserList()
})
</script>

<style scoped lang="scss">
.user-management {
  padding: 24px;
  background: var(--body-background);

  .search-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    padding: 20px;
    background: var(--component-background);
    border-radius: 8px;
    box-shadow: var(--shadow-1);

    .search-left {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .search-right {
      display: flex;
      gap: 12px;
    }
  }

  .table-section {
    background: var(--component-background);
    border-radius: 8px;
    box-shadow: var(--shadow-1);
    overflow: hidden;

    .el-table {
      border-radius: 8px 8px 0 0;
    }

    .pagination {
      padding: 20px;
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid var(--border-color-light);
    }
  }

  // 对话框样式
  :deep(.el-dialog__body) {
    padding: 0;
  }

  .dialog-content {
    padding: 20px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
