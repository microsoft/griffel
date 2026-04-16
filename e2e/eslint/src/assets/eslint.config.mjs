import griffelPlugin from '@griffel/eslint-plugin';
import tseslint from 'typescript-eslint';

export default tseslint.config({
  files: ['**/*.ts'],
  extends: [tseslint.configs.base],
  ...griffelPlugin.configs.recommended,
});
