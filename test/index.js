/**
 * Module Dependencies
 */

var assert = require('assert');
var Rube = require('..');

/**
 * Tests
 */

describe('rube', function() {

  describe('rube.assert()', function() {
    it('should test regular expressions', function() {
      var rube = Rube()
        .assert(/@/);

      rube('mattlapwinglabs.com', function(err) {
        assert(err.message == '"mattlapwinglabs.com" does not match "/@/"');
      });
    })

    it('should work with functions', function() {
      var rube = Rube()
        .assert(function(value) {
          return value == 10;
        });

      rube(15, function(err) {
        assert(err.message == 'false == true');
      })
    });

    it('should work with async functions', function(done) {
      var rube = Rube()
        .assert(function(value, next) {
          setTimeout(function() {
            next(null, value == 10);
          }, 0)
        });

      rube(15, function(err) {
        assert(err.message == 'false == true');
        done();
      })
    })

    it('should work with async functions', function(done) {
      var rube = Rube()
        .assert(function(value, next) {
          setTimeout(function() {
            next(new Error('some error'));
          }, 0)
        });

      rube(15, function(err) {
        assert(err.message == 'some error');
        done();
      })
    })
  })

  describe('rube.between(min, max)', function() {
    it('should enforce in between', function(done) {
      var rube = Rube()
        .between(1, 5)

      rube('hi', function(err, v) {
        assert(!err);
        assert('hi' == v);
        done();
      })
    })

    it('should work with strings', function(done) {
      var rube = Rube()
        .between(4, 10)

      rube('hi', function(err) {
        assert(err.message == 'length must be greater than or equal to 4');
        next();
      })

      rube('omg hi this is cool', function(err) {
        assert(err.message = 'length must be less than or equal to 10');
        next();
      });

      var pending = 2;
      function next() {
        if (!--pending) return done();
      }
    })

    it('should work with numbers', function(done) {
      var rube = Rube()
        .between(1, 6)

      rube(0, function(err) {
        assert(err.message == 'length must be greater than or equal to 1');
        next();
      })

      rube(7, function(err) {
        assert(err.message == 'length must be less than or equal to 6');
        next();
      })

      var pending = 2;
      function next() {
        if (!--pending) return done();
      }
    })
  })

  describe('rube.message(msg)', function() {
    it('should provide custom error', function(done) {
      var rube = Rube()
        .type(String)
        .message('value must be a string');

      rube(5, function(err) {
        assert(err instanceof Error);
        assert.equal(err.message, 'value must be a string')
        done();
      })
    })

    it('should work with actual errors', function(done) {
      var rube = Rube()
        .type(String)
        .message(new TypeError('value must be a string'));

      rube(5, function(err) {
        assert(err instanceof Error);
        assert.equal(err.message, 'value must be a string')
        done();
      })
    })

    it('should work with functions', function(done) {
      var rube = Rube()
        .type(String)
        .message(function(err) {
          assert(err instanceof Error);
          return err;
        });

      rube(5, function(err) {
        assert(err instanceof Error);
        assert.equal(err.message, '5 is not a string')
        done();
      })
    })
  })

  describe('rube.required()', function() {
    it('should throw on empty strings', function() {
      var rube = Rube().required();
      rube('', function(err, v) {
        assert.equal(err.message, 'value cannot be blank');
      });
    })

    it('should throw on undefined', function() {
      var rube = Rube().required();
      rube(undefined, function(err, v) {
        assert.equal(err.message, 'value must be defined');
      });
    })
  })

})
