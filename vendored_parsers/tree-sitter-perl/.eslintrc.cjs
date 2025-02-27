module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'standard'
  ],
  globals: [
    'choice', 'seq', 'grammar', 'repeat', 'token', 'optional', 'prec', 'field'
  ].reduce((acc, x) => ({ ...acc, [x]: 'readonly' }), {}),
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-unused-vars': [1, { argsIgnorePattern: '[$]' }],
    'comma-dangle': ['error', 'only-multiline']
  }
}
