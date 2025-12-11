<template>
  <div class="review-config-steps">
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <div class="header-info">
          <h2>配置步骤模板</h2>
          <p>{{ configInfo.name }} ({{ configInfo.code }})</p>
        </div>
      </div>
    </div>

    <div class="content-section">
      <div class="section-header">
        <div class="section-left">
          <h3>关联步骤模板</h3>
          <p>为该审核配置选择相应的步骤模板</p>
        </div>
        <div class="section-right">
          <el-button type="primary" :loading="saveLoading" @click="handleSave">
            <el-icon><Check /></el-icon>
            保存配置
          </el-button>
        </div>
      </div>

      <div class="steps-content">
        <div class="available-templates">
          <h4>可用步骤模板</h4>
          <div class="template-grid">
            <div
              v-for="template in availableTemplates"
              :key="template.id"
              class="template-card"
              :class="{ active: selectedTemplateIds.includes(template.id) }"
              @click="toggleTemplate(template.id)"
            >
              <div class="template-header">
                <div class="template-title">{{ template.name }}</div>
                <div class="template-code">{{ template.code }}</div>
              </div>
              <div class="template-type">
                <el-tag :type="getStepTypeTagType(template.stepType)" size="small">
                  {{ REVIEW_STEP_TYPE_LABELS[template.stepType] }}
                </el-tag>
              </div>
              <div class="template-description">
                {{ template.description || '暂无描述' }}
              </div>
              <div
                v-if="template.stepRoles && template.stepRoles.length > 0"
                class="template-roles"
              >
                <div class="roles-label">绑定角色：</div>
                <div class="role-tags">
                  <el-tag
                    v-for="stepRole in template.stepRoles.slice(0, 2)"
                    :key="stepRole.id"
                    size="small"
                  >
                    {{ stepRole.roleCategory.name }}
                  </el-tag>
                  <el-tag v-if="template.stepRoles.length > 2" size="small" type="info">
                    +{{ template.stepRoles.length - 2 }}
                  </el-tag>
                </div>
              </div>
              <div class="template-checkbox">
                <el-checkbox
                  :model-value="selectedTemplateIds.includes(template.id)"
                  @change="toggleTemplate(template.id)"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedTemplates.length > 0" class="selected-templates">
          <h4>已选择的步骤模板 ({{ selectedTemplates.length }})</h4>
          <div class="selected-list">
            <div
              v-for="(template, index) in selectedTemplates"
              :key="template.id"
              class="selected-item"
            >
              <div class="item-order">{{ index + 1 }}</div>
              <div class="item-info">
                <div class="item-name">{{ template.name }}</div>
                <div class="item-code">{{ template.code }}</div>
              </div>
              <div class="item-type">
                <el-tag :type="getStepTypeTagType(template.stepType)" size="small">
                  {{ REVIEW_STEP_TYPE_LABELS[template.stepType] }}
                </el-tag>
              </div>
              <div class="item-actions">
                <el-button size="small" :disabled="index === 0" @click="moveUp(index)">
                  <el-icon><ArrowUp /></el-icon>
                </el-button>
                <el-button
                  size="small"
                  :disabled="index === selectedTemplates.length - 1"
                  @click="moveDown(index)"
                >
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
                <el-button size="small" type="danger" @click="removeTemplate(template.id)">
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <el-empty v-if="selectedTemplates.length === 0" description="请选择步骤模板" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Check, ArrowUp, ArrowDown, Close } from '@element-plus/icons-vue'
import {
  getReviewStepTemplateList,
  type ReviewStepTemplateEntity,
  type ReviewStepType,
  REVIEW_STEP_TYPE_LABELS,
} from '@/api/review-step-template'
import { getReviewConfigDetail, type ReviewConfigEntity } from '@/api/review-config'

const router = useRouter()
const route = useRoute()

// 审核配置信息
const configInfo = reactive({
  id: '',
  name: '',
  code: '',
})

// 可用步骤模板列表
const availableTemplates = ref<ReviewStepTemplateEntity[]>([])
const loading = ref(false)

// 已选择的模板ID列表
const selectedTemplateIds = ref<string[]>([])

// 保存状态
const saveLoading = ref(false)

// 计算已选择的模板（按选择顺序排列）
const selectedTemplates = computed(() => {
  return selectedTemplateIds.value
    .map((id) => availableTemplates.value.find((t) => t.id === id))
    .filter(Boolean) as ReviewStepTemplateEntity[]
})

// 获取步骤类型标签样式
const getStepTypeTagType = (
  stepType: ReviewStepType,
): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const typeMap: Record<ReviewStepType, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    INITIAL_REVIEW: 'primary',
    SECONDARY_REVIEW: 'success',
    FINAL_REVIEW: 'warning',
    COUNTERSIGN: 'info',
    CC: 'danger',
    CUSTOM: 'primary',
  }
  return typeMap[stepType] || 'primary'
}

