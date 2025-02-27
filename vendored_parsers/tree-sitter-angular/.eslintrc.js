module.exports = {
  env: {
    commonjs: true,
    es2021: true,
  },
  extends: 'google',
  overrides: [],
  plugins: ['@stylistic/js'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'function-call-argument-newline': ['error', 'consistent'],
    'object-curly-spacing': 'off',
    'quote-props': 'off',
    indent: ['error', 2, { SwitchCase: 1 }],
    'max-len': [
      'error',
      {
        code: 160,
        ignoreComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
      },
    ],
  },
};
