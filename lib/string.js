/**
 * Module dependencies
 */

var between = require('./plugins/between');
var format = require('./plugins/format');
var validate = require('./validate');
var type = require('./plugins/type');
var trim = require('./plugins/trim');
var Step = require('step.js');
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
  var pipeline = this.pipeline = [type(String)];
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
  this.pipeline.push(between(min, max));
  return this;
};

/**
 * trim
 */

string.prototype.trim = function() {
  this.pipeline.push(trim());
  return this;
};

/**
 * format
 */

string.prototype.format = function(formatter, format) {
  this.pipeline.push(format(formatter, format));
  return this;
};

