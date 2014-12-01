
# rube

  A composable data validation, transformation & manipulation pipeline. Supports synchronous, asynchronous and generator functions. Proudly named after the [Rube Goldberg Machine](http://en.wikipedia.org/wiki/Rube_Goldberg_machine).

  ![rube goldberg machine](http://upload.wikimedia.org/wikipedia/commons/a/a6/Professor_Lucifer_Butts.gif)

## Installation

```bash
npm install rube
```

## Example

```js
// coerce into a phone number and verify
var phone = Rube()
  .format(/[^\d]+/g, '') // remove any non-digits
  .type(/\d{10}/)        // verify we have 10 digits (US phone number)
  .cast(String, Number)  // cast a string to a number

// prettyphone makes a US phone number pretty
var prettyphone = Rube()
  .use(phone)                                    // compose phone's rube
  .cast(Number, String)                          // cast a number to a string
  .format(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') // format phone number

prettyphone('+(415) 324----5344', function(err, v) {
  v // (415) 324-5344
});
```

## API

### Rube()

Initialize `Rube`. Returns a function that can be used to check a given value.

```js
var rube = Rube().required().type(isEmail).format('matt', 'brian');
rube('matt@lapwinglabs.com', function(err, v) { ... }) // v is 'brian@lapwinglabs.com'
```

### Rube#use(fn)

Add custom validations, transforms, and formatters. If you add a second
argument, the function will be asynchronous.

```js
rube.use(function(value, fn) {
  fn(null, value * value);
});
```

You can also compose `rube` instances:

```js
var a = rube();
var b = rube();
var c = rube().use(a).use(b);
```

### Rube.plugin([name], fn)

Attach a custom plugin to all rube instances

```js
Rube.plugin(function phone(country) {
  return function(value) {
    switch(country) {
      case 'US': return /^\d{10}$/.test(value) ? value : new Error('no good');
      default: return value;
    }
  };
});

var rube = Rube().phone('US');
rube(1234567890, function(err, v) { ... }) // v is 1234567890
```

### Rube.message(message)

Provide a custom message when there is an error. A `message` can be either a string, function, or error.

When `message` is a function, the error is passed through:

```js
Rube().message(function(err) {
  return new Error('this was the error: ' + err.message);
});
```

### Bundled Plugins

As you probably noticed, Rube comes bundled with a few plugins off the bat to make things easier.

#### Rube#cast([from], to)

Cast a value `from` one type to another type. Uses [typecast](https://github.com/eivindfjeldstad/typecast) for its type casting.

```js
Rube().cast(String, Number)
```

If the first type isn't satisfied, the cast is skipped. Optionally, you can specify one type to **always** try to cast to that type

```js
Rube.cast(String) // cast any type to string
```

#### Rube#default(default)

Specify a `default` value if the value passed through is undefined.

```js
var rube = Rube.default(10)
rube(undefined, function(err, v) { ... }) // v is 10
```

#### Rube#format(replace, [with])

Format an argument. You can pass a function into replace to modified the `value`.

```js
var rube = Rube.format(function (v) {
  return v * 2;
});
rube(10, function(err, v) {}) // v is 20
```

You can also pass a regular expression into replace and pass a function into `with`.

```js
var rube = Rube().format(/(\d{3})(\d{3})(\d{4})/, function(m) {
  return '(' + m[1] + ') ' + m[2] + '-' + m[3];
});

rube(1234567890, function(err, v) { ... }) // v is "(123) 456-7890"
```

Or to simply things you can pass a string to `with`:

```js
var rube = Rube().format(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');

rube(1234567890, function(err, v) { ... }) // v is "(123) 456-7890"
```

#### Rube#required()

Ensure that the value is defined.

```js
var rube = Rube().required();
rube(undefined, function(err, v) { ... }) // err is "value must be defined"
```

#### Rube#type(type)

Ensure that the value is a certain `type`. Uses [invalid](https://github.com/lapwinglabs/invalid) for it's typechecking.

```js
var rube = Rube().type(String)
rube(10, function(err, v)) // err is "10 is not a string"
```

#### Rube#assert(assertion)

Assert that the `value` passed through passes the `assertion`. The `assertion` changes based on it's type:

- default: `assert.equal(value, assertion)`
- regexp: `assert(assertion.test(value))`
- array or object: `assert.deepEqual(value, assertion)`

#### Rube#between(min, max)

Checks to see if the value is in between `min` and `max`. Between is an *inclusive* range

```js
Rube()
  .between(3, 10)
```

You can use this to specify min's and max's separately:

```js
Rube()
  .between(6, Infinity) // min(6)
  .between(-Infinity, 100) // max(100)
```

## Tests

```bash
npm install
make test
```

## License

(The MIT License)

Copyright (c) 2014 Matthew Mueller &lt;matt@lapwinglabs.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
