/**
 * Module dependencies
 */

var fmt = require('./utils/format');
var type = require('./utils/type');
var assert = require('assert');
var wrap = require('wrap-fn');

/**
 * Export `Assert`
 */

module.exports = Assert;

/**
 * Assert a value. Cannot be `undefined`.
 */

function Assert(expected, msg) {
  if ('function' == typeof expected) return func(expected);

  var fn = compile(expected, msg);

  return function(value) {
    try {
      fn(value);
    } catch (e) {
      return e;
    }
  }
}

/**
 * Compile the assertion
 */

function compile(expected, msg) {
  switch(type(expected)) {
    case 'regexp': return regex(expected, msg);
    case 'object':
    case 'array':
      return object(expected, msg)
    default:
      return misc(expected, msg);
  }
}

function func(fn) {
  return function(value, done) {
    wrap(fn, function(err, v) {
      try {
        if (err) throw err;
        assert(v);
        done()
      } catch (e) {
        done(e);
      }
    })(value);
  }
}

/**
 * Regex assertion
 */

function regex(expected, msg) {
  return function(value) {
    msg = msg || fmt('"%s" does not match "%s"', value, expected);
    assert(expected.test(value), msg);
  }
}

/**
 * Deep equality on objects and arrays
 */

function object(expected, msg) {
  return function(value) {
    assert.deepEqual(value, expected, msg);
  }
}

/**
 * Equality on everything else
 */

function misc(expected, msg) {
  return function(value) {
    assert.equal(value, expected, msg);
  }
}
