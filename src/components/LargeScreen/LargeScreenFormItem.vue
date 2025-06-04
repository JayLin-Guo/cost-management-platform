<template>
  <div class="large-screen-form-item" :class="{ 'is-required': required, 'is-disabled': disabled }">
    <div class="form-item-bg"></div>
    <div class="form-item-content">
      <!-- 标签 -->
      <div v-if="label" class="form-item-label" :style="labelStyle">
        <span class="label-text">{{ label }}</span>
        <span v-if="required" class="required-mark">*</span>
      </div>

      <!-- 控件容器 -->
      <div class="form-item-control">
        <!-- 输入框 -->
        <div v-if="type === 'input'" class="control-wrapper">
          <div class="input-bg"></div>
          <input
            v-model="inputValue"
            :type="inputType"
            :placeholder="placeholder"
            :disabled="disabled"
            :readonly="readonly"
            class="large-screen-input"
            @focus="handleFocus"
            @blur="handleBlur"
            @input="handleInput"
          />
          <div class="input-border"></div>
        </div>

        <!-- 选择器 -->
        <div v-else-if="type === 'select'" class="control-wrapper">
          <div class="select-bg"></div>
          <div ref="selectRef" class="large-screen-select" @click="toggleDropdown">
            <span class="select-value">{{ selectedLabel || placeholder }}</span>
            <svg class="select-arrow" :class="{ rotated: dropdownVisible }" viewBox="0 0 24 24">
              <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
            </svg>
          </div>
          <div class="select-border"></div>

          <!-- 下拉选项 -->
          <teleport to="body">
            <transition name="dropdown">
              <div v-if="dropdownVisible" class="select-dropdown" :style="dropdownStyle">
                <div class="dropdown-bg"></div>
                <div class="dropdown-content">
                  <div
                    v-for="option in options"
                    :key="option.value"
                    class="select-option"
                    :class="{ selected: option.value === inputValue }"
                    @click="selectOption(option)"
                  >
                    <span>{{ option.label }}</span>
                    <svg
                      v-if="option.value === inputValue"
                      class="option-check"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                    </svg>
                  </div>
                </div>
              </div>
            </transition>
          </teleport>
        </div>

        <!-- 文本域 -->
        <div v-else-if="type === 'textarea'" class="control-wrapper">
          <div class="textarea-bg"></div>
          <textarea
            v-model="inputValue"
            :placeholder="placeholder"
            :disabled="disabled"
            :readonly="readonly"
            :rows="rows"
            class="large-screen-textarea"
            @focus="handleFocus"
            @blur="handleBlur"
            @input="handleInput"
          ></textarea>
          <div class="textarea-border"></div>
        </div>

        <!-- 按钮 -->
        <div v-else-if="type === 'button'" class="control-wrapper">
          <button
            class="large-screen-button"
            :class="buttonType"
            :disabled="disabled"
            @click="handleButtonClick"
          >
            <div class="button-bg"></div>
            <span class="button-text">{{ buttonText || label }}</span>
            <div class="button-glow"></div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, onUnmounted } from 'vue'

interface Option {
  label: string
  value: string | number
}

interface Props {
  type?: 'input' | 'select' | 'textarea' | 'button'
  label?: string
  modelValue?: any
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  options?: Option[]
  inputType?: string
  rows?: number
  buttonType?: 'primary' | 'secondary' | 'danger'
  buttonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'input',
  inputType: 'text',
  rows: 3,
  buttonType: 'primary',
  options: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  input: [event: Event]
  click: [event: MouseEvent]
}>()

// 注入表单配置
const formConfig = inject('formConfig', {
  labelWidth: '120px',
  labelPosition: 'left',
  disabled: false,
})

// 响应式数据
const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const dropdownVisible = ref(false)
const isFocused = ref(false)
const dropdownStyle = ref({})
const selectRef = ref<HTMLElement | null>(null)

// 计算标签样式
const labelStyle = computed(() => ({
  width: formConfig.labelWidth,
  textAlign: (formConfig.labelPosition === 'right' ? 'right' : 'left') as
    | 'left'
    | 'right'
    | 'center',
}))

// 计算选中的标签
const selectedLabel = computed(() => {
  if (props.type === 'select' && props.options.length > 0) {
    const selected = props.options.find((option) => option.value === inputValue.value)
    return selected?.label || ''
  }
  return ''
})

// 计算下拉框位置
const calculateDropdownPosition = () => {
  if (selectRef.value) {
    const rect = selectRef.value.getBoundingClientRect()
    dropdownStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      zIndex: 99999,
    }
  }
}

// 事件处理
const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const handleInput = (event: Event) => {
  emit('input', event)
}

const handleButtonClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}

// 选择器相关
const toggleDropdown = () => {
  if (!props.disabled) {
    if (!dropdownVisible.value) {
      calculateDropdownPosition()
    }
    dropdownVisible.value = !dropdownVisible.value
  }
}

