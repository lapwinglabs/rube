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
    switch(type(value)) {
      case 'undefined': return new TypeError('value must be defined');
      case 'string': return value.length == 0
        ? new TypeError('value cannot be blank')
        : value;
      default: return value;
    }
  }
}
