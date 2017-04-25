module.exports = {
  'extends': 'airbnb-base',
  'env': {
    'node' : true,
    'mocha': true
  },

  // This overrides the sourceType from 'module' to 'script'
  'parserOptions': {
    'ecmaVersion': 6,
    'sourceType' : 'script',
    'ecmaFeatures': {
      'generators': false,
      'objectLiteralDuplicateProperties': false
    }
  },

  'rules' : {
    // This allows properties of parameters to be written but not parameters themselves
    'no-param-reassign': ['error', { 'props': false }],

    // warn if lines are more than 120 characters long with tabWidth of 2, similar to other modules
    'max-len': ['warn', 120, 2, {
      'ignoreUrls': true,
      'ignoreComments': false
    }],

    // Turning off the rule that forces return statements
    // Most of the middleware returns next(err) or just ends with calling next()
    'consistent-return': 'off',

    // look into this again
    'key-spacing': 'off',

    // Better to have all the requires at the top. However, sometimes (as in SAP connector), we require
    // only on certain OS'es. So, keeping this as warning
    'global-require': 'warn',

    // We do not want comma dangles. Feels incomplete and erroneous
    'comma-dangle': ['error', 'never'],

    // same as provided by AirBnB but removed ForInStatement from the list
    'no-restricted-syntax': [
      'error',
      'DebuggerStatement',
      'LabeledStatement',
      'WithStatement',
    ],

    // guarding for-in with [if x.hasOwnProperty()] is unnecessary
    'guard-for-in': 'off',
    'no-underscore-dangle': 'off',
    'no-unused-vars': ['warn', { 'vars': 'all', 'args': 'all' }],
    'arrow-parens': ['error', 'always'],
    'lines-around-directive': 'off',
    'import/no-extraneous-dependencies': 'off'
  }
}
