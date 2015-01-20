(function outer(modules, cache, entries){

  /**
   * Global
   */

  var global = (function(){ return this; })();

  /**
   * Require `name`.
   *
   * @param {String} name
   * @param {Boolean} jumped
   * @api public
   */

  function require(name, jumped){
    if (cache[name]) return cache[name].exports;
    if (modules[name]) return call(name, require);
    throw new Error('cannot find module "' + name + '"');
  }

  /**
   * Call module `id` and cache it.
   *
   * @param {Number} id
   * @param {Function} require
   * @return {Function}
   * @api private
   */

  function call(id, require){
    var m = cache[id] = { exports: {} };
    var mod = modules[id];
    var name = mod[2];
    var fn = mod[0];

    fn.call(m.exports, function(req){
      var dep = modules[id][1][req];
      return require(dep ? dep : req);
    }, m, m.exports, outer, modules, cache, entries);

    // expose as `name`.
    if (name) cache[name] = cache[id];

    return cache[id].exports;
  }

  /**
   * Require all entries exposing them on global if needed.
   */

  for (var id in entries) {
    if (entries[id]) {
      global[entries[id]] = require(id);
    } else {
      require(id);
    }
  }

  /**
   * Duo flag.
   */

  require.duo = true;

  /**
   * Expose cache.
   */

  require.cache = cache;

  /**
   * Expose modules
   */

  require.modules = modules;

  /**
   * Return newest require.
   */

   return require;
})({
1: [function(require, module, exports) {
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

}, {"./lib/utils/error":2,"./lib/utils/type":3,"sliced":4,"step.js":5,"batch":6,"./lib/array":7,"./lib/number":8,"./lib/object":9,"./lib/string":10,"./lib/any":11}],
2: [function(require, module, exports) {
/**
 * Module Dependencies
 */

var keys = Object.keys;

/**
 * Export `error`
 */

module.exports = error;

/**
 * Format the errors into a single error
 *
 * TODO: create a custom error
 *
 * @param {Array} arr
 * @return {Error}
 */

function error(errors, actual) {
  // format the object
  actual = JSON.stringify(actual, true, 2).split('\n').map(function(line) {
    return '     |  ' + line;
  }).join('\n');

  // format the errors
  var msg = keys(errors).map(function(error, i) {
    return '     |  ' + (i + 1) + '. ' + error + ': ' + errors[error].message;
  }).join('\n');

  var err = new Error('\n     |\n     |  Rube Schema Validation Error\n     |\n' + actual + '\n     |\n' + msg + '\n     |\n');
  err.fields = errors;
  return err;
}

}, {}],
3: [function(require, module, exports) {
try {
  var t = require('type');
} catch (e) {
  var t = require('type-component');
}

/**
 * Expose `type`
 */

module.exports = type;

/**
 * Get the type
 *
 * @param {Mixed} val
 * @return {String} type
 */

function type(val) {
  switch(val) {
    case undefined: return 'undefined';
    case Function: return 'function';
    case Boolean: return 'boolean';
    case Number: return 'number';
    case String: return 'string';
    case RegExp: return 'regexp';
    case Object: return 'object';
    case Array: return 'Array';
    case Date: return 'date';
    case null: return 'null';
    case NaN: return 'nan';
    default: return t(val);
  }
}

}, {"type":12}],
12: [function(require, module, exports) {

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object String]': return 'string';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val && val.nodeType === 1) return 'element';
  if (val === Object(val)) return 'object';

  return typeof val;
};

}, {}],
4: [function(require, module, exports) {

/**
 * An Array.prototype.slice.call(arguments) alternative
 *
 * @param {Object} args something with a length
 * @param {Number} slice
 * @param {Number} sliceEnd
 * @api public
 */

module.exports = function (args, slice, sliceEnd) {
  var ret = [];
  var len = args.length;

  if (0 === len) return ret;

  var start = slice < 0
    ? Math.max(0, slice + len)
    : slice || 0;

  if (sliceEnd !== undefined) {
    len = sliceEnd < 0
      ? sliceEnd + len
      : sliceEnd
  }

  while (len-- > start) {
    ret[len - start] = args[len];
  }

  return ret;
}


}, {}],
5: [function(require, module, exports) {
/**
 * Module Dependencies
 */

var slice = Array.prototype.slice;
var noop = function() {};
var co = require('co');

/**
 * Export `Step`
 */

module.exports = Step;

/**
 * Initialize `Step`
 *
 * @param {Mixed} fn (optional)
 * @return {Step}
 * @api public
 */

function Step(fn) {
  if (!(this instanceof Step)) return new Step(fn);
  this.fns = [];
  this.length = 0;
  fn && this.use(fn);
}

/**
 * Add a step
 *
 * @param {Function|Generator|Array} fn
 * @return {Step}
 * @api public
 */

Step.prototype.use = function(fn) {
  if (fn instanceof Step) this.fns = this.fns.concat(fn.fns);
  else if (fn instanceof Array) this.fns = this.fns.concat(fn);
  else this.fns.push(fn);
  this.length = this.fns.length;
  return this;
};

/**
 * Run the steps
 *
 * @param {Args...} args
 * @param {Function} fn
 * @api public
 */

Step.prototype.run = function() {
  var args = slice.call(arguments);
  var fns = slice.call(this.fns);
  var len = args.length;
  var ctx = this;

  // callback or noop
  var done = 'function' == typeof args[len - 1]
    ? args.pop()
    : noop;

  // kick us off
  // next tick to ensure we're async (no double callbacks)
  setTimeout(function() {
    call(fns.shift(), args);
  }, 0);

  // next
  function next(err) {
    if (err) return done(err);
    var arr = slice.call(arguments, 1);
    args = extend(args, arr);
    var fn = fns.shift();
    call(fn, args);
  }

  // call
  function call(fn, args) {
    if (!fn) {
      return done.apply(done, [null].concat(args));
    } else if (fn.length > args.length) {
      fn.apply(ctx, args.concat(next));
    } else if (generator(fn)) {
      co(fn).apply(ctx, args.concat(next));
    } else {
      var ret = fn.apply(ctx, args);
      ret instanceof Error ? next(ret) : next(null, ret);
    }
  }
};

/**
 * Pull values from another array
 * @param  {Array} a
 * @param  {Array} b
 * @return {Array}
 */

function extend(a, b) {
  var len = a.length;
  var out = [];

  for (var i = 0; i < len; i++) {
    out[i] = undefined === b[i] ? a[i] : b[i];
  }

  return out;
}

/**
 * Is generator?
 *
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function generator(value){
  return value
    && value.constructor
    && 'GeneratorFunction' == value.constructor.name;
}

}, {"co":13}],
13: [function(require, module, exports) {

/**
 * slice() reference.
 */

var slice = Array.prototype.slice;

/**
 * Expose `co`.
 */

module.exports = co['default'] = co.co = co;

/**
 * Wrap the given generator `fn` into a
 * function that returns a promise.
 * This is a separate function so that
 * every `co()` call doesn't create a new,
 * unnecessary closure.
 *
 * @param {GeneratorFunction} fn
 * @return {Function}
 * @api public
 */

co.wrap = function (fn) {
  return function () {
    return co.call(this, fn.apply(this, arguments));
  };
};

/**
 * Execute the generator function or a generator
 * and return a promise.
 *
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

function co(gen) {
  var ctx = this;
  if (typeof gen === 'function') gen = gen.call(this);
  return Promise.resolve(onFulfilled());

  /**
   * @param {Mixed} res
   * @return {Promise}
   * @api private
   */

  function onFulfilled(res) {
    var ret;
    try {
      ret = gen.next(res);
    } catch (e) {
      return Promise.reject(e);
    }
    return next(ret);
  }

  /**
   * @param {Error} err
   * @return {Promise}
   * @api private
   */

  function onRejected(err) {
    var ret;
    try {
      ret = gen.throw(err);
    } catch (e) {
      return Promise.reject(e);
    }
    return next(ret);
  }

  /**
   * Get the next value in the generator,
   * return a promise.
   *
   * @param {Object} ret
   * @return {Promise}
   * @api private
   */

  function next(ret) {
    if (ret.done) return Promise.resolve(ret.value);
    var value = toPromise.call(ctx, ret.value);
    if (value && isPromise(value)) return value.then(onFulfilled, onRejected);
    return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, '
      + 'but the following object was passed: "' + String(ret.value) + '"'));
  }
}