const selectOption = (option: Option) => {
  inputValue.value = option.value
  dropdownVisible.value = false
}

// 点击外部关闭下拉框
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.large-screen-select')) {
    dropdownVisible.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.large-screen-form-item {
  position: relative;
  margin-bottom: 24px;
}

.form-item-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 255, 255, 0.02) 0%,
    rgba(0, 255, 255, 0.05) 50%,
    rgba(0, 255, 255, 0.02) 100%
  );
  border-radius: 6px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.large-screen-form-item:hover .form-item-bg {
  opacity: 1;
}

.form-item-content {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  z-index: 1;
}

/* 标签样式 */
.form-item-label {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-top: 12px;
  flex-shrink: 0;
}

.label-text {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
  font-family: 'Microsoft YaHei', sans-serif;
}

.required-mark {
  color: #ff3366;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(255, 51, 102, 0.5);
}

/* 控件容器 */
.form-item-control {
  flex: 1;
  position: relative;
}

.control-wrapper {
  position: relative;
  width: 100%;
}

/* 输入框样式 */
.input-bg,
.textarea-bg,
.select-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(26, 31, 58, 0.8) 0%,
    rgba(16, 20, 45, 0.8) 50%,
    rgba(26, 31, 58, 0.8) 100%
  );
  border-radius: 6px;
  backdrop-filter: blur(10px);
}

.large-screen-input,
.large-screen-textarea {
  position: relative;
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 14px;
  font-family: 'Microsoft YaHei', sans-serif;
  z-index: 2;
  border-radius: 6px;
}

.large-screen-input::placeholder,
.large-screen-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.input-border,
.textarea-border,
.select-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
  transition: all 0.3s ease;
  pointer-events: none;
  z-index: 3;
}

.large-screen-input:focus + .input-border,
.large-screen-textarea:focus + .textarea-border {
  border-color: #00ffff;
  box-shadow:
    0 0 20px rgba(0, 255, 255, 0.3),
    inset 0 0 20px rgba(0, 255, 255, 0.1);
}

/* 选择器样式 */
.large-screen-select {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  z-index: 2;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.large-screen-select:hover + .select-border {
  border-color: rgba(0, 255, 255, 0.6);
}

.select-value {
  color: #ffffff;
  font-size: 14px;
  font-family: 'Microsoft YaHei', sans-serif;
}

.select-arrow {
  width: 16px;
  height: 16px;
  fill: rgba(255, 255, 255, 0.6);
  transition: transform 0.3s ease;
}

.select-arrow.rotated {
  transform: rotate(180deg);
}

/* 下拉选项 */
.select-dropdown {
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.2);
  min-width: 200px;
}

.dropdown-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(26, 31, 58, 0.95) 0%,
    rgba(16, 20, 45, 0.95) 50%,
    rgba(26, 31, 58, 0.95) 100%
  );
  backdrop-filter: blur(15px);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
}

.dropdown-content {
  position: relative;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1;
}

.select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  color: #ffffff;
  font-size: 14px;
  font-family: 'Microsoft YaHei', sans-serif;
  transition: all 0.3s ease;
}

.select-option:hover {
  background: rgba(0, 255, 255, 0.1);
  color: #00ffff;
}

.select-option.selected {
  background: rgba(0, 255, 255, 0.2);
  color: #00ffff;
}

.option-check {
  width: 16px;
  height: 16px;
  fill: #00ffff;
}

/* 按钮样式 */
.large-screen-button {
  position: relative;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Microsoft YaHei', sans-serif;
  transition: all 0.3s ease;
  overflow: hidden;
  min-width: 120px;
}

.button-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: all 0.3s ease;
}

.button-text {
  position: relative;
  z-index: 2;
}

.button-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

/* 主要按钮 */
.large-screen-button.primary .button-bg {
  background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%);
}

.large-screen-button.primary .button-text {
  color: #000000;
}

.large-screen-button.primary:hover .button-glow {
  opacity: 1;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
}

/* 次要按钮 */
.large-screen-button.secondary .button-bg {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.large-screen-button.secondary .button-text {
  color: #ffffff;
}

.large-screen-button.secondary:hover .button-glow {
  opacity: 1;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

/* 危险按钮 */
.large-screen-button.danger .button-bg {
  background: linear-gradient(135deg, #ff3366 0%, #ff1744 100%);
}

.large-screen-button.danger .button-text {
  color: #ffffff;
}

.large-screen-button.danger:hover .button-glow {
  opacity: 1;
  box-shadow: 0 0 30px rgba(255, 51, 102, 0.5);
}

/* 禁用状态 */
.is-disabled .large-screen-input,
.is-disabled .large-screen-textarea,
.is-disabled .large-screen-select,
.large-screen-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 动画效果 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 滚动条样式 */
.dropdown-content::-webkit-scrollbar {
  width: 6px;
}

.dropdown-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.dropdown-content::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.3);
  border-radius: 3px;
}

.dropdown-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.5);
}
</style>
