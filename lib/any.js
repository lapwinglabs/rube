/**
 * Module dependencies
 */

var defaults = require('./plugins/default');
var assert = require('./plugins/assert');
var type = require('./plugins/type');
var cast = require('./plugins/cast');
var validate = require('./validate');
var Step = require('step.js');

/**
 * Export `any`
 */

module.exports = any;

/**
 * Initialize `any`
 */

function any(value) {
  if (!(this instanceof any)) return new any(value);
  var pipeline = this.pipeline = [];
  arguments.length && pipeline.push(type(value));

  function validate(actual, fn) {
    Step(pipeline).run(actual, fn);
  }

  for (var k in any.prototype) validate[k] = any.prototype[k];
  validate.pipeline = pipeline;

  return validate;
}

/**
 * Rube value
 */

any.prototype.rube = true;

/**
 * use
 */

any.prototype.use = function(fn) {
  this.pipeline.push(fn);
  return this;
}

/**
 * assert
 */

any.prototype.assert = function(expected, message) {
  this.pipeline.push(assert(expected, message));
  return this;
};

/**
 * default
 */

any.prototype.default = function(def) {
  this.pipeline.push(defaults(def));
  return this;
};

/**
 * cast
 */

any.prototype.cast = function(from, to) {
  this.pipeline.push(cast(from, to));
  return this;
};

/**
 * Add a custom message
 *
 * @param {Error|String} message
 * @return {Any|String}
 */

any.prototype.message = function(message) {
  if (!arguments.length) return this._message;
  this._message = message.stack ? message : new Error(message);
  return this;
}
