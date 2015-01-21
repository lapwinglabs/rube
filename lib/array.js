/**
 * Module dependencies
 */

var type = require('./plugins/type');
var clone = require('./utils/clone');
var validate = require('./validate');
var any = require('./any');

/**
 * Export `array`
 */

module.exports = array;

/**
 * Initialize `array`
 */

function array(expected) {
  if (!(this instanceof array)) return new array(expected);
  this.pipeline = [type(Array)];
  this.expected = expected;
  return validate(this);
}

/**
 * Inherit from `any`
 */

array.prototype.__proto__ = any.prototype;
