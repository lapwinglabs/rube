/**
 * Module Dependencies
 */

var type = require('./utils/type');

/**
 * Export `Default`
 */

module.exports = Default;

/**
 * Set the value if `undefined`
 */

function Default(def) {
  return function(value) {
    switch(type(value)) {
      case 'undefined':
        return def;
      default:
        return value;
    }
  };
}
