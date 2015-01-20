/**
 * Module dependencies
 */

var invalid = require('invalid');

/**
 * Export `Type`
 */

module.exports = Type;

/**
 * Initialize `Type`
 */

function Type(t) {
  return function type(value) {
    var err = invalid(value, t);
    return err || value;
  }
}
