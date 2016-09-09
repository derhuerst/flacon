'use strict'

const assert = require('assert')
const Flacon = require('../index')

const Foo = require('./foo')
const Bar = require('./bar')



// In a container, we can pull together all those modules.
const container = new Flacon()
container.publish('foo', Foo)
container.publish('bar', Bar)



const mockedFoo = {read: () => 'qux'}

const bar = container('bar')
const barUnderTest = container('bar', {
	foo: () => mockedFoo
})

assert.strictEqual(bar.read(), 'foobar')
assert.strictEqual(barUnderTest.read(), 'quxbar')
