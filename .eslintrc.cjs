/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting',
  ],

  rules: {
    // override/add rules settings here, such as:
    '@typescript-eslint/no-explicit-any': ['off'],
    'vue/multi-word-component-names': 'off', // 取消驼峰命名
    'no-empty': ['off', { allowEmptyCatch: true }],
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
}
