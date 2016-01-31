assert = require 'assert'
_is =    require 'is'
sinon =  require 'sinon'

Flacon =   require '../index.js'





describe 'Flacon()', -> # creates a new container

	it 'should be a function', ->
		assert _is.fn Flacon

	context 'when called like `new Flacon()`', ->

		flacon = null
		beforeEach -> flacon = new Flacon()

		it 'should return a function', ->
			assert _is.fn flacon

		it 'should return a `publish` method', ->
			assert _is.fn flacon.publish

	context 'when called like `Flacon()`', ->

		flacon = null
		beforeEach -> flacon = Flacon()

		it 'should return a function', ->
			assert _is.fn flacon

		it 'should return a `publish` method', ->
			assert _is.fn flacon.publish



describe 'flacon.publish()', -> # publish a module

	flacon = null
	beforeEach -> flacon = Flacon()

	it 'should throw an `Error` if no id passed', ->
		publishWithoutId = -> flacon.publish()
		assert.throws publishWithoutId, Error

	it 'should throw an `Error` if no factory passed', ->
		publishWithoutFactory = -> flacon.publish 'a'
		assert.throws publishWithoutFactory, Error

	it 'should throw an `Error` if the `id` is occupied', ->
		publish = -> flacon.publish 'a', ->
		publish()
		assert.throws publish, Error

	it 'should not call the factory immeadiately', ->
		spy = sinon.spy()
		flacon.publish 'a', spy
		assert.strictEqual spy.callCount, 0, 'factory called'

	it 'should return the factory', ->
		fn = ->
		result = flacon.publish 'a', fn
		assert.strictEqual result, fn



describe 'flacon()', -> # load a published module

	flacon = null
	beforeEach ->
		flacon = Flacon()
		flacon.publish 'a', -> 'foo'

	it 'should throw an `Error` if no id passed', ->
		loadWithoutId = -> flacon()
		assert.throws loadWithoutId, Error

	it 'should throw an `Error` if no module named `id`', ->
		loadWithUnknownId = -> flacon 'b'
		assert.throws loadWithUnknownId, Error

	it 'should call the factory', ->
		factory = sinon.spy()
		flacon.publish 'b', factory
		flacon 'b'
		assert factory.calledOnce, 'factory not called'

	it 'should return the result of the factory', ->
		result = flacon 'a'
		assert.strictEqual result, 'foo'

	it 'should cache the result of the factory', ->
		factory = sinon.spy()
		flacon.publish 'b', factory
		flacon 'b'
		flacon 'b'
		assert.strictEqual factory.callCount, 1, 'factory not called exactly once'

	it 'should load all dependencies before', ->
		factoryForB = sinon.spy()
		flacon.publish 'b', factoryForB
		factoryForC = ->
		factoryForC.deps = ['b']
		flacon.publish 'c', factoryForC
		flacon 'c'
		assert factoryForB.calledOnce, 'dependency not loaded'

	it 'should call the factory with the loaded dependencies', ->
		flacon.publish 'b', -> 'bar'
		factory = sinon.spy()
		factory.deps = ['a', 'b']
		flacon.publish 'c', factory
		flacon 'c'
		assert factory.calledOnce, 'dependencies not loaded'
		assert.deepEqual factory.firstCall.args, ['foo', 'bar']

	it 'should not call the factory with `this` being the global scope', ->
		factory = -> assert !(this is global), 'factory called with global scope'
		flacon.publish 'b', factory
		flacon 'b'

	it 'should call a mock with the loaded dependency', ->
		mock = sinon.spy()
		factory = ->
		factory.deps = ['a']
		flacon.publish 'b', factory
		flacon 'b', a: mock
		assert mock.calledOnce, 'mock not called'
		assert.deepEqual mock.firstCall.args, ['foo']

	it 'should use the mock as dependency', ->
		mock = sinon.spy (module) -> module + 'bar'
		factory = sinon.spy()
		factory.deps = ['a']
		flacon.publish 'b', factory
		flacon 'b', a: mock
		assert factory.calledOnce, 'factory not called'
		assert.deepEqual factory.firstCall.args, ['foobar']

	it 'should use the mock deeply', ->
		mock = -> 'qux'
		factoryForB = (a) -> a + 'bar'
		factoryForB.deps = ['a']
		factoryForC = (a) -> a + 'baz'
		factoryForC.deps = ['b']
		flacon.publish 'b', factoryForB
		flacon.publish 'c', factoryForC
		result = flacon 'c', a: mock
		assert.deepEqual result, 'quxbarbaz' # instead of 'foobarbaz'

	it 'should not cache the result if any dependency mocked', ->
		factory = sinon.spy()
		factory.deps = ['a']
		flacon.publish 'b', factory
		flacon 'b', a: -> {}
		flacon 'b', a: -> {}
		assert.strictEqual factory.callCount, 2, 'factory not called exactly twice'

	it 'should cache dependencies not being mocked', ->
		factoryForB = sinon.spy -> 'this is b'
		flacon.publish 'b', factoryForB
		factoryForC = -> 'this is c'
		factoryForC.deps = ['b']
		flacon.publish 'c', factoryForC
		flacon 'b'
		flacon 'c', a: -> 'this is a'
		assert.strictEqual factoryForB.callCount, 1



describe 'flacon.flush()', -> # invalidate a published module\'s cache

	flacon = null
	beforeEach -> flacon = Flacon()

	it 'should throw an `Error` if no id passed', ->
		loadWithoutId = -> flacon()
		assert.throws loadWithoutId, Error

	it 'should throw an `Error` if no module named `id`', ->
		loadWithUnknownId = -> flacon 'b'
		assert.throws loadWithUnknownId, Error

	it 'should call the factory again after flushing', ->
		spy = sinon.spy -> 'foo'
		flacon.publish 'a', spy
		flacon 'a'
		flacon.flush 'a'
		flacon 'a'
		assert.strictEqual spy.callCount, 2

	it 'should return `flacon`', ->
		flacon.publish 'a', -> 'foo'
		result = flacon.flush 'a'
		assert.strictEqual result, flacon
