/**
 * Module dependencies
 */

var error = require('./utils/error');
var type = require('./plugins/type');
var prop = require('dot-prop');
var sliced = require('sliced');
var Step = require('step.js');
var Batch = require('batch');
var any = require('./any');
var keys = Object.keys;

/**
 * Export `object`
 */

module.exports = object;

/**
 * Initialize `object`
 */

function object(value) {
  if (!(this instanceof object)) return new object(value);
  var pipeline = this.pipeline = [type(Object), batch(value)];

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

object.prototype.__proto__ = any.prototype;

/**
 * Batch
 */

function batch(expected) {
  return function(actual, fn) {
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

  this.pipeline.push(function(obj) {
    var vals = keys.filter(function(key) {
      return prop(obj, key) !== undefined;
    });

    return vals.length == 0
      ? new Error('Rube failed: "' + keys.join('" OR "') + '" must exist')
      : obj;
  });

  return this;
};

/**
 * xor
 */

object.prototype.xor = function() {
  var keys = sliced(arguments);

  this.pipeline.push(function(obj) {
    var vals = keys.filter(function(key) {
      return prop(obj, key) !== undefined;
    });

    return vals.length != 1
      ? new Error('Rube failed. "' + vals.join('" XOR "') + '" cannot all be present')
      : obj;
  });

  return this;
};

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





/**
 * Between
 */

// object.prototype.between = function(min, max) {
//   this.pipeline.push(between(min, max));
//   return this;
// };

// /**
//  * Assert
//  */

// object.prototype.assert = function(expected, message) {
//   this.pipeline.push(assert(expected, message));
//   return this;
// };
