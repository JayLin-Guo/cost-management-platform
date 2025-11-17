/**
 * Stylelint 配置文件
 */
module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss',
    'stylelint-config-recommended-vue',
  ],
  plugins: ['stylelint-order'],
  rules: {
    // 通用规则
    'no-empty-source': null,
    'no-descending-specificity': null,
    'font-family-no-missing-generic-family-keyword': null,
    'rule-empty-line-before': 'always',
    'declaration-empty-line-before': 'never',
    'comment-empty-line-before': 'always',
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['v-deep', ':deep'],
      },
    ],
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['deep', 'global'],
      },
    ],
    'selector-class-pattern': null, // 允许任何类名格式
    'keyframes-name-pattern': null, // 允许任何关键帧名称格式
    'value-keyword-case': null, // 允许驼峰式变量名
    'color-function-notation': 'modern', // 颜色格式要求
    'alpha-value-notation': 'number',
    'color-hex-length': 'short',

    // SCSS规则
    'scss/dollar-variable-pattern': null, // 允许任何SCSS变量名格式
    'scss/at-import-partial-extension': null, // 允许@import带扩展名
    'scss/no-global-function-names': null,
    'scss/comment-no-empty': null,

    // 允许特定的空选择器（用于Vue的<style scoped>）
    'block-no-empty': [
      true,
      {
        ignore: ['comments'],
      },
    ],

    // 属性排序规则
    'order/properties-order': [
      // 定位
      {
        groupName: '定位',
        properties: ['position', 'top', 'right', 'bottom', 'left', 'z-index'],
      },
      // 布局
      {
        groupName: '布局',
        properties: [
          'display',
          'flex',
          'flex-direction',
          'flex-wrap',
          'flex-flow',
          'flex-grow',
          'flex-shrink',
          'flex-basis',
          'justify-content',
          'align-items',
          'align-content',
          'align-self',
          'grid',
          'grid-template',
          'grid-template-columns',
          'grid-template-rows',
          'grid-template-areas',
          'grid-auto-columns',
          'grid-auto-rows',
          'grid-auto-flow',
          'grid-column',
          'grid-row',
          'grid-area',
          'gap',
          'column-gap',
          'row-gap',
          'float',
          'clear',
        ],
      },
      // 尺寸和溢出
      {
        groupName: '尺寸和溢出',
        properties: [
          'box-sizing',
          'width',
          'min-width',
          'max-width',
          'height',
          'min-height',
          'max-height',
          'overflow',
          'overflow-x',
          'overflow-y',
        ],
      },
      // 边距
      {
        groupName: '边距',
        properties: [
          'margin',
          'margin-top',
          'margin-right',
          'margin-bottom',
          'margin-left',
          'padding',
          'padding-top',
          'padding-right',
          'padding-bottom',
          'padding-left',
        ],
      },
      // 文本和字体
      {
        groupName: '文本和字体',
        properties: [
          'font',
          'font-family',
          'font-size',
          'font-weight',
          'font-style',
          'font-variant',
          'line-height',
          'letter-spacing',
          'word-spacing',
          'text-align',
          'text-decoration',
          'text-indent',
          'text-overflow',
          'text-transform',
          'white-space',
          'word-break',
          'word-wrap',
          'color',
        ],
      },
      // 背景
      {
        groupName: '背景',
        properties: [
          'background',
          'background-color',
          'background-image',
          'background-repeat',
          'background-position',
          'background-attachment',
          'background-size',
          'background-clip',
          'background-origin',
        ],
      },
      // 边框
      {
        groupName: '边框',
        properties: [
          'border',
          'border-width',
          'border-style',
          'border-color',
          'border-top',
          'border-right',
          'border-bottom',
          'border-left',
          'border-radius',
          'outline',
        ],
      },
      // 变换和过渡
      {
        groupName: '变换和过渡',
        properties: [
          'transform',
          'transform-origin',
          'transition',
          'transition-property',
          'transition-duration',
          'transition-timing-function',
          'transition-delay',
          'animation',
        ],
      },
      // 其他
      {
        groupName: '其他',
        properties: [
          'opacity',
          'visibility',
          'cursor',
          'pointer-events',
          'user-select',
          'box-shadow',
          'filter',
        ],
      },
    ],
  },
  ignoreFiles: ['node_modules/**/*', 'dist/**/*', 'public/**/*'],
  overrides: [
    {
      files: ['*.vue', '**/*.vue'],
      rules: {
        // 放宽对Vue单文件组件的要求
        'selector-pseudo-element-no-unknown': [
          true,
          {
            ignorePseudoElements: [
              'v-deep',
              'v-global',
              'v-slotted',
              ':deep',
              ':global',
              ':slotted',
            ],
          },
        ],
      },
    },
    {
      files: ['*.scss', '**/*.scss'],
      customSyntax: 'postcss-scss',
    },
  ],
}
