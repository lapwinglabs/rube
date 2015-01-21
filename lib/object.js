/**
 * Module dependencies
 */

var clone = require('./utils/clone');
var error = require('./utils/error');
var Validate = require('./validate');
var type = require('./plugins/type');
var only = require('./utils/only');
var prop = require('dot-prop');
var sliced = require('sliced');
var Step = require('step.js');
var Batch = require('batch');
var any = require('./any');
var noop = function() {};
var keys = Object.keys;

/**
 * Export `object`
 */

module.exports = object;

/**
 * Initialize `object`
 */

function object(expected) {
  if (!(this instanceof object)) return new object(expected);
  this.pipeline = [type(Object)];
  this.expected = expected;
  this.options = {};

  return Validate(this, function validate(actual, fn) {
    var o = this.options.only;
    var e = o ? only(expected, o) : expected;
    this.pipeline.splice(1, 0, _batch(e));
    Step(this.pipeline).run(actual, fn);
  });
}

/**
 * Inherit from `any`
 */

object.prototype.__proto__ = any.prototype;

/**
 * Batch
 */

function _batch(expected) {
  return function batch(actual, fn) {
    var batch = Batch().throws(false);
    var values = {};
    var errors = {};

    keys(expected).forEach(function(key) {
      batch.push(function(next) {
        expected[key](actual[key], function(err, val) {
          if (err) {
            errors[key] = err;
            return next(err);
          } else {
            values[key] = val;
            return next();
          }
        })
      })
    });

    batch.end(function() {
      return keys(errors).length
        ? fn(error(errors, actual))
        : fn(null, values);
    });
  }
}

/**
 * or
 */

object.prototype.or = function() {
  var keys = sliced(arguments);

  return this.clone()._use(function(obj) {
    var vals = keys.filter(function(key) {
      return prop(obj, key) !== undefined;
    });

    return vals.length == 0
      ? new Error('Rube failed: "' + keys.join('" OR "') + '" must exist')
      : obj;
  });
};

/**
 * xor
 */

object.prototype.xor = function() {
  var keys = sliced(arguments);

  return this.clone()._use(function(o) {
    var vals = keys.filter(function(key) {
      return prop(o, key) !== undefined;
    });

    return vals.length != 1
      ? new Error('Rube failed. "' + vals.join('" XOR "') + '" cannot all be present')
      : o;
  });
};

/**
 * only validate against certain keys
 */

object.prototype.only = function(str) {
  if (!arguments.length) return this.options.only;
  var obj = this.clone();
  obj.options.only = str;
  return obj;
}

/**
 * and
 */

object.prototype.and = function() {

};

/**
 * nand
 */

object.prototype.nand = function() {

};
