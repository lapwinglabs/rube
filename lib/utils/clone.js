try {
  module.exports = require('component-clone');
} catch (e) {
  module.exports = require('clone');
}
