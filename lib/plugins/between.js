/**
 * Module dependencies
 */

var fmt = require('../utils/format');

/**
 * Errors
 */

var minmsg = 'length must be greater than or equal to %s';
var maxmsg = 'length must be less than or equal to %s';

/**
 * Export `Between`
 */

module.exports = Between;

/**
 * Between a value. Cannot be `undefined`.
 */

function Between(min, max) {
  return function between(value) {
    var len = value.length === undefined ? value : value.length;

    return len < min
      ? new RangeError(fmt(minmsg, min))
      : len > max
      ? new RangeError(fmt(maxmsg, max))
      : value;
  }
}
