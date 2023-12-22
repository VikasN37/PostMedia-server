module.exports = {
  env: {
    commonjs: true,
    es2017: true,
    node: true,
  },
  extends: ['airbnb-base', 'prettier', 'plugin:node/recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'consistent-return': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: 'req|res|nex|val' }],
    'no-console': 'warn',
    'import/no-unresolved': 'warn',
    'node/no-missing-require': 'warn',
    'no-process-exit': 'warn',
    'no-underscore-dangle': ['warn', { allow: ['_id'] }],
    'prefer-destructuring': 'warn',
    'no-param-reassign': 'warn',
    omitLastInOneLineBlock: true,
  },
}
