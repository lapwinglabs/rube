/**
 * Module dependencies
 */

var error = require('./lib/utils/error');
var type = require('./lib/utils/type');
var bind = Function.prototype.bind;
var sliced = require('sliced');
var Step = require('step.js');
var Batch = require('batch');
var noop = function() {};

/**
 * Export `Rube`
 */

module.exports = Rube;

/**
 * Types
 */

var types = {
  array: require('./lib/array'),
  number: require('./lib/number'),
  object: require('./lib/object'),
  string: require('./lib/string'),
  any: require('./lib/any')
};

/**
 * Initialize `Rube`
 *
 * @param {Mixed} value
 * @return {Rube}
 * @api public
 */

function Rube() {
  if (!(this instanceof Rube)) return construct(Rube, sliced(arguments));
  var args = sliced(arguments);
  if (args.length <= 1) return initialize(args[0]);

  args = args.map(initialize);
  var len = args.length;

  return function rube(actual, fn) {
    var batch = Batch().throws(false);

    args.forEach(function(arg) {
      batch.push(function(next) {
        arg(actual, next);
      });
    });

    batch.end(function(errors, values) {
      errors = errors.filter(function(err) { return err; });
      return errors.length == len
        ? fn(error(errors, actual))
        : fn(null, actual);
    });
  }

  function initialize(value) {
    // instanceof itself
    // TODO: improve?
    if (value.rube) return value;

    switch (type(value)) {
      case 'string': return types.string(value);
      case 'number': return types.number(value);
      case 'object': return types.object(value);
      case 'array': return types.array(value);
      default: return types.any(value);
    }
  }
}

/**
 * Construct
 */

function construct(constructor, args) {
  function F() { return constructor.apply(this, args); }
  F.prototype = constructor.prototype;
  return new F();
}