/**
 * Convert a `yield`ed value into a promise.
 *
 * @param {Mixed} obj
 * @return {Promise}
 * @api private
 */

function toPromise(obj) {
  if (!obj) return obj;
  if (isPromise(obj)) return obj;
  if (isGeneratorFunction(obj) || isGenerator(obj)) return co.call(this, obj);
  if ('function' == typeof obj) return thunkToPromise.call(this, obj);
  if (Array.isArray(obj)) return arrayToPromise.call(this, obj);
  if (isObject(obj)) return objectToPromise.call(this, obj);
  return obj;
}

/**
 * Convert a thunk to a promise.
 *
 * @param {Function}
 * @return {Promise}
 * @api private
 */

function thunkToPromise(fn) {
  var ctx = this;
  return new Promise(function (resolve, reject) {
    fn.call(ctx, function (err, res) {
      if (err) return reject(err);
      if (arguments.length > 2) res = slice.call(arguments, 1);
      resolve(res);
    });
  });
}

/**
 * Convert an array of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Array} obj
 * @return {Promise}
 * @api private
 */

function arrayToPromise(obj) {
  return Promise.all(obj.map(toPromise, this));
}

/**
 * Convert an object of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Object} obj
 * @return {Promise}
 * @api private
 */

function objectToPromise(obj){
  var results = new obj.constructor();
  var keys = Object.keys(obj);
  var promises = [];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var promise = toPromise.call(this, obj[key]);
    if (promise && isPromise(promise)) defer(promise, key);
    else results[key] = obj[key];
  }
  return Promise.all(promises).then(function () {
    return results;
  });

  function defer(promise, key) {
    // predefine the key in the result
    results[key] = undefined;
    promises.push(promise.then(function (res) {
      results[key] = res;
    }));
  }
}

