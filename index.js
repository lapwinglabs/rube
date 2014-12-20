/**
 * Module dependencies
 */

var Step = require('step.js');
var noop = function() {};

/**
 * Export `Rube`
 */

module.exports = Rube;

/**
 * Initialize `Rube`
 *
 * @return {Rube}
 * @api public
 */

function Rube() {
  if (!(this instanceof Rube)) return new Rube();
  var pipeline = [];

  function rube(actual, fn) {
    Step(pipeline).run(actual, function(err, v) {
      return err
        ? fn(rube._message(err))
        : fn(null, v);
    });
  }

  rube._pipeline = pipeline;
  rube._message = function(err) { return err; }

  // add the methods
  for (var k in Rube.prototype) {
    rube[k] = Rube.prototype[k];
  }

  return rube;
}

/**
 * Attach a custom method to Rube instances
 *
 * @param {String} name
 * @param {Function} fn
 * @return {Rube}
 * @api public
 */

Rube.plugin = function(name, fn) {
  if (arguments.length == 1) {
    fn = name;
    name = fn.name;
  }

  if (!name) throw new Error('Rube.plugin(name, fn) requires a name');

  // add the method
  this.prototype[name.toLowerCase()] = function() {
    var ret = fn.apply(null, arguments);
    this._pipeline.push(ret || noop);
    return this;
  };

  return this;
}

/**
 * Add a plugin a rube instance
 *
 * @param {Function} fn
 * @return {Rube}
 * @api public
 */

Rube.prototype.use = function(fn) {
  this._pipeline.push(fn);
  return this;
};

/**
 * Add a custom error message
 *
 * @param {Mixed} msg
 * @return {Rube}
 */

Rube.prototype.message = function(msg) {
  this._message = 'string' == typeof msg
    ? function() { return new TypeError(msg); }
    : msg instanceof Error
    ? function() { return msg; }
    : msg;

  return this;
};

/**
 * Bundled plugins
 */

Rube.plugin('default', require('./lib/default.js'));
Rube.plugin('required', require('./lib/required.js'));
Rube.plugin('between', require('./lib/between.js'));
Rube.plugin('format', require('./lib/format.js'));
Rube.plugin('assert', require('./lib/assert.js'));
Rube.plugin('cast', require('./lib/cast.js'));
Rube.plugin('type', require('./lib/type.js'));
