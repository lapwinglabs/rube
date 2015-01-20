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
