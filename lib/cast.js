/**
 * Module Dependencies
 */

var type = require('./utils/type.js');
var typecast = require('typecast');

/**
 * Export `cast`
 */

module.exports = cast;

/**
 * Initialize `cast`
 *
 * @param {Mixed} from (optional)
 * @param {Mixed} to
 */

function cast(from, to) {
  if (1 == arguments.length) {
    to = type(from);
    from = false;
  } else {
    from = type(from);
    to = type(to);
  }

  return function(value) {
    return !from || type(value) == from
      ? typecast(value, to)
      : value;
  }
}
