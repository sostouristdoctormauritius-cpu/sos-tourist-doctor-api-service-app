module.exports = [
  {
    // Global ignores - be very specific about what to ignore
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.min.js',
      'public/static/js/*.js',
      'public/**/*.chunk.js',
      'public/vendor/**',
      'src/public/sos/static/js/*.js',
      'src/public/**/*.chunk.js'
    ]
  },
  {
    // Node.js source files
    files: [
      'src/**/*.js',
      'scripts/**/*.js',
      'tests/**/*.js'
    ],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        Promise: 'readonly',
        Buffer: 'readonly',
        JSON: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        
        // Testing globals
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        
        // Project specific globals that are commonly used
        ApiError: 'readonly',
        httpStatus: 'readonly',
        emailService: 'readonly'
      }
    },
    rules: {
      // Basic rules
      'indent': ['error', 2, { 'SwitchCase': 1 }],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'never'],
      'no-unused-vars': ['warn', { 'args': 'none' }],
      'no-console': 'off',
      'no-undef': 'off',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],
      'space-before-function-paren': ['error', {
        'anonymous': 'never',
        'named': 'never',
        'asyncArrow': 'always'
      }],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'keyword-spacing': ['error', { 'before': true, 'after': true }]
    }
  }
];