// 加载审核配置详情
const loadConfigDetail = async () => {
  try {
    const configId = route.params.id as string
    const result = await getReviewConfigDetail(configId)
    if (result && result.data) {
      Object.assign(configInfo, {
        id: result.data.id,
        name: result.data.name,
        code: result.data.code,
      })
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '加载审核配置详情失败'
    ElMessage.error(errorMessage)
  }
}

// 加载步骤模板列表
const loadStepTemplates = async () => {
  loading.value = true
  try {
    const result = await getReviewStepTemplateList()
    if (result && result.data) {
      // 处理分页或非分页数据
      if (result.data.list) {
        availableTemplates.value = result.data.list
      } else {
        availableTemplates.value = Array.isArray(result.data) ? result.data : []
      }
    } else {
      availableTemplates.value = []
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '加载步骤模板列表失败'
    ElMessage.error(errorMessage)
  } finally {
    loading.value = false
  }
}

// 切换模板选择状态
const toggleTemplate = (templateId: string) => {
  const index = selectedTemplateIds.value.indexOf(templateId)
  if (index > -1) {
    selectedTemplateIds.value.splice(index, 1)
  } else {
    selectedTemplateIds.value.push(templateId)
  }
}

// 移除模板
const removeTemplate = (templateId: string) => {
  const index = selectedTemplateIds.value.indexOf(templateId)
  if (index > -1) {
    selectedTemplateIds.value.splice(index, 1)
  }
}

// 上移模板
const moveUp = (index: number) => {
  if (index > 0) {
    const temp = selectedTemplateIds.value[index]
    selectedTemplateIds.value[index] = selectedTemplateIds.value[index - 1]
    selectedTemplateIds.value[index - 1] = temp
  }
}

// 下移模板
const moveDown = (index: number) => {
  if (index < selectedTemplateIds.value.length - 1) {
    const temp = selectedTemplateIds.value[index]
    selectedTemplateIds.value[index] = selectedTemplateIds.value[index + 1]
    selectedTemplateIds.value[index + 1] = temp
  }
}

// 保存配置
const handleSave = async () => {
  saveLoading.value = true
  try {
    // TODO: 调用API保存步骤模板配置
    // 这里需要后端提供相应的API接口
    ElMessage.success('保存成功！')

    // 可以选择是否返回上一页
    // goBack()
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '保存失败'
    ElMessage.error(errorMessage)
  } finally {
    saveLoading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.push('/settings/review-config-management')
}

onMounted(() => {
  loadConfigDetail()
  loadStepTemplates()
})
</script>

<style scoped lang="scss">
.review-config-steps {
  padding: 24px;
  background: var(--body-background);
  min-height: calc(100vh - 64px);

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    padding: 20px;
    background: var(--component-background);
    border-radius: 8px;
    box-shadow: var(--shadow-1);

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .header-info {
        h2 {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 600;
          color: var(--text-color);
        }

        p {
          margin: 0;
          font-size: 14px;
          color: var(--text-color-secondary);
        }
      }
    }
  }

  .content-section {
    background: var(--component-background);
    border-radius: 8px;
    box-shadow: var(--shadow-1);
    overflow: hidden;

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px;
      border-bottom: 1px solid var(--border-color-light);

      .section-left {
        h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-color);
        }

        p {
          margin: 0;
          font-size: 14px;
          color: var(--text-color-secondary);
        }
      }
    }

    .steps-content {
      padding: 20px;

      h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--text-color);
      }
    }
  }

  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    margin-bottom: 32px;

    .template-card {
      position: relative;
      padding: 16px;
      border: 2px solid var(--border-color-light);
      border-radius: 8px;
      background: var(--fill-color-lighter);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
      }

      &.active {
        border-color: var(--primary-color);
        background: var(--primary-color-light);
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
      }

      .template-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;

        .template-title {
          font-weight: 600;
          font-size: 16px;
          color: var(--text-color);
        }

        .template-code {
          font-size: 12px;
          color: var(--text-color-secondary);
          background: var(--fill-color);
          padding: 2px 6px;
          border-radius: 4px;
        }
      }

      .template-type {
        margin-bottom: 8px;
      }

      .template-description {
        font-size: 14px;
        color: var(--text-color-secondary);
        margin-bottom: 12px;
        line-height: 1.4;
      }

      .template-roles {
        .roles-label {
          font-size: 12px;
          color: var(--text-color-secondary);
          margin-bottom: 4px;
        }

        .role-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
      }

      .template-checkbox {
        position: absolute;
        top: 12px;
        right: 12px;
      }
    }
  }

  .selected-templates {
    margin-top: 32px;
    padding-top: 32px;
    border-top: 1px solid var(--border-color-light);

    .selected-list {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .selected-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 16px;
        background: var(--fill-color-lighter);
        border-radius: 8px;
        border: 1px solid var(--border-color-light);

        .item-order {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: var(--primary-color);
          color: white;
          border-radius: 50%;
          font-weight: 600;
          font-size: 14px;
        }

        .item-info {
          flex: 1;

          .item-name {
            font-weight: 600;
            color: var(--text-color);
            margin-bottom: 2px;
          }

          .item-code {
            font-size: 12px;
            color: var(--text-color-secondary);
          }
        }

        .item-type {
          margin-right: 16px;
        }

        .item-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }
}
</style>
