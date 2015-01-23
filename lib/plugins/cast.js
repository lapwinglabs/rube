/**
 * Module Dependencies
 */

var type = require('../utils/type.js');
var typecast = require('typecast');

/**
 * Export `cast`
 */

module.exports = Cast;

/**
 * Initialize `cast`
 *
 * @param {Mixed} from (optional)
 * @param {Mixed} to
 */

function Cast(from, to) {
  if (undefined === to) {
    to = type(from);
    from = false;
  } else {
    from = type(from);
    to = type(to);
  }

  return function cast(value) {
    return !from || type(value) == from
      ? typecast(value, to)
      : value;
  }
}
