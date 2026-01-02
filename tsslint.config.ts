import { defineConfig } from '@tsslint/config'
import { defineRules } from '@tsslint/eslint'

export default defineConfig([
  {
    rules: {
      ...(await defineRules({
        curly: ['multi-line', 'consistent'],
        eqeqeq: true,
        'no-throw-literal': true,
        'no-unused-expressions': true,
        'no-debugger': true
      }))
    }
  }
])
