/**
 * Module dependencies
 */

var type = require('./utils/type');

/**
 * Export `Require`
 */

module.exports = Require;

/**
 * Require a value. Cannot be `undefined`.
 */

function Require() {
  return function(value) {
    return 'undefined' == type(value)
      ? new TypeError('value must be defined')
      : value;
  }
}
