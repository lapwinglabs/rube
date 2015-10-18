/**
 * Module dependencies
 */

var assign = require('object-assign');
var type = require('./plugins/type');
var validate = require('./validate');
var any = require('./any');

/**
 * Export `number`
 */

module.exports = number;

/**
 * Initialize `number`
 */

function number(expected) {
  if (!(this instanceof number)) return new number(expected);
  var pipeline = this.pipeline = [type(Number)];
  this.expected = expected;
  return validate(this);
}

/**
 * Inherit from `any`
 */

number.prototype = assign(any.prototype, number.prototype);

/**
 * between
 */

number.prototype.between = function() {
  return this.clone()._use(between(min, max));
};
