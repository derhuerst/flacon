'use strict'

// A dependency injection container, holding all modules, mocks and dependencies.
const Flacon = function () {
	const modules = {}; const notCached = {} // `{} === …` is never true.



	const load = (id, mocks) => { // `mocks` is optional
		if ('string' !== typeof id) throw new Error('`id` must be a string.')
		if (Array.isArray(mocks) || 'object' !== typeof mocks) mocks = {}

		if (!modules[id]) throw new Error(id + ' has not been registered.')
		const module = modules[id]

		let deps = Array.isArray(module.factory.deps) ? module.factory.deps : []
		const hasMocks = Object.keys(mocks).some((mock) => deps.indexOf(mock) >= 0)

		if (hasMocks) {
			deps = deps.map((id) => { // merge dependencies and mocks
				const dep = load(id, mocks)
				// For greater flexibility, the mocks are being called with the
				// dependency. They can then manipulate it or return something entirely new.
				if ('function' !== typeof mocks[id])
					throw new Error('Mock for `' + id + '` must be a function.')
				return mocks.hasOwnProperty(id) ? mocks[id](dep) : dep
			})
			return module.factory.apply(Object.create(null), deps)

		} else if (module.cache === notCached) {
			deps = deps.map((id) => load(id, mocks))
			module.cache = module.factory.apply({}, deps)
		}

		return module.cache
	}



	load.flush = (id) => {
		if ('string' !== typeof id) throw new Error('`id` must be a string.')
		if (!modules[id]) throw new Error(id + ' has not been registered.')

		modules[id].cache = notCached
		return load  // for method chaining
	}



	load.publish = (id, factory) => {
		if ('string' !== typeof id) throw new Error('`id` must be a string.')
		if ('function' !== typeof factory) throw new Error('`factory` must be a function.')

		if (modules[id]) throw new Error(id + ' has already been registered.')
		else modules[id] = {factory: factory, cache: notCached}

		return factory // To make publishing *and* exporting a factory easier.
	}



	return load
}

if (module) module.exports = Flacon
