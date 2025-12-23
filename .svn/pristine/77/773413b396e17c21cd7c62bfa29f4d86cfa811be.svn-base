<template>
  <div class="review-config-steps">
    <!-- 顶部栏：返回 + 标题 + 操作 -->
    <div class="page-header">
      <div class="header-left">
        <el-button size="small" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <div class="header-divider"></div>
        <div class="header-info">
          <span class="title">关联步骤模板</span>
          <span class="subtitle">{{ configInfo.name }} ({{ configInfo.code }})</span>
        </div>
      </div>
      <div class="header-right">
        <!-- eslint-disable-next-line vue/max-attributes-per-line -->
        <el-button type="primary" size="small" :loading="saveLoading" @click="handleSave">
          <el-icon><Check /></el-icon>
          保存配置
        </el-button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-section">
      <div class="steps-content">
        <div class="steps-layout">
          <!-- 左侧：可用步骤模板 -->
          <div class="available-panel">
            <div class="panel-header">
              <h4>可用步骤模板</h4>
              <span class="count">共 {{ availableTemplates.length }} 个</span>
            </div>
            <div class="template-list">
              <div
                v-for="template in availableTemplates"
                :key="template.id"
                class="template-item"
                :class="{ selected: selectedTemplateIds.includes(template.id) }"
                @click="toggleTemplate(template.id)"
              >
                <el-checkbox
                  :model-value="selectedTemplateIds.includes(template.id)"
                  @click.stop
                  @change="toggleTemplate(template.id)"
                />
                <div class="item-content">
                  <div class="item-main">
                    <span class="item-name">{{ template.name }}</span>
                  </div>
                  <div class="item-extra">
                    <el-tag :type="getStepTypeTagType(template.stepType)" size="small">
                      {{ REVIEW_STEP_TYPE_LABELS[template.stepType] }}
                    </el-tag>
                    <el-tooltip
                      v-if="template.stepRoles && template.stepRoles.length > 0"
                      placement="top"
                      effect="dark"
                    >
                      <template #content>
                        <div style="color: #fff">
                          <div
                            v-for="stepRole in template.stepRoles"
                            :key="stepRole.id"
                            style="padding: 2px 0; font-size: 12px"
                          >
                            {{ stepRole.roleCategory.name }}
                          </div>
                        </div>
                      </template>
                      <el-tag size="small" style="cursor: pointer">
                        {{ template.stepRoles.length }}角色
                      </el-tag>
                    </el-tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：已选择的步骤模板 -->
          <div class="selected-panel">
            <div class="panel-header">
              <h4>已选择的步骤</h4>
              <span class="count">{{ selectedTemplates.length }} 个</span>
            </div>
            <div v-if="selectedTemplates.length > 0" class="selected-list">
              <div
                v-for="(template, index) in selectedTemplates"
                :key="template.id"
                class="selected-item"
              >
                <div class="item-order">{{ index + 1 }}</div>
                <div class="item-info">
                  <div class="item-name">{{ template.name }}</div>
                  <el-tag :type="getStepTypeTagType(template.stepType)" size="small">
                    {{ REVIEW_STEP_TYPE_LABELS[template.stepType] }}
                  </el-tag>
                </div>
                <div class="item-actions">
                  <el-button
                    size="small"
                    :icon="ArrowUp"
                    :disabled="index === 0"
                    @click="moveUp(index)"
                  />
                  <el-button
                    size="small"
                    :icon="ArrowDown"
                    :disabled="index === selectedTemplates.length - 1"
                    @click="moveDown(index)"
                  />
                  <el-button
                    size="small"
                    type="danger"
                    :icon="Close"
                    @click="removeTemplate(template.id)"
                  />
                </div>
              </div>
            </div>
            <el-empty v-else description="点击左侧表格选择步骤模板" :image-size="80" />
          </div>
        </div>
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
import {
  getReviewConfigDetail,
  getReviewStepsConfig,
  configureReviewSteps,
} from '@/api/review-config'

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

// 加载已配置的步骤
const loadStepsConfig = async () => {
  try {
    const configId = route.params.id as string
    const result = await getReviewStepsConfig(configId)
    if (result && result.data && Array.isArray(result.data)) {
      // 按 stepOrder 排序后提取 templateId
      const sortedSteps = result.data.sort(
        (a: { stepOrder: number }, b: { stepOrder: number }) => a.stepOrder - b.stepOrder,
      )
      selectedTemplateIds.value = sortedSteps.map(
        (step: { reviewStepTemplateId: string }) => step.reviewStepTemplateId,
      )
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '加载步骤配置失败'
    ElMessage.error(errorMessage)
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
    const configId = route.params.id as string
    // 构建步骤配置数据
    const steps = selectedTemplateIds.value.map((templateId, index) => ({
      reviewStepTemplateId: templateId,
      stepOrder: index + 1,
      isRequired: true,
    }))
    await configureReviewSteps(configId, { steps })
    ElMessage.success('保存成功！')
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

onMounted(async () => {
  await loadConfigDetail()
  await loadStepTemplates()
  await loadStepsConfig()
})
</script>

<style scoped lang="scss">
.review-config-steps {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  background: var(--body-background);

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: var(--component-background);
    border-bottom: 1px solid var(--border-color-light);
    flex-shrink: 0;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .header-divider {
        width: 1px;
        height: 20px;
        background: var(--border-color-light);
      }

      .header-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-color);
        }

        .subtitle {
          font-size: 13px;
          color: var(--text-color-secondary);
        }
      }
    }
  }

  .content-section {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .steps-content {
      flex: 1;
      padding: 16px;
      overflow: hidden;
    }
  }

  .steps-layout {
    display: flex;
    gap: 16px;
    height: 100%;

    .available-panel,
    .selected-panel {
      flex: 1;
      min-width: 0;
      background: var(--fill-color-lighter);
      border-radius: 8px;
      border: 1px solid var(--border-color-light);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--fill-color);
      border-bottom: 1px solid var(--border-color-light);

      h4 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-color);
      }

      .count {
        font-size: 12px;
        color: var(--text-color-secondary);
      }
    }

    .template-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 8px;
      align-content: start;

      .template-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px 10px;
        background: var(--component-background);
        border-radius: 6px;
        border: 1px solid var(--border-color-light);
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
          border-color: var(--primary-color);
          background: var(--primary-color-light);
        }

        &.selected {
          border-color: var(--primary-color);
          background: rgba(64, 158, 255, 0.12);
        }

        .item-content {
          flex: 1;
          min-width: 0;

          .item-main {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 4px;

            .item-name {
              font-weight: 500;
              font-size: 13px;
              color: var(--text-color);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .item-code {
              font-size: 11px;
              color: var(--text-color-secondary);
              flex-shrink: 0;
            }
          }

          .item-extra {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 4px;
          }
        }
      }
    }

    .selected-panel {
      max-width: 360px;

      .selected-list {
        flex: 1;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        overflow-y: auto;

        .selected-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: var(--component-background);
          border-radius: 6px;
          border: 1px solid var(--border-color-light);

          .item-order {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            background: var(--primary-color);
            color: white;
            border-radius: 50%;
            font-weight: 600;
            font-size: 12px;
            flex-shrink: 0;
          }

          .item-info {
            flex: 1;
            min-width: 0;
            display: flex;
            align-items: center;
            gap: 8px;

            .item-name {
              font-weight: 500;
              font-size: 13px;
              color: var(--text-color);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }

          .item-actions {
            display: flex;
            gap: 4px;
            flex-shrink: 0;
          }
        }
      }

      :deep(.el-empty) {
        padding: 40px 20px;
      }
    }
  }
}
</style>
