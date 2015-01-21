try {
  module.exports = require('node-only');
} catch (e) {
  module.exports = require('only');
}
