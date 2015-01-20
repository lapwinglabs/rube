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
