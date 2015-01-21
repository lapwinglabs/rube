/**
 * Module dependencies
 */

var between = require('./plugins/between');
var format = require('./plugins/format');
var validate = require('./validate');
var type = require('./plugins/type');
var trim = require('./plugins/trim');
var any = require('./any');

/**
 * Export `string`
 */

module.exports = string;

/**
 * Initialize `string`
 */

function string(expected) {
  if (!(this instanceof string)) return new string(expected);
  this.pipeline = [type(String)];
  this.expected = expected;
  this.options = {};
  return validate(this);
}

/**
 * Inherit from `any`
 */

string.prototype.__proto__ = any.prototype;

/**
 * Between
 */

string.prototype.between = function(min, max) {
  return this.clone()._use(between(min, max));
};

/**
 * trim
 */

string.prototype.trim = function() {
  return this.clone()._use(trim());
};

/**
 * format
 */

string.prototype.format = function(formatter, format) {
  return this.clone()._use(format(formatter, format));
};

