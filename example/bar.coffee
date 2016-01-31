# This module depends on `foo`.
module.exports = (foo) ->
	read: -> foo.read() + 'bar'

module.exports.deps = ['foo']
