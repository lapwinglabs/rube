/**
 * Module Dependencies
 */

var assert = require('assert');
var Rube = require('../');

/**
 * Regexp
 */

var remail = /\w+@\w+\.\w+/;
var rcurrency = /[^0-9\.]+/;


/**
 * Tests
 */

describe('Rube', function() {

  describe('Rube(String)', function() {
    describe('.between(min, max)', function() {
      it('.between(1, 1)', function(done) {
        var validate = Rube(String).between(1, 1);
        validate('a', done);
      });

      it('.between(1, 2)', function(done) {
        var validate = Rube(String).between(1, 2);
        validate('ab', done);
      });

      it('.between(1, 2) invalid', function(done) {
        var validate = Rube(String).between(1, 2);
        validate('abc', function(err) {
          assert(err);
          assert.equal('length must be less than or equal to 2', err.message);
          done();
        });
      });

      it('should support .format(formatter, str)', function(done) {
        var validate = Rube(String).format(/[^0-9\.]+/, '');
        validate('abc1.30', function(err, v) {
          if (err) return done(err);
          assert('1.30' == v);
          done();
        })
      })

      it('should be immutable', function(done) {
        var pending = 2;
        var rube = Rube(String);

        rube.between(1, 2)('a', function(err, v) {
          assert(!err);
          assert('a' == v);
          if (!--pending) done();
        });

        rube('abc', function(err, v) {
          assert(!err);
          assert('abc' == v);
          if (!--pending) done();
        });
      })
    });

    describe('.assert(expected)', function() {
      it('.assert(regexp)', function(done) {
        var validate = Rube(String).assert(remail, 'invalid email address');
        validate('matt@lapwinglabs.com', done);
      });

      it('.assert(regexp) invalid', function(done) {
        var validate = Rube(String).assert(remail, 'invalid email address');
        validate('mattlapwinglabs.com', function(err) {
          assert(err);
          assert.equal('invalid email address', err.message);
          done();
        });
      });
    });

    describe('.use(fn)', function() {
      it('should support custom sync functions', function(done) {
        var validate = Rube(String).use(function(v) {
          return v + ' world';
        });

        validate('hi', function(err, v) {
          assert(!err);
          assert.equal('hi world', v);
          done();
        });
      })

      it('should support custom async functions', function(done) {
        var validate = Rube(String).use(function(v, fn) {
          setTimeout(function() {
            fn(null, v + ' world');
          }, 0)
        });

        validate('hi', function(err, v) {
          assert(!err);
          assert.equal('hi world', v);
          done();
        });
      });

      it('should support rube composition', function(done) {
        var email = Rube(String).assert(remail).between(10, 20);
        var validate = Rube(String).use(email);
        validate('matt@lapwinglabs.com', function(err, v) {
          assert(!err);
          assert('matt@lapwinglabs.com' == v);
          done();
        });
      });
    });

    describe('.default(default)', function() {
      it('.default(undefined)', function(done) {
        var validate = Rube(String).default('default value!');
        validate(undefined, function(err, value) {
          assert(!err);
          assert('default value!' == value);
          done();
        })
      });

      it('.default("hi")', function(done) {
        var validate = Rube(String).default('default value!');
        validate('hi', function(err, value) {
          assert(!err);
          assert('hi' == value);
          done();
        })
      })
    });

    describe('.cast(from, to)', function() {

    })
  })

  describe('Rube(Object)', function() {
    var schema;

    beforeEach(function() {
      schema = Rube({
        email: Rube(String).assert(/@/).between(10, 20),
        name: Rube(String).between(5, 30)
      });
    })

    it('should validate all keys', function(done) {
      schema({
        name: 'matt mueller',
        email: 'matt@lapwinglabs.com'
      }, function(err, values) {
        assert(!err);
        assert('matt mueller' == values.name);
        assert('matt@lapwinglabs.com' == values.email);
        done();
      });
    });

    it('should error out when invalid entry', function(done) {
      schema({
        name: 'matt mueller',
        email: 'mattlapwinglabs.com'
      }, function(err, values) {
        assert(err);
        assert(err.fields.email.message == '"mattlapwinglabs.com" does not match "/@/"')
        done();
      });
    });

    it('should work for nested objects', function(done) {
      var schema = Rube({
        email: Rube(String).assert(/@/),
        name: Rube(String).between(5, 30),
        accounts: Rube({
          twitter: Rube(String).between(5, 30),
          gittip: Rube(String).between(5, 20)
        })
      });

      schema({
        name: 'matt mueller',
        email: 'matt@lapwinglabs.com',
        accounts: {
          twitter: 'mattmueller',
          gittip: 'matthewmueller'
        }
      }, function(err, values) {
        assert(!err);
        done();
      })
    });

    describe('.xor()', function() {

      it('should allow one key', function(done) {
        var schema = Rube({
          a: Rube(String),
          b: Rube(String)
        }).xor('a', 'b');

        schema({
          a: 'hi'
        }, done);
      });

      it('should error out if both keys present', function(done) {
        var schema = Rube({
          a: Rube(String),
          b: Rube(String)
        }).xor('a', 'b');

        schema({
          a: 'a',
          b: 'b'
        }, function(err) {
          assert(err);
          assert.equal('Rube failed. "a" XOR "b" cannot all be present', err.message);
          done();
        });
      });

    });

    describe('.or()', function() {

      it('should allow one key', function(done) {
        var schema = Rube({
          a: Rube(String),
          b: Rube(String)
        }).or('a', 'b');

        schema({
          a: 'hi'
        }, done);
      });

      it('should allow both keys present', function(done) {
        var schema = Rube({
          a: Rube(String),
          b: Rube(String)
        }).or('a', 'b');

        schema({
          a: 'a',
          b: 'b'
        }, done);
      });

      it('should error out if neither key is present', function(done) {
        var schema = Rube({
          a: Rube(String),
          b: Rube(String)
        }).or('a', 'b');

        schema({}, function(err) {
          assert(err);
          assert.equal('Rube failed: "a" OR "b" must exist', err.message);
          done();
        });
      });

    });

    describe('.only(str)', function() {
      it('should only validate against certain properties', function(done) {
        var rube = Rube({
          name: Rube(String),
          email: Rube(String),
          accounts: Rube({
            twitter: Rube(String),
            facebook: Rube(String)
          })
        }).only('name email');

        var obj = {
          name: 'matt',
          email: 'matt@lapwinglabs.com'
        }

        rube(obj, function(err, val) {
          if (err) return done(err);
          done();
        });
      });

      it('should filter out values that its not validating against', function(done) {
        var rube = Rube({
          name: Rube(String),
          email: Rube(String),
          accounts: Rube({
            twitter: Rube(String),
            facebook: Rube(String)
          })
        }).only('name email');

        var obj = {
          name: 'matt',
          email: 'matt@lapwinglabs.com',
          accounts: {
            twitter: 123
          }
        }

        rube(obj, function(err, val) {
          if (err) return done(err);
          assert(!val.accounts);
          done();
        });
      });

      it('should be immutable', function(done) {
        var pending = 2;
        var rube = Rube({
          name: Rube(String),
          email: Rube(String),
          accounts: Rube({
            twitter: Rube(String),
            facebook: Rube(String)
          })
        });

        var some = {
          name: 'matt',
          email: 'matt@lapwinglabs.com'
        };

        rube.only('name email')(some, function(err, val) {
          if (err) return done(err);
          assert(!val.accounts);
          if (!--pending) return done();
        });

        var obj = {
          name: 'matt',
          email: 'matt@lapwinglabs.com',
          accounts: {
            twitter: 'mattmueller'
          }
        }

        rube(obj, function(err, val) {
          if (err) return done(err);
          assert(val.accounts);
          if (!--pending) return done();
        });
      })

    });
  });

  describe('Rube(a, b, ...) alternatives', function() {
    it('should support multiple alternatives', function(done) {
      var rube = Rube(String, Boolean);
      var pending = 2;

      rube('a', function(err, v) {
        if (err) return done(err);
        assert('a' == v);
        if (!--pending) return done();
      })

      rube(true, function(err, v) {
        if (err) return done(err);
        assert(true === v);
        if (!--pending) return done();
      })
    });

    it('should support composition', function(done) {
      var rube = Rube(Rube(String), Rube(Boolean));
      var pending = 2;

      rube('a', function(err, v) {
        if (err) return done(err);
        assert('a' == v);
        if (!--pending) return done();
      })

      rube(true, function(err, v) {
        if (err) return done(err);
        assert(true === v);
        if (!--pending) return done();
      })
    })

    // it('should have the same properties as Rube(any)', function(done) {
    //   var rube = Rube(String, Boolean).assert(true, 'it should be true');
    //   rube(true, function(err, v) {
    //     if (err) return done(err);
    //     assert(v === true);
    //     done();
    //   })
    // })
  })

  describe('Rube(any)', function() {
    describe('.message(msg)', function() {

      it('should provide a custom error message', function(done) {
        var rube = Rube(String).between(5, 10).message('wrong length!');
        rube('hi', function(err) {
          assert(err)
          assert('wrong length!' == err.message);
          done();
        });
      });

      it('should work with nested Rubes', function(done) {
        var rube = Rube({
          name: Rube(String).between(5, 10).message('wrong length!')
        }).message('bad obj!');

        rube({ name: 'matt' }, function(err) {
          assert(err)
          assert('bad obj!' == err.message);
          done();
        });
      });

    })
  })
});
