// @ts-check

import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  stylistic.configs.recommended,
  {
    rules: {
      'indent': ['error', 2],
      '@stylistic/indent': ['error', 2],
      '@stylistic/function-call-argument-newline': ['error', 'consistent'],
      '@stylistic/object-curly-newline': ['error', { consistent: true }],
      '@stylistic/semi': ['error', 'always'],
    },
  },
);
