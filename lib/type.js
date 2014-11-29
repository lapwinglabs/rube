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

function Type(type) {
  return function(value) {
    var err = invalid(value, type);
    return err || value;
  }
}
