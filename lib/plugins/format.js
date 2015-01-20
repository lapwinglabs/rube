/**
 * Module dependencies
 */

var type = require('../utils/type.js');
var rrep = /(\$(`|&|'|\d+))/g;
var noop = function() {};
var slice = [].slice;

/**
 * Export `Format`
 */

module.exports = Format;

/**
 * Initialize `Format`
 *
 * @param {RegExp|Function} formatter
 * @param {String|Function} format
 */

function Format(formatter, format) {
  return 1 == arguments.length
    ? func(formatter)
    : regex(formatter, format);
}

/**
 * Regular format function
 *
 * @param {Function} fn
 * @return {Function}
 */

function func(fn) {
  return function(value) {
    return fn(value);
  }
}

/**
 * Regex based formatting
 *
 * @param {Regexp} regex
 * @param {String|Function} rep
 */

function regex(regex, rep) {
  var global = !!regex.global;

  rep = arguments.length > 1 ? rep : noop;
  rep = 'function' == typeof rep ? rep : compile(rep);

  return function(value) {
    return (value + '').replace(regex, function() {
      var m = slice.call(arguments);
      var i = 1;

      // remove extra stuff if not global
      if (!global) {
        while(m[i] && 'string' == type(m[i])) i++;
        m = m.slice(0, i);
      }

      return rep(m);
    });
  }
}

/**
 * Compile the replacer
 *
 * @param {String} str
 * @return {String}
 */

function compile(str) {
  var expr = str.replace(rrep, function(m) {
    var out = '\' + ($[';
    out += '&' == m[1] ? 0 : m[1];
    out += '] || \'\') + \'';
    return out;
  })

  expr = '\'' + expr + '\'';
  return new Function('$', 'return ' + expr);
}
