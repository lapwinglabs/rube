/**
 * Module dependencies
 */

var t = require('../utils/type');

/**
 * Export `Type`
 */

module.exports = Type;

/**
 * Initialize `Type`
 */

function Type(expected) {
  return function type(actual) {
    return undefined === actual || t(expected) == t(actual)
      ? actual
      : new TypeError('"' + actual + '" is not a "' + t(expected) + '"');
  }
}
