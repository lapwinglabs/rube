/**
 * Module dependencies
 */

var error = require('./lib/utils/error');
var type = require('./lib/utils/type');
var clone = require('component-clone');
var bind = Function.prototype.bind;
var sliced = require('sliced');
var noop = function() {};
var Vo = require('vo');

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
  var args = sliced(arguments);
  var pipeline = args.map(seed);

  if (1 == arguments.length) {
    return pipeline[0];
  }
}

function seed(value) {
  value = clone(value);

  switch (type(value)) {
    case 'string': return types.string(value);
    case 'number': return types.number(value);
    case 'object': return types.object(value);
    case 'array': return types.array(value);
    default: return types.any(value);
  }
}

var rube = Rube({
  a: Rube(String),
  b: Rube(String),
  c: Rube(String)
}).or('a', 'b').only('c');

rube.only('c')('hi there!', function(err, v) {
  if (err) throw err;
  console.log(v);
})

// var a = Rube(String).between(4, 5);
// var b = Rube(Number).cast(String, Number).between(10, 20);

// b('15', function(err, v) {
//   if (err) throw err;
//   console.log(v);
// })


// function Rube() {
//   if (!(this instanceof Rube)) return construct(Rube, sliced(arguments));
//   var args = sliced(arguments);
//   if (args.length <= 1) return initialize(args[0]);

//   args = args.map(initialize);
//   var len = args.length;

//   return function rube(actual, fn) {
//     var batch = Batch().throws(false);

//     args.forEach(function(arg) {
//       batch.push(function(next) {
//         arg(actual, next);
//       });
//     });

//     batch.end(function(errors, values) {
//       errors = errors.filter(function(err) { return err; });
//       return errors.length == len
//         ? fn(error(errors, actual))
//         : fn(null, actual);
//     });
//   }

//   function initialize(value) {
//     // instanceof itself
//     // TODO: improve?
//     if (value.rube) return value;

//     switch (type(value)) {
//       case 'string': return types.string(value);
//       case 'number': return types.number(value);
//       case 'object': return types.object(value);
//       case 'array': return types.array(value);
//       default: return types.any(value);
//     }
//   }
// }

// /**
//  * Construct
//  */

// function construct(constructor, args) {
//   function F() { return constructor.apply(this, args); }
//   F.prototype = constructor.prototype;
//   return new F();
// }
