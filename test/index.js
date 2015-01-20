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
  })

//   describe('rube.assert()', function() {
//     it('should test regular expressions', function() {
//       var rube = Rube()
//         .assert(/@/);

//       rube('mattlapwinglabs.com', function(err) {
//         assert(err.message == '"mattlapwinglabs.com" does not match "/@/"');
//       });
//     })

//     it('should work with functions', function() {
//       var rube = Rube()
//         .assert(function(value) {
//           return value == 10;
//         });

//       rube(15, function(err) {
//         assert(err.message == 'false == true');
//       })
//     });

//     it('should work with async functions', function(done) {
//       var rube = Rube()
//         .assert(function(value, next) {
//           setTimeout(function() {
//             next(null, value == 10);
//           }, 0)
//         });

//       rube(15, function(err) {
//         assert(err.message == 'false == true');
//         done();
//       })
//     })

//     it('should work with async functions', function(done) {
//       var rube = Rube()
//         .assert(function(value, next) {
//           setTimeout(function() {
//             next(new Error('some error'));
//           }, 0)
//         });

//       rube(15, function(err) {
//         assert(err.message == 'some error');
//         done();
//       })
//     })
//   })

//   describe('rube.between(min, max)', function() {
//     it('should enforce in between', function(done) {
//       var rube = Rube()
//         .between(1, 5)

//       rube('hi', function(err, v) {
//         assert(!err);
//         assert('hi' == v);
//         done();
//       })
//     })

//     it('should work with strings', function(done) {
//       var rube = Rube()
//         .between(4, 10)

//       rube('hi', function(err) {
//         assert(err.message == 'length must be greater than or equal to 4');
//         next();
//       })

//       rube('omg hi this is cool', function(err) {
//         assert(err.message = 'length must be less than or equal to 10');
//         next();
//       });

//       var pending = 2;
//       function next() {
//         if (!--pending) return done();
//       }
//     })

//     it('should work with numbers', function(done) {
//       var rube = Rube()
//         .between(1, 6)

//       rube(0, function(err) {
//         assert(err.message == 'length must be greater than or equal to 1');
//         next();
//       })

//       rube(7, function(err) {
//         assert(err.message == 'length must be less than or equal to 6');
//         next();
//       })

//       var pending = 2;
//       function next() {
//         if (!--pending) return done();
//       }
//     })
//   })

//   describe('rube.message(msg)', function() {
//     it('should provide custom error', function(done) {
//       var rube = Rube()
//         .type(String)
//         .message('value must be a string');

//       rube(5, function(err) {
//         assert(err instanceof Error);
//         assert.equal(err.message, 'value must be a string')
//         done();
//       })
//     })

//     it('should work with actual errors', function(done) {
//       var rube = Rube()
//         .type(String)
//         .message(new TypeError('value must be a string'));

//       rube(5, function(err) {
//         assert(err instanceof Error);
//         assert.equal(err.message, 'value must be a string')
//         done();
//       })
//     })

//     it('should work with functions', function(done) {
//       var rube = Rube()
//         .type(String)
//         .message(function(err) {
//           assert(err instanceof Error);
//           return err;
//         });

//       rube(5, function(err) {
//         assert(err instanceof Error);
//         assert.equal(err.message, '5 is not a string')
//         done();
//       })
//     })
//   })

//   describe('rube.required()', function() {
//     it('should throw on empty strings', function() {
//       var rube = Rube().required();
//       rube('', function(err, v) {
//         assert.equal(err.message, 'value cannot be blank');
//       });
//     })

//     it('should throw on undefined', function() {
//       var rube = Rube().required();
//       rube(undefined, function(err, v) {
//         assert.equal(err.message, 'value must be defined');
//       });
//     })
//   })

// })
});
