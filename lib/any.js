/**
 * Module dependencies
 */

var defaults = require('./plugins/default');
var assert = require('./plugins/assert');
var clone = require('./utils/clone');
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

function any(expected) {
  if (!(this instanceof any)) return new any(expected);
  var pipeline = this.pipeline = [];
  arguments.length && pipeline.push(type(expected));
  this.expected = expected;
  return validate(this);
}

/**
 * Rube value
 */

any.prototype.rube = true;

/**
 * use
 */

any.prototype.use = function(fn) {
  return this.clone()._use(fn);
}

/**
 * _use (private)
 */

any.prototype._use = function(fn) {
  this.pipeline.push(fn);
  return this;
}

/**
 * assert
 */

any.prototype.assert = function(expected, message) {
  return this.clone()._use(assert(expected, message));
};

/**
 * default
 */

any.prototype.default = function(def) {
  return this.clone()._use(defaults(def));
};

/**
 * cast
 */

any.prototype.cast = function(from, to) {
  return this.clone()._use(cast(from, to));
};

/**
 * clone
 */

any.prototype.clone = function() {
  var expected = clone(this.expected);
  var pipeline = clone(this.pipeline);
  var options = clone(this.options);

  var obj = this.constructor(expected);
  obj.pipeline = pipeline;
  obj.options = options;
  return obj;
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
