/**
 * Module dependencies
 */

var type = require('./plugins/type');
var validate = require('./validate');
var Step = require('step.js');
var any = require('./any');

/**
 * Export `number`
 */

module.exports = number;

/**
 * Initialize `number`
 */

function number(value) {
  if (!(this instanceof number)) return new number(value);
  var pipeline = this.pipeline = [];
  return validate(this);
}

/**
 * Inherit from `any`
 */

number.prototype.__proto__ = any.prototype;

/**
 * between
 */

number.prototype.between = function() {
  this.pipeline.push(between(min, max));
  return this;
};
