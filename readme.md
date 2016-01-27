# flacon

*flacon* is a dependency injection container with a clean and tiny API. It helps you to test your components individually.

[![build status](https://img.shields.io/travis/derhuerst/flacon.svg)](https://travis-ci.org/derhuerst/flacon)
[![dependency status](https://img.shields.io/david/derhuerst/flacon.svg)](https://david-dm.org/derhuerst/flacon#info=dependencies)
[![dev dependency status](https://img.shields.io/david/dev/derhuerst/flacon.svg)](https://david-dm.org/derhuerst/flacon#info=devDependencies)


## Installing

```
npm install flacon
```


## Introduction

Imagine you have a **service `foo.js`**.

```js
module.exports = {
	value: function () { return 'foo' }
};
```

Now you want another **service `bar.js` that uses `foo.js`**.

```js
var foo = require('./foo');

module.exports = {
	value: function () { return foo.value() + 'bar' }
};
```

This looks all good. But when testing `bar.js`, **mocking `foo.js` is really difficult** because it is a *private* dependency. *flacon*, on the other hand, forces you to explicitly declare all dependencies, making it easy to mock them.


### `publish`

First, we create a new *flacon* container in `container.js`.

```js
var Flacon = require('flacon');

module.exports = new Flacon();
```

You can do two things with a container: `publish` a module and `load` a module.

Let's publish `foo` first. We call the `publish` method with an **id** and a **factory function**.

```js
var container = require('./container');

container.publish('foo', function () {
	return {
		value: function () { return 'foo' }
	};
});
```

Moving on to `bar`, we define `foo` as a **dependency**. All dependencies get passed into the factory function.

```js
var container = require('./container');

container.publish('bar', ['foo'], function (foo) {
	return {
		value: function () { return foo.value() + ' bar' }
	};
});
```


### `load`

By simply calling the container with a module id, you will get the **return value of the factory function**.

```js
var container = require('./container');

var bar = container('bar');
bar.value(); // -> 'foo bar'
```

During testing, we can easily **manipulate or mock a dependency**. Note that this loads the module without caching.

```js
var container = require('./container');

var bar = container('bar', {
	'a': function (a) {
		a.value = function () { return 'baz' }
		return a;
	}
});
bar.value(); // -> 'baz bar'
```


### `flush`

To force *flacon* to call a module's factory again, use `flush`.

```js
container.load('a');  // factory creates module
container.flush('a');
container.load('a');  // factory creates module again
```



## API

### `flacon(id, [mocks])`

Loads a module by `id`. Returns the module.

If `mocks` are passed, they will be used to instead of its dependencies. Otherwise the module will be cached.

- `id`: The identifier, unique to the container.
- `mocks`: A map of callbacks, mapped by module `id`. The return value of each callback will be the mock.

### `flacon.publish(id, [deps], factory)`

Registers a module by `id`. Returns the module's `factory`.

- `id`: The identifier, unique to the container.
- `deps`: An optional array of dependency `id`s. Their corresponding modules will be passed into `factory`.
- `factory`: A function, taking the dependencies, that returns the module.

### `flacon.flush()`

Removes a module from the cache. Returns the container.

- `id`: The identifier, unique to the container.



## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/flacon/issues).
