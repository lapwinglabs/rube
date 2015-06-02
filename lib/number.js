/**
 * Module dependencies
 */

var defaults = require('./plugins/defaults');
var between = require('./plugins/between');
var cast = require('./plugins/cast');
var type = require('./plugins/type');
var trim = require('./plugins/trim');
var any = require('./any');
var Vo = require('vo');

/**
 * Export `number`
 */

module.exports = number;

/**
 * Initialize `number`
 */

function number(expected) {
  var pipeline = [type(expected)];

  function num(actual, fn) {
    var vo = Vo.apply(vo, pipeline);
    vo(actual, fn);
  }

  num.between = function(min, max) {
    pipeline.push(between(min, max));
    return num;
  };

  num.cast = function(from, to) {
    pipeline.push(cast(from, to));
    return num;
  }

  num.default = function(def) {
    pipeline.push(defaults(def));
    return num;
  }

  return num;
}
