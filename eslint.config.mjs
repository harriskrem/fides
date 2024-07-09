import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import pluginVue from 'eslint-plugin-vue';
import eslintConfigPrettier from 'eslint-config-prettier';
import vueeslintParser from 'vue-eslint-parser';

export default [
  ...pluginVue.configs['flat/recommended'],
  {
    files: ["*.vue", "**/*.vue"],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    languageOptions: {
      parser: vueeslintParser,
      parserOptions: {
        parser: tsParser,
        project: './tsconfig.app.json',
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
  },
  eslintConfigPrettier,
];
