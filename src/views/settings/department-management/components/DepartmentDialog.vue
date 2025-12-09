<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑部门' : '添加部门'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="left"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="部门名称" prop="name">
            <el-input
              v-model="formData.name"
              placeholder="请输入部门名称"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门编码" prop="code">
            <el-input
              v-model="formData.code"
              placeholder="请输入部门编码"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="上级部门" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          :data="parentDepartmentOptions"
          :props="treeSelectProps"
          placeholder="请选择上级部门（不选择则为顶级部门）"
          clearable
          check-strictly
          :render-after-expand="false"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number
          v-model="formData.sort"
          :min="0"
          :max="9999"
          placeholder="排序值"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="状态" prop="isActive">
        <el-radio-group v-model="formData.isActive">
          <el-radio :label="true">启用</el-radio>
          <el-radio :label="false">禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="描述">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入部门描述（可选）"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import { departmentApi } from '@/api/department'
import type { Department, CreateDepartmentDto, UpdateDepartmentDto } from '@/types/department'

interface Props {
  modelValue: boolean
  department?: Department | null
  parentDepartment?: Department | null
  departmentTree: Department[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  department: null,
  parentDepartment: null,
})

const emit = defineEmits<Emits>()

// 响应式数据
const formRef = ref<InstanceType<typeof ElForm>>()
const loading = ref(false)

const formData = ref({
  name: '',
  code: '',
  parentId: null as string | null,
  sort: 0,
  isActive: true,
  description: '',
})

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEdit = computed(() => !!props.department)

// 树形选择器配置
const treeSelectProps = {
  children: 'children',
  label: 'name',
  value: 'id',
  disabled: 'disabled',
}

// 上级部门选项（排除自己和子部门）
const parentDepartmentOptions = computed(() => {
  if (!props.departmentTree.length) return []

  const filterTree = (nodes: Department[]): Department[] => {
    return nodes
      .filter((node) => {
        // 编辑时排除自己
        if (isEdit.value && node.id === props.department?.id) {
          return false
        }
        return true
      })
      .map((node) => ({
        ...node,
        children: node.children ? filterTree(node.children) : [],
        // 编辑时禁用自己的子部门
        disabled: isEdit.value && isDescendant(node, props.department!),
      }))
  }

  return filterTree(props.departmentTree)
})

// 判断是否为子部门
const isDescendant = (node: Department, ancestor: Department): boolean => {
  if (!ancestor.children) return false

  for (const child of ancestor.children) {
    if (child.id === node.id) return true
    if (isDescendant(node, child)) return true
  }
  return false
}

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 2, max: 50, message: '部门名称长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入部门编码', trigger: 'blur' },
    { min: 2, max: 50, message: '部门编码长度在 2 到 50 个字符', trigger: 'blur' },
    {
      pattern: /^[A-Za-z0-9_-]+$/,
      message: '部门编码只能包含字母、数字、下划线和横线',
      trigger: 'blur',
    },
  ],
}

// 监听对话框打开
watch(visible, (newVal) => {
  if (newVal) {
    initFormData()
  }
})

// 初始化表单数据
const initFormData = () => {
  if (props.department) {
    // 编辑模式
    formData.value = {
      name: props.department.name,
      code: props.department.code,
      parentId: props.department.parentId,
      sort: props.department.sort || 0,
      isActive: props.department.isActive,
      description: props.department.description || '',
    }
  } else {
    // 新增模式
    formData.value = {
      name: '',
      code: '',
      parentId: props.parentDepartment?.id || null,
      sort: 0,
      isActive: true,
      description: '',
    }
  }

  // 清除验证状态
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    if (isEdit.value) {
      // 更新部门
      const updateData: UpdateDepartmentDto = {
        name: formData.value.name,
        code: formData.value.code,
        parentId: formData.value.parentId,
        sort: formData.value.sort,
        isActive: formData.value.isActive,
        description: formData.value.description,
      }
      await departmentApi.updateDepartment(props.department!.id, updateData)
      ElMessage.success('部门更新成功')
    } else {
      // 创建部门
      const createData: CreateDepartmentDto = {
        name: formData.value.name,
        code: formData.value.code,
        parentId: formData.value.parentId,
        sort: formData.value.sort,
        isActive: formData.value.isActive,
        description: formData.value.description,
      }
      await departmentApi.createDepartment(createData)
      ElMessage.success('部门创建成功')
    }

    emit('success')
    handleClose()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    loading.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
}
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--text-color);
}

:deep(.el-input__wrapper) {
  border-radius: 6px;
}

:deep(.el-textarea__inner) {
  border-radius: 6px;
}

:deep(.el-tree-select) {
  .el-select__wrapper {
    border-radius: 6px;
  }
}

:deep(.el-input-number) {
  .el-input__wrapper {
    border-radius: 6px;
  }
}
</style>
