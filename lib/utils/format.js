try {
  module.exports = require('util').format;
} catch (e) {
  module.exports = require('fmt');
}
