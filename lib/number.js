/**
 * Module dependencies
 */

var type = require('./plugins/type');
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

  function validate(actual, fn) {
    Step(pipeline).run(actual, fn);
  }

  for (var k in object.prototype) validate[k] = object.prototype[k];
  validate.pipeline = pipeline;

  return validate;
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
