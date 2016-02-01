assert =    require 'assert'
container = require './container'

bar = container 'bar'

mockedFoo = read: -> 'qux'
barUnderTest = container 'bar',
	foo: (foo) -> mockedFoo

assert.strictEqual bar.read(), 'foobar'
assert.strictEqual barUnderTest.read(), 'quxbar'
