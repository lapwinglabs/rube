/**
 * Module Dependencies
 */

var getProto = Object.getPrototypeOf;
var Step = require('step.js');

/**
 * Export `validate`
 */

module.exports = Validate;

/**
 * Validate the fields
 */

function Validate(ctx, fn) {
  var proto = getProto(ctx);

  function validate(actual, done) {
    return fn
      ? fn.call(validate, actual, next)
      : Step(ctx.pipeline).run(actual, next);

    function next(err, val) {
      if (err) done(validate.message() || err)
      else done(null, val);
    }
  };

  for (var k in proto) validate[k] = proto[k];
  validate.pipeline = ctx.pipeline;

  return validate;
}
