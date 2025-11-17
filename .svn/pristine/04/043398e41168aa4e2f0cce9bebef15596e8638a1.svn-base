/* eslint-env node */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/typescript/recommended',
    '@vue/eslint-config-prettier',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parser: '@typescript-eslint/parser',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // Vue相关规则
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'warn',
    'vue/require-default-prop': 'off',
    'vue/max-attributes-per-line': [
      'warn',
      {
        singleline: {
          max: 3,
        },
        multiline: {
          max: 1,
        },
      },
    ],

    // TypeScript相关规则
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'warn',

    // 一般JavaScript规则
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': 'off', // 使用TypeScript版本的规则
    'prefer-const': 'warn',
    'no-var': 'error',
    eqeqeq: ['warn', 'always', { null: 'ignore' }],
    curly: 'warn',

    // 代码风格规则
    quotes: ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    semi: ['warn', 'never'],
    'comma-dangle': ['warn', 'always-multiline'],
    'arrow-parens': ['warn', 'always'],

    // 行尾规则，与Prettier保持一致
    'prettier/prettier': ['error', { endOfLine: 'lf' }],
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        indent: 'off', // 在.vue文件中禁用缩进规则，使用prettier处理
      },
    },
    {
      files: ['**/tests/**/*.[jt]s?(x)', '**/*.spec.[jt]s?(x)'],
      env: {
        jest: true,
      },
    },
  ],
}
