/**
 * Module dependencies
 */

var assign = require('object-assign');
var clone = require('./utils/clone');
var error = require('./utils/error');
var validate = require('./validate');
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
  this.pipeline = [type(Object), _batch()];
  this.expected = expected;
  this.options = {};

  return validate(this);
}

/**
 * Inherit from `any`
 */

object.prototype = assign(any.prototype, object.prototype);

/**
 * Batch
 */

function _batch() {
  return function batch(actual, fn) {
    var batch = Batch().throws(false);
    var expected = this.expected;
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

  return this.clone()._use(function(obj) {
    var check = keys(this.expected);
    if (check.length <= 1) return obj;

    var vals = check.filter(function(key) {
      return prop.get(obj, key) !== undefined;
    });

    return vals.length == 0
      ? new Error('Rube failed: "' + check.join('" OR "') + '" must exist')
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
      return prop.get(o, key) !== undefined;
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
  obj.expected = only(obj.expected, str);
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
