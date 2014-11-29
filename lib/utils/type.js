try {
  var t = require('type');
} catch (e) {
  var t = require('type-component');
}

/**
 * Expose `type`
 */

module.exports = type;

/**
 * Get the type
 *
 * @param {Mixed} val
 * @return {String} type
 */

function type(val) {
  switch(val) {
    case undefined: return 'undefined';
    case Function: return 'function';
    case Boolean: return 'boolean';
    case Number: return 'number';
    case String: return 'string';
    case RegExp: return 'regexp';
    case Object: return 'object';
    case Array: return 'Array';
    case Date: return 'date';
    case null: return 'null';
    case NaN: return 'nan';
    default: return t(val);
  }
}
