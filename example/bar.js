'use strict'

// This module depends on `foo`.
const bar = (foo) => ({
	read: () => foo.read() + 'bar'
})

bar.deps = ['foo']

module.exports = bar
