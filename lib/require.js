/**
 * Module dependencies
 */

var type = require('./utils/type');

/**
 * Export `Require`
 */

module.exports = Required;

/**
 * Require a value. Cannot be `undefined`.
 */

function Required() {
  return function(value) {
    return 'undefined' == type(value)
      ? new TypeError('value must be defined')
      : value;
  }
}
