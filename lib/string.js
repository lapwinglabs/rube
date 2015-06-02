/**
 * Module dependencies
 */

var defaults = require('./plugins/defaults');
var between = require('./plugins/between');
var format = require('./plugins/format');
var cast = require('./plugins/cast');
var validate = require('./validate');
var type = require('./plugins/type');
var type = require('./plugins/type');
var trim = require('./plugins/trim');
var any = require('./any');
var Vo = require('vo');

/**
 * Export `string`
 */

module.exports = string;

/**
 * Initialize `string`
 */

function string(expected) {
  var pipeline = [type(expected)];

  function str(actual, fn) {
    var vo = Vo.apply(vo, pipeline);
    vo(actual, fn);
  }

  str.between = function(min, max) {
    pipeline.push(between(min, max));
    return str;
  };

  str.trim = function() {
    pipeline.push(trim());
    return str;
  }

  str.format = function(formatter, fmt) {
    pipeline.push(format(formatter, fmt));
    return str;
  }

  str.cast = function(from, to) {
    pipeline.push(cast(from, to));
    return str;
  }

  str.default = function(def) {
    pipeline.push(defaults(def));
    return str;
  }

  return str;
}