/**
 * Check if `obj` is a promise.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isPromise(obj) {
  return 'function' == typeof obj.then;
}

/**
 * Check if `obj` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGenerator(obj) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

/**
 * Check if `obj` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGeneratorFunction(obj) {
  var constructor = obj.constructor;
  return constructor && 'GeneratorFunction' == constructor.name;
}

/**
 * Check for plain object.
 *
 * @param {Mixed} val
 * @return {Boolean}
 * @api private
 */

function isObject(val) {
  return Object == val.constructor;
}

}, {}],
6: [function(require, module, exports) {
/**
 * Module dependencies.
 */

try {
  var EventEmitter = require('events').EventEmitter;
} catch (err) {
  var Emitter = require('emitter');
}

/**
 * Noop.
 */

function noop(){}

/**
 * Expose `Batch`.
 */

module.exports = Batch;

/**
 * Create a new Batch.
 */

function Batch() {
  if (!(this instanceof Batch)) return new Batch;
  this.fns = [];
  this.concurrency(Infinity);
  this.throws(true);
  for (var i = 0, len = arguments.length; i < len; ++i) {
    this.push(arguments[i]);
  }
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

if (EventEmitter) {
  Batch.prototype.__proto__ = EventEmitter.prototype;
} else {
  Emitter(Batch.prototype);
}

/**
 * Set concurrency to `n`.
 *
 * @param {Number} n
 * @return {Batch}
 * @api public
 */

Batch.prototype.concurrency = function(n){
  this.n = n;
  return this;
};

/**
 * Queue a function.
 *
 * @param {Function} fn
 * @return {Batch}
 * @api public
 */

Batch.prototype.push = function(fn){
  this.fns.push(fn);
  return this;
};

/**
 * Set wether Batch will or will not throw up.
 *
 * @param  {Boolean} throws
 * @return {Batch}
 * @api public
 */
Batch.prototype.throws = function(throws) {
  this.e = !!throws;
  return this;
};

/**
 * Execute all queued functions in parallel,
 * executing `cb(err, results)`.
 *
 * @param {Function} cb
 * @return {Batch}
 * @api public
 */

Batch.prototype.end = function(cb){
  var self = this
    , total = this.fns.length
    , pending = total
    , results = []
    , errors = []
    , cb = cb || noop
    , fns = this.fns
    , max = this.n
    , throws = this.e
    , index = 0
    , done;

  // empty
  if (!fns.length) return cb(null, results);

  // process
  function next() {
    var i = index++;
    var fn = fns[i];
    if (!fn) return;
    var start = new Date;

    try {
      fn(callback);
    } catch (err) {
      callback(err);
    }

    function callback(err, res){
      if (done) return;
      if (err && throws) return done = true, cb(err);
      var complete = total - pending + 1;
      var end = new Date;

      results[i] = res;
      errors[i] = err;

      self.emit('progress', {
        index: i,
        value: res,
        error: err,
        pending: pending,
        total: total,
        complete: complete,
        percent: complete / total * 100 | 0,
        start: start,
        end: end,
        duration: end - start
      });

      if (--pending) next();
      else if(!throws) cb(errors, results);
      else cb(null, results);
    }
  }

  // concurrency
  for (var i = 0; i < fns.length; i++) {
    if (i == max) break;
    next();
  }

  return this;
};

}, {"emitter":14}],
14: [function(require, module, exports) {

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

}, {}],
7: [function(require, module, exports) {

}, {}],
8: [function(require, module, exports) {
/**
 * Module dependencies
 */

var type = require('./plugins/type');
var Step = require('step.js');
var any = require('./any');

/**
 * Export `number`
 */

module.exports = number;

/**
 * Initialize `number`
 */

function number(value) {
  if (!(this instanceof number)) return new number(value);
  var pipeline = this.pipeline = [];

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

number.prototype.__proto__ = any.prototype;

/**
 * between
 */

number.prototype.between = function() {
  this.pipeline.push(between(min, max));
  return this;
};

}, {"./plugins/type":15,"step.js":5,"./any":11}],
15: [function(require, module, exports) {
/**
 * Module dependencies
 */

var t = require('../utils/type');

/**
 * Export `Type`
 */

module.exports = Type;

/**
 * Initialize `Type`
 */

function Type(expected) {
  return function type(actual) {
    return undefined === actual || t(expected) == t(actual)
      ? actual
      : new TypeError('"' + actual + '" is not a "' + t(expected) + '"');
  }
}

}, {"../utils/type":3}],
11: [function(require, module, exports) {
/**
 * Module dependencies
 */

var defaults = require('./plugins/default');
var assert = require('./plugins/assert');
var type = require('./plugins/type');
var cast = require('./plugins/cast');
var Step = require('step.js');

/**
 * Export `any`
 */

module.exports = any;

/**
 * Initialize `any`
 */

function any(value) {
  if (!(this instanceof any)) return new any(value);
  var pipeline = this.pipeline = [];
  arguments.length && pipeline.push(type(value));

  function validate(actual, fn) {
    Step(pipeline).run(actual, fn);
  }

  for (var k in any.prototype) validate[k] = any.prototype[k];
  validate.pipeline = pipeline;

  return validate;
}

/**
 * Rube value
 */

any.prototype.rube = true;

/**
 * use
 */

any.prototype.use = function(fn) {
  this.pipeline.push(fn);
  return this;
}

/**
 * assert
 */

any.prototype.assert = function(expected, message) {
  this.pipeline.push(assert(expected, message));
  return this;
};

/**
 * default
 */

any.prototype.default = function(def) {
  this.pipeline.push(defaults(def));
  return this;
};

/**
 * cast
 */

any.prototype.cast = function(from, to) {
  this.pipeline.push(cast(from, to));
  return this;
};

}, {"./plugins/default":16,"./plugins/assert":17,"./plugins/type":15,"./plugins/cast":18,"step.js":5}],
16: [function(require, module, exports) {
/**
 * Export `Default`
 */

module.exports = Default;

/**
 * Set the value if `undefined`
 */

function Default(def) {
  return function _default(value) {
    return undefined === value ? def : value;
  };
}

}, {}],
17: [function(require, module, exports) {
/**
 * Module dependencies
 */

var fmt = require('../utils/format');
var type = require('../utils/type');
var asserting = require('assert');
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

  return function assert(value) {
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
        asserting(v);
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
    asserting(expected.test(value), msg);
  }
}

/**
 * Deep equality on objects and arrays
 */

function object(expected, msg) {
  return function(value) {
    asserting.deepEqual(value, expected, msg);
  }
}

/**
 * Equality on everything else
 */

function misc(expected, msg) {
  return function(value) {
    asserting.equal(value, expected, msg);
  }
}

}, {"../utils/format":19,"../utils/type":3,"assert":20,"wrap-fn":21}],
19: [function(require, module, exports) {
try {
  module.exports = require('fmt');
} catch (e) {
  module.exports = require('util').format;
}

}, {"fmt":22}],
22: [function(require, module, exports) {

/**
 * Export `fmt`
 */

module.exports = fmt;

/**
 * Formatters
 */

fmt.o = JSON.stringify;
fmt.s = String;
fmt.d = parseInt;

/**
 * Format the given `str`.
 *
 * @param {String} str
 * @param {...} args
 * @return {String}
 * @api public
 */

function fmt(str){
  var args = [].slice.call(arguments, 1);
  var j = 0;

  return str.replace(/%([a-z])/gi, function(_, f){
    return fmt[f]
      ? fmt[f](args[j++])
      : _ + f;
  });
}

}, {}],
20: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var equals = require('equals');
var fmt = require('fmt');
var stack = require('stack');

/**
 * Assert `expr` with optional failure `msg`.
 *
 * @param {Mixed} expr
 * @param {String} [msg]
 * @api public
 */

module.exports = exports = function (expr, msg) {
  if (expr) return;
  throw error(msg || message());
};

/**
 * Assert `actual` is weak equal to `expected`.
 *
 * @param {Mixed} actual
 * @param {Mixed} expected
 * @param {String} [msg]
 * @api public
 */

exports.equal = function (actual, expected, msg) {
  if (actual == expected) return;
  throw error(msg || fmt('Expected %o to equal %o.', actual, expected), actual, expected);
};

/**
 * Assert `actual` is not weak equal to `expected`.
 *
 * @param {Mixed} actual
 * @param {Mixed} expected
 * @param {String} [msg]
 * @api public
 */

exports.notEqual = function (actual, expected, msg) {
  if (actual != expected) return;
  throw error(msg || fmt('Expected %o not to equal %o.', actual, expected));
};

/**
 * Assert `actual` is deep equal to `expected`.
 *
 * @param {Mixed} actual
 * @param {Mixed} expected
 * @param {String} [msg]
 * @api public
 */

exports.deepEqual = function (actual, expected, msg) {
  if (equals(actual, expected)) return;
  throw error(msg || fmt('Expected %o to deeply equal %o.', actual, expected), actual, expected);
};

/**
 * Assert `actual` is not deep equal to `expected`.
 *
 * @param {Mixed} actual
 * @param {Mixed} expected
 * @param {String} [msg]
 * @api public
 */

exports.notDeepEqual = function (actual, expected, msg) {
  if (!equals(actual, expected)) return;
  throw error(msg || fmt('Expected %o not to deeply equal %o.', actual, expected));
};

/**
 * Assert `actual` is strict equal to `expected`.
 *
 * @param {Mixed} actual
 * @param {Mixed} expected
 * @param {String} [msg]
 * @api public
 */

exports.strictEqual = function (actual, expected, msg) {
  if (actual === expected) return;
  throw error(msg || fmt('Expected %o to strictly equal %o.', actual, expected), actual, expected);
};

/**
 * Assert `actual` is not strict equal to `expected`.
 *
 * @param {Mixed} actual
 * @param {Mixed} expected
 * @param {String} [msg]
 * @api public
 */

exports.notStrictEqual = function (actual, expected, msg) {
  if (actual !== expected) return;
  throw error(msg || fmt('Expected %o not to strictly equal %o.', actual, expected));
};

/**
 * Assert `block` throws an `error`.
 *
 * @param {Function} block
 * @param {Function} [error]
 * @param {String} [msg]
 * @api public
 */

exports.throws = function (block, err, msg) {
  var threw;
  try {
    block();
  } catch (e) {
    threw = e;
  }

  if (!threw) throw error(msg || fmt('Expected %s to throw an error.', block.toString()));
  if (err && !(threw instanceof err)) {
    throw error(msg || fmt('Expected %s to throw an %o.', block.toString(), err));
  }
};

/**
 * Assert `block` doesn't throw an `error`.
 *
 * @param {Function} block
 * @param {Function} [error]
 * @param {String} [msg]
 * @api public
 */

exports.doesNotThrow = function (block, err, msg) {
  var threw;
  try {
    block();
  } catch (e) {
    threw = e;
  }

  if (threw) throw error(msg || fmt('Expected %s not to throw an error.', block.toString()));
  if (err && (threw instanceof err)) {
    throw error(msg || fmt('Expected %s not to throw an %o.', block.toString(), err));
  }
};

/**
 * Create a message from the call stack.
 *
 * @return {String}
 * @api private
 */

function message() {
  if (!Error.captureStackTrace) return 'assertion failed';
  var callsite = stack()[2];
  var fn = callsite.getFunctionName();
  var file = callsite.getFileName();
  var line = callsite.getLineNumber() - 1;
  var col = callsite.getColumnNumber() - 1;
  var src = get(file);
  line = src.split('\n')[line].slice(col);
  var m = line.match(/assert\((.*)\)/);
  return m && m[1].trim();
}

/**
 * Load contents of `script`.
 *
 * @param {String} script
 * @return {String}
 * @api private
 */

function get(script) {
  var xhr = new XMLHttpRequest;
  xhr.open('GET', script, false);
  xhr.send(null);
  return xhr.responseText;
}

/**
 * Error with `msg`, `actual` and `expected`.
 *
 * @param {String} msg
 * @param {Mixed} actual
 * @param {Mixed} expected
 * @return {Error}
 */

function error(msg, actual, expected){
  var err = new Error(msg);
  err.showDiff = 3 == arguments.length;
  err.actual = actual;
  err.expected = expected;
  return err;
}

}, {"equals":23,"fmt":22,"stack":24}],
23: [function(require, module, exports) {
var type = require('type')

// (any, any, [array]) -> boolean
function equal(a, b, memos){
  // All identical values are equivalent
  if (a === b) return true
  var fnA = types[type(a)]
  var fnB = types[type(b)]
  return fnA && fnA === fnB
    ? fnA(a, b, memos)
    : false
}

var types = {}

// (Number) -> boolean
types.number = function(a, b){
  return a !== a && b !== b/*Nan check*/
}

// (function, function, array) -> boolean
types['function'] = function(a, b, memos){
  return a.toString() === b.toString()
    // Functions can act as objects
    && types.object(a, b, memos)
    && equal(a.prototype, b.prototype)
}

// (date, date) -> boolean
types.date = function(a, b){
  return +a === +b
}

// (regexp, regexp) -> boolean
types.regexp = function(a, b){
  return a.toString() === b.toString()
}

// (DOMElement, DOMElement) -> boolean
types.element = function(a, b){
  return a.outerHTML === b.outerHTML
}

// (textnode, textnode) -> boolean
types.textnode = function(a, b){
  return a.textContent === b.textContent
}

// decorate `fn` to prevent it re-checking objects
// (function) -> function
function memoGaurd(fn){
  return function(a, b, memos){
    if (!memos) return fn(a, b, [])
    var i = memos.length, memo
    while (memo = memos[--i]) {
      if (memo[0] === a && memo[1] === b) return true
    }
    return fn(a, b, memos)
  }
}

types['arguments'] =
types.array = memoGaurd(arrayEqual)

// (array, array, array) -> boolean
function arrayEqual(a, b, memos){
  var i = a.length
  if (i !== b.length) return false
  memos.push([a, b])
  while (i--) {
    if (!equal(a[i], b[i], memos)) return false
  }
  return true
}

types.object = memoGaurd(objectEqual)

// (object, object, array) -> boolean
function objectEqual(a, b, memos) {
  if (typeof a.equal == 'function') {
    memos.push([a, b])
    return a.equal(b, memos)
  }
  var ka = getEnumerableProperties(a)
  var kb = getEnumerableProperties(b)
  var i = ka.length

  // same number of properties
  if (i !== kb.length) return false

  // although not necessarily the same order
  ka.sort()
  kb.sort()

  // cheap key test
  while (i--) if (ka[i] !== kb[i]) return false

  // remember
  memos.push([a, b])

  // iterate again this time doing a thorough check
  i = ka.length
  while (i--) {
    var key = ka[i]
    if (!equal(a[key], b[key], memos)) return false
  }

  return true
}

// (object) -> array
function getEnumerableProperties (object) {
  var result = []
  for (var k in object) if (k !== 'constructor') {
    result.push(k)
  }
  return result
}

module.exports = equal

}, {"type":25}],
25: [function(require, module, exports) {

var toString = {}.toString
var DomNode = typeof window != 'undefined'
  ? window.Node
  : Function

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = exports = function(x){
  var type = typeof x
  if (type != 'object') return type
  type = types[toString.call(x)]
  if (type) return type
  if (x instanceof DomNode) switch (x.nodeType) {
    case 1:  return 'element'
    case 3:  return 'text-node'
    case 9:  return 'document'
    case 11: return 'document-fragment'
    default: return 'dom-node'
  }
}

var types = exports.types = {
  '[object Function]': 'function',
  '[object Date]': 'date',
  '[object RegExp]': 'regexp',
  '[object Arguments]': 'arguments',
  '[object Array]': 'array',
  '[object String]': 'string',
  '[object Null]': 'null',
  '[object Undefined]': 'undefined',
  '[object Number]': 'number',
  '[object Boolean]': 'boolean',
  '[object Object]': 'object',
  '[object Text]': 'text-node',
  '[object Uint8Array]': 'bit-array',
  '[object Uint16Array]': 'bit-array',
  '[object Uint32Array]': 'bit-array',
  '[object Uint8ClampedArray]': 'bit-array',
  '[object Error]': 'error',
  '[object FormData]': 'form-data',
  '[object File]': 'file',
  '[object Blob]': 'blob'
}

}, {}],
24: [function(require, module, exports) {

/**
 * Expose `stack()`.
 */

module.exports = stack;

/**
 * Return the stack.
 *
 * @return {Array}
 * @api public
 */

function stack() {
  var orig = Error.prepareStackTrace;
  Error.prepareStackTrace = function(_, stack){ return stack; };
  var err = new Error;
  Error.captureStackTrace(err, arguments.callee);
  var stack = err.stack;
  Error.prepareStackTrace = orig;
  return stack;
}
}, {}],
21: [function(require, module, exports) {
/**
 * Module Dependencies
 */

var noop = function(){};
var co = require('co');

/**
 * Export `wrap-fn`
 */

module.exports = wrap;

/**
 * Wrap a function to support
 * sync, async, and gen functions.
 *
 * @param {Function} fn
 * @param {Function} done
 * @return {Function}
 * @api public
 */

function wrap(fn, done) {
  done = once(done || noop);

  return function() {
    // prevents arguments leakage
    // see https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
    var i = arguments.length;
    var args = new Array(i);
    while (i--) args[i] = arguments[i];

    var ctx = this;

    // done
    if (!fn) {
      return done.apply(ctx, [null].concat(args));
    }

    // async
    if (fn.length > args.length) {
      // NOTE: this only handles uncaught synchronous errors
      try {
        return fn.apply(ctx, args.concat(done));
      } catch (e) {
        return done(e);
      }
    }

    // generator
    if (generator(fn)) {
      return co(fn).apply(ctx, args.concat(done));
    }

    // sync
    return sync(fn, done).apply(ctx, args);
  }
}

/**
 * Wrap a synchronous function execution.
 *
 * @param {Function} fn
 * @param {Function} done
 * @return {Function}
 * @api private
 */

function sync(fn, done) {
  return function () {
    var ret;

    try {
      ret = fn.apply(this, arguments);
    } catch (err) {
      return done(err);
    }

    if (promise(ret)) {
      ret.then(function (value) { done(null, value); }, done);
    } else {
      ret instanceof Error ? done(ret) : done(null, ret);
    }
  }
}

/**
 * Is `value` a generator?
 *
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function generator(value) {
  return value
    && value.constructor
    && 'GeneratorFunction' == value.constructor.name;
}


/**
 * Is `value` a promise?
 *
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function promise(value) {
  return value && 'function' == typeof value.then;
}

/**
 * Once
 */

function once(fn) {
  return function() {
    var ret = fn.apply(this, arguments);
    fn = noop;
    return ret;
  };
}

}, {"co":26}],
26: [function(require, module, exports) {

/**
 * slice() reference.
 */

var slice = Array.prototype.slice;

/**
 * Expose `co`.
 */

module.exports = co;

/**
 * Wrap the given generator `fn` and
 * return a thunk.
 *
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

function co(fn) {
  var isGenFun = isGeneratorFunction(fn);

  return function (done) {
    var ctx = this;

    // in toThunk() below we invoke co()
    // with a generator, so optimize for
    // this case
    var gen = fn;

    // we only need to parse the arguments
    // if gen is a generator function.
    if (isGenFun) {
      var args = slice.call(arguments), len = args.length;
      var hasCallback = len && 'function' == typeof args[len - 1];
      done = hasCallback ? args.pop() : error;
      gen = fn.apply(this, args);
    } else {
      done = done || error;
    }

    next();

    // #92
    // wrap the callback in a setImmediate
    // so that any of its errors aren't caught by `co`
    function exit(err, res) {
      setImmediate(function(){
        done.call(ctx, err, res);
      });
    }

    function next(err, res) {
      var ret;

      // multiple args
      if (arguments.length > 2) res = slice.call(arguments, 1);

      // error
      if (err) {
        try {
          ret = gen.throw(err);
        } catch (e) {
          return exit(e);
        }
      }

      // ok
      if (!err) {
        try {
          ret = gen.next(res);
        } catch (e) {
          return exit(e);
        }
      }

      // done
      if (ret.done) return exit(null, ret.value);

      // normalize
      ret.value = toThunk(ret.value, ctx);

      // run
      if ('function' == typeof ret.value) {
        var called = false;
        try {
          ret.value.call(ctx, function(){
            if (called) return;
            called = true;
            next.apply(ctx, arguments);
          });
        } catch (e) {
          setImmediate(function(){
            if (called) return;
            called = true;
            next(e);
          });
        }
        return;
      }

      // invalid
      next(new TypeError('You may only yield a function, promise, generator, array, or object, '
        + 'but the following was passed: "' + String(ret.value) + '"'));
    }
  }
}

/**
 * Convert `obj` into a normalized thunk.
 *
 * @param {Mixed} obj
 * @param {Mixed} ctx
 * @return {Function}
 * @api private
 */

function toThunk(obj, ctx) {

  if (isGeneratorFunction(obj)) {
    return co(obj.call(ctx));
  }

  if (isGenerator(obj)) {
    return co(obj);
  }

  if (isPromise(obj)) {
    return promiseToThunk(obj);
  }

  if ('function' == typeof obj) {
    return obj;
  }

  if (isObject(obj) || Array.isArray(obj)) {
    return objectToThunk.call(ctx, obj);
  }

  return obj;
}

/**
 * Convert an object of yieldables to a thunk.
 *
 * @param {Object} obj
 * @return {Function}
 * @api private
 */

function objectToThunk(obj){
  var ctx = this;
  var isArray = Array.isArray(obj);

  return function(done){
    var keys = Object.keys(obj);
    var pending = keys.length;
    var results = isArray
      ? new Array(pending) // predefine the array length
      : new obj.constructor();
    var finished;

    if (!pending) {
      setImmediate(function(){
        done(null, results)
      });
      return;
    }

    // prepopulate object keys to preserve key ordering
    if (!isArray) {
      for (var i = 0; i < pending; i++) {
        results[keys[i]] = undefined;
      }
    }

    for (var i = 0; i < keys.length; i++) {
      run(obj[keys[i]], keys[i]);
    }

    function run(fn, key) {
      if (finished) return;
      try {
        fn = toThunk(fn, ctx);

        if ('function' != typeof fn) {
          results[key] = fn;
          return --pending || done(null, results);
        }

        fn.call(ctx, function(err, res){
          if (finished) return;

          if (err) {
            finished = true;
            return done(err);
          }

          results[key] = res;
          --pending || done(null, results);
        });
      } catch (err) {
        finished = true;
        done(err);
      }
    }
  }
}

/**
 * Convert `promise` to a thunk.
 *
 * @param {Object} promise
 * @return {Function}
 * @api private
 */

function promiseToThunk(promise) {
  return function(fn){
    promise.then(function(res) {
      fn(null, res);
    }, fn);
  }
}

/**
 * Check if `obj` is a promise.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isPromise(obj) {
  return obj && 'function' == typeof obj.then;
}

/**
 * Check if `obj` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGenerator(obj) {
  return obj && 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

/**
 * Check if `obj` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGeneratorFunction(obj) {
  return obj && obj.constructor && 'GeneratorFunction' == obj.constructor.name;
}

/**
 * Check for plain object.
 *
 * @param {Mixed} val
 * @return {Boolean}
 * @api private
 */

function isObject(val) {
  return val && Object == val.constructor;
}

/**
 * Throw `err` in a new stack.
 *
 * This is used when co() is invoked
 * without supplying a callback, which
 * should only be for demonstrational
 * purposes.
 *
 * @param {Error} err
 * @api private
 */

function error(err) {
  if (!err) return;
  setImmediate(function(){
    throw err;
  });
}

}, {}],
18: [function(require, module, exports) {
/**
 * Module Dependencies
 */

var type = require('../utils/type.js');
var typecast = require('typecast');

/**
 * Export `cast`
 */

module.exports = Cast;

/**
 * Initialize `cast`
 *
 * @param {Mixed} from (optional)
 * @param {Mixed} to
 */

function Cast(from, to) {
  if (1 == arguments.length) {
    to = type(from);
    from = false;
  } else {
    from = type(from);
    to = type(to);
  }

  return function cast(value) {
    return !from || type(value) == from
      ? typecast(value, to)
      : value;
  }
}

}, {"../utils/type.js":3,"typecast":27}],
27: [function(require, module, exports) {
module.exports = typecast;

/**
 * Cast given `val` to `type`
 *
 * @param {Mixed} val
 * @param {String} type
 * @api public
 */

function typecast (val, type) {
  var fn = typecast[type];
  if (typeof fn != 'function') throw new Error('cannot cast to ' + type);
  return fn(val);
}

/**
 * Cast `val` to `String`
 *
 * @param {Mixed} val
 * @api public
 */

typecast.string = function (val) {
  if (null == val) return '';
  return val.toString();
};

/**
 * Cast `val` to `Number`
 *
 * @param {Mixed} val
 * @api public
 */

typecast.number = function (val) {
  var num = parseFloat(val);
  return isNaN(num)
    ? 0
    : num;
};

/**
 * Cast `val` to a`Date`
 *
 * @param {Mixed} val
 * @api public
 */

typecast.date = function (val) {
  var date = new Date(val);
  return isNaN(date.valueOf())
    ? new Date(0)
    : date;
};

/**
 * Cast `val` to `Array`
 *
 * @param {Mixed} val
 * @api public
 */

typecast.array = function (val) {
  if (val == null) return [];
  if (val instanceof Array) return val;
  if (typeof val != 'string') return [val];

  var arr = val.split(',');
  for (var i = 0; i < arr.length; i++) {
    arr[i] = arr[i].trim();
  }

  return arr;
};

/**
 * Cast `val` to `Boolean`
 *
 * @param {Mixed} val
 * @api public
 */

typecast.boolean = function (val) {
  return !! val && val !== 'false' && val !== '0';
};
}, {}],
9: [function(require, module, exports) {
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

}, {"./utils/error":2,"./plugins/type":15,"dot-prop":28,"sliced":4,"step.js":5,"batch":6,"./any":11}],
28: [function(require, module, exports) {
'use strict';

function isObject(x) {
	return typeof x === 'object' && x !== null;
}

module.exports = function getProp(obj, path) {
	if (!isObject(obj) || typeof path !== 'string') {
		return obj;
	}

	path = path.split('.');

	return getProp(obj[path.shift()], path.join('.'));
};

}, {}],
10: [function(require, module, exports) {
/**
 * Module dependencies
 */

var between = require('./plugins/between');
var format = require('./plugins/format');
var type = require('./plugins/type');
var trim = require('./plugins/trim');
var Step = require('step.js');
var any = require('./any');

/**
 * Export `string`
 */

module.exports = string;

/**
 * Initialize `string`
 */

function string(value) {
  if (!(this instanceof string)) return new string(value);
  var pipeline = [type(String)];

  function validate(actual, fn) {
    Step(pipeline).run(actual, fn);
  }

  for (var k in string.prototype) validate[k] = string.prototype[k];
  validate.pipeline = pipeline;

  return validate;
}

/**
 * Inherit from `any`
 */

string.prototype.__proto__ = any.prototype;

/**
 * Between
 */

string.prototype.between = function(min, max) {
  this.pipeline.push(between(min, max));
  return this;
};

/**
 * trim
 */

string.prototype.trim = function() {
  this.pipeline.push(trim());
  return this;
};

/**
 * format
 */

string.prototype.format = function(formatter, format) {
  this.pipeline.push(format(formatter, format));
  return this;
};


}, {"./plugins/between":29,"./plugins/format":30,"./plugins/type":15,"./plugins/trim":31,"step.js":5,"./any":11}],
29: [function(require, module, exports) {
/**
 * Module dependencies
 */

var fmt = require('../utils/format');

/**
 * Errors
 */

var minmsg = 'length must be greater than or equal to %s';
var maxmsg = 'length must be less than or equal to %s';

/**
 * Export `Between`
 */

module.exports = Between;

/**
 * Between a value. Cannot be `undefined`.
 */

function Between(min, max) {
  return function between(value) {
    var len = value.length === undefined ? value : value.length;

    return len < min
      ? new RangeError(fmt(minmsg, min))
      : len > max
      ? new RangeError(fmt(maxmsg, max))
      : value;
  }
}

}, {"../utils/format":19}],
30: [function(require, module, exports) {
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

}, {"../utils/type.js":3}],
31: [function(require, module, exports) {
/**
 * Export `trim`
 */

module.exports = trim;

/**
 * Trim a string
 */

function trim() {
  return function(value) {
    return ('' + value).replace(/^(\s+|\s+)$/);
  }
}

}, {}]}, {}, {"1":"Rube"})
