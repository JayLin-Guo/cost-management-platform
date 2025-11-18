<template>
  <div class="task-list-container">
    <!-- 新建项目对话框 -->
    <CreateProjectDialog v-model="createDialogVisible" @success="handleCreateSuccess" />
    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-left">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入关键词：项目名称"
          clearable
          style="width: 400px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleClear">清空</el-button>
      </div>
      <div class="search-right">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建项目
        </el-button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        border
        style="width: 100%"
        :header-cell-style="{
          background: 'var(--component-background-light)',
          color: 'rgba(255, 255, 255, 0.95)',
          fontWeight: '600',
        }"
      >
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column
          prop="projectName"
          label="项目名称"
          min-width="300"
          show-overflow-tooltip
        />
        <el-table-column prop="clientUnit" label="委托单位" min-width="200" show-overflow-tooltip />
        <!-- <el-table-column label="任务情况" width="120" align="center">
          <template #default="{ row }">
            <div class="task-status">
              <el-tooltip content="设计" placement="top">
                <el-icon :class="['status-icon', row.taskStatus.design ? 'active' : '']">
                  <EditPen />
                </el-icon>
              </el-tooltip>
              <el-tooltip content="审核" placement="top">
                <el-icon :class="['status-icon', row.taskStatus.review ? 'active' : '']">
                  <CircleCheck />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column> -->
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEnter(row)">进入</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 15, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Plus, EditPen, CircleCheck } from '@element-plus/icons-vue'
import { getProjectList } from '@/api/project'
import CreateProjectDialog from './components/CreateProjectDialog.vue'

const router = useRouter()

// 搜索关键词
const searchKeyword = ref('')

// 加载状态
const loading = ref(false)

// 表格数据
const tableData = ref()

// 分页信息
const pagination = reactive({
  pageNum: 1,
  pageSize: 15,
  total: 0,
})

// 获取项目列表
const fetchProjectList = async () => {
  loading.value = true
  try {
    const result = await getProjectList({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value,
    })

    tableData.value = result.data.list
    pagination.total = result.data.total
    console.log(result)
  } catch (error: any) {
    ElMessage.error(error.message || '获取项目列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchProjectList()
}

// 清空
const handleClear = () => {
  searchKeyword.value = ''
  pagination.pageNum = 1
  fetchProjectList()
}

// 对话框显示状态
const createDialogVisible = ref(false)

// 新建项目
const handleCreate = () => {
  createDialogVisible.value = true
}

// 创建成功回调
const handleCreateSuccess = () => {
  // 刷新列表
  fetchProjectList()
}

// 进入项目详情/流程页面
const handleEnter = (row: any) => {
  // 跳转到流程页面，并传递项目ID
  router.push({
    path: '/workflow',
    query: {
      projectId: row.id.toString(),
    },
  })
}

// 每页条数改变
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.pageNum = 1
  fetchProjectList()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
  pagination.pageNum = page
  fetchProjectList()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchProjectList()
})
</script>

<style scoped lang="scss">
.task-list-container {
  padding: 24px;
  background: var(--body-background);
  min-height: calc(100vh - 64px);

  .search-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    padding: 20px;
    background: var(--component-background);
    border: 1px solid var(--border-color-light);
    border-radius: 8px;

    .search-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .table-container {
    margin-bottom: 16px;

    .task-status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      .status-icon {
        font-size: 20px;
        color: var(--disabled-color);
        transition: all 0.3s;

        &.active {
          color: var(--success-color);
        }
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    padding: 16px 0;
  }
}
</style>
