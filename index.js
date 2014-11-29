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
    Step(pipeline).run(actual, fn);
  }

  rube._pipeline = pipeline;

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

  if (!name) throw new Error('Rube.attach([name], fn) requires a name or fn.name');

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
 * Bundled plugins
 */

Rube.plugin(require('./lib/default.js'));
Rube.plugin(require('./lib/require.js'));
Rube.plugin(require('./lib/format.js'));
Rube.plugin(require('./lib/cast.js'));
Rube.plugin(require('./lib/type.js'));
