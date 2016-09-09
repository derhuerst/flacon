const test = require('tape')
const is = require('is')

const flacon = require('./index')



test('`flacon` is a function', (t) => {
	t.plan(1)
	t.ok(is.fn(flacon))
})

test('`flacon()` is a function', (t) => {
	t.plan(1)
	t.ok(is.fn(flacon()))
})
test('`flacon().publish` is a function', (t) => {
	t.plan(1)
	t.ok(is.fn(flacon().publish))
})

test('`new flacon()` is a function', (t) => {
	t.plan(1)
	t.ok(is.fn(new flacon()))
})
test('`new flacon().publish` is a function', (t) => {
	t.plan(1)
	t.ok(is.fn(new flacon().publish))
})



test('`container.publish()` throws if no id passed', (t) => {
	t.plan(1)
	const container = flacon()
	t.throws(() => container.publish())
})
test('`container.publish()` throws if no factory passed', (t) => {
	t.plan(1)
	const container = flacon()
	t.throws(() => container.publish('foo'))
})
test('`container.publish()` throws if the id is taken', (t) => {
	t.plan(1)
	const container = flacon()
	container.publish('foo', () => {})
	t.throws(() => container.publish('foo', () => {}))
})

test('`container.publish()` doesn\'t call the factory', (t) => {
	t.plan(0)
	const container = flacon()
	container.publish('foo', () => t.fail('factory called'))
	t.end()
})
test('`container.publish()` returns the factory', (t) => {
	t.plan(1)
	const container = flacon()
	const foo = () => {}
	t.strictEqual(container.publish('foo', foo), foo)
})



test('`container()` throws if no id passed', (t) => {
	t.plan(1)
	const container = flacon()
	container.publish('foo', () => {})
	t.throws(() => container())
})
test('`container()` throws if no module with id', (t) => {
	t.plan(1)
	const container = flacon()
	container.publish('foo', () => {})
	t.throws(() => container('bar'))
})

test('`container()` calls the factory', (t) => {
	t.plan(1)
	const container = flacon()
	container.publish('foo', () => t.pass('factory called'))
	container('foo')
})
test('`container()` returns the result of the factory', (t) => {
	t.plan(1)
	const container = flacon()
	const x = {}
	container.publish('foo', () => x)
	t.strictEqual(container('foo'), x)
})
test('`container()` memoizes the result of the factory', (t) => {
	t.plan(1)
	const container = flacon()
	container.publish('foo', () => t.pass('factory called'))
	container('foo'); container('foo')
})

test('`container()` loads dependencies before', (t) => {
	t.plan(1)
	const container = flacon()
	container.publish('foo', () => t.pass('dependency loaded'))
	const bar = () => {}
	bar.deps = ['foo']
	container.publish('bar', bar)
	container('bar')
})
test('`container()` calls the factory with the loaded dependencies', (t) => {
	t.plan(3)
	const container = flacon()
	const x = {}; const y = {}
	container.publish('foo', () => x)
	container.publish('bar', () => y)
	const baz = (...args) => {
		t.strictEqual(args[0], x)
		t.strictEqual(args[1], y)
		t.strictEqual(args.length, 2)
	}
	baz.deps = ['foo', 'bar']
	container.publish('baz', baz)
	container('baz')
})
test('`container()` calls the factory on an empty object', (t) => {
	t.plan(2)
	const container = flacon()
	container.publish('foo', function () {
		t.ok(is.object(this), 'not an object')
		t.notEqual(this, global, 'called on global object')
	})
	container('foo')
})

test('`container()` throws if a mock is not a function', (t) => {
	t.plan(1)
	const container = flacon()
	const foo = () => {}
	foo.deps = ['bar']
	container.publish('foo', foo)
	t.throws(() => container({bar: 'baz'}))
})
test('`container()` allows mocking', (t) => {
	t.plan(1)
	const container = flacon()
	container.publish('foo', () => {})
	const bar = (foo) => foo
	bar.deps = ['foo']
	container.publish('bar', bar)
	const x = {};
	t.strictEqual(container('bar', {foo: () => x}), x)
})
test('`container()` allows deep mocking', (t) => {
	t.plan(1)
	const container = flacon()
	container.publish('foo', () => {})
	const bar = (foo) => foo
	bar.deps = ['foo']
	container.publish('bar', bar)
	const baz = (bar) => bar
	baz.deps = ['bar']
	container.publish('baz', baz)
	const x = {};
	t.strictEqual(container('baz', {foo: () => x}), x)
})
test('`container()` does not memoize when mocking', (t) => {
	t.plan(2)
	const container = flacon()
	container.publish('foo', () => {})
	const bar = () => t.pass('factory called')
	bar.deps = ['foo']
	container.publish('bar', bar)
	container('bar')
	container('bar', {foo: () => {}})
})
test('`container()` memoizes modules not unfluenced by mocking', (t) => {
	t.plan(1)
	const container = flacon()
	container.publish('a', () => {})
	container.publish('b', () => {})
	const foo = () => {}
	foo.deps = ['a']
	container.publish('foo', foo)
	const bar = () => t.pass('factory called')
	bar.deps = ['b']
	container.publish('bar', bar)
	const mocks = {a: () => {}}
	container('foo', mocks); container('foo', mocks)
	container('bar', mocks); container('bar', mocks)
})



test('`container.flush()` throws if no id passed', (t) => {
	t.plan(1)
	const container = flacon()
	container.publish('foo', () => {})
	t.throws(() => container.flush())
})
test('`container.flush()` throws if no module with id', (t) => {
	t.plan(1)
	const container = flacon()
	container.publish('foo', () => {})
	t.throws(() => container('bar'))
})

test('`container.flush()` dememoizes the factory', (t) => {
	t.plan(2)
	const container = flacon()
	container.publish('foo', () => t.pass('factory called'))
	container('foo')
	container.flush('foo')
	container('foo')
})

test('`container.flush()` returns the container', (t) => {
	t.plan(1)
	const container = flacon()
	container.publish('foo', () => t.pass('factory called'))
	t.strictEqual(container.flush('foo'), container)
})
