assert =    require 'assert'
container = require './container'

bar = container 'bar'

barUnderTest = container 'bar',
	foo: (foo) -> read: -> 'qux'

assert.strictEqual bar.read(), 'foobar'
assert.strictEqual barUnderTest.read(), 'quxbar'
