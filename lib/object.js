/**
 * Module dependencies
 */

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
var Vo = require('vo');
var keys = Object.keys;

/**
 * Export `object`
 */

module.exports = object;

/**
 * Initialize `object`
 */

function object(expected) {
  var pipeline = [type(expected)];

  function obj(actual, fn) {
    var vo = Vo.apply(vo, pipeline).catch(caught);
    vo(actual, fn);
  }

  function caught(err) {
    console.log('caught', err);
  }

  obj.or = function() {
    pipeline.push(Or(sliced(arguments)));
    return obj;
  }

  obj.and = function() {

  }

  obj.nand = function() {

  }

  obj.xor = function() {

  }

  obj.only = function(key) {
    pipeline.push(Only(key));
    return obj;
  }

  return obj;
}

function Or(keys) {
  return function or(actual) {
    if (keys.length <= 1) return actual;

    var subset = keys.filter(function(key) {
      return prop(actual, key) !== undefined;
    });

    return subset.length == 0
      ? new Error('Rube failed: "' + keys.join('" OR "') + '" must exist')
      : actual;
  }
}

function Only(key) {
  return function only(actual) {

  }
}

// /**
//  * Inherit from `any`
//  */

// object.prototype.__proto__ = any.prototype;

// /**
//  * Batch
//  */

// function _batch() {
//   return function batch(actual, fn) {
//     var batch = Batch().throws(false);
//     var expected = this.expected;
//     var values = {};
//     var errors = {};
//     keys(expected).forEach(function(key) {
//       batch.push(function(next) {
//         expected[key](actual[key], function(err, val) {
//           if (err) {
//             errors[key] = err;
//             return next(err);
//           } else {
//             values[key] = val;
//             return next();
//           }
//         })
//       })
//     });

//     batch.end(function() {
//       return keys(errors).length
//         ? fn(error(errors, actual))
//         : fn(null, values);
//     });
//   }
// }

// /**
//  * or
//  */

// object.prototype.or = function() {

//   return this.clone()._use(function(obj) {
//     var check = keys(this.expected);
//     if (check.length <= 1) return obj;

//     var vals = check.filter(function(key) {
//       return prop(obj, key) !== undefined;
//     });

//     return vals.length == 0
//       ? new Error('Rube failed: "' + check.join('" OR "') + '" must exist')
//       : obj;
//   });
// };

// /**
//  * xor
//  */

// object.prototype.xor = function() {
//   var keys = sliced(arguments);

//   return this.clone()._use(function(o) {
//     var vals = keys.filter(function(key) {
//       return prop(o, key) !== undefined;
//     });

//     return vals.length != 1
//       ? new Error('Rube failed. "' + vals.join('" XOR "') + '" cannot all be present')
//       : o;
//   });
// };

// /**
//  * only validate against certain keys
//  */

// object.prototype.only = function(str) {
//   if (!arguments.length) return this.options.only;
//   var obj = this.clone();
//   obj.expected = only(obj.expected, str);
//   return obj;
// }

// /**
//  * and
//  */

// object.prototype.and = function() {

// };

// /**
//  * nand
//  */

// object.prototype.nand = function() {

// };
