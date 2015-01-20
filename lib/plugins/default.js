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
