try {
  module.exports = require('fmt');
} catch (e) {
  module.exports = require('util').format;
}
