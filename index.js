'use strict';

// A dependency injection container, holding all modules, mocks and dependencies.
function Flacon () {
	var modules = {}, notCached = {}; // `{} is …` is never true.



	var load = function (id, mocks) { // `mocks` is optional
		var module, deps, hasMocks;

		if ('string' !== typeof id) throw new Error('`id` must be a string.');
		if (Array.isArray(mocks) || 'object' !== typeof mocks) mocks = {};

		if (!modules[id]) throw new Error(id + ' has not been registered.');
		else module = modules[id];

		hasMocks = Object.keys(mocks).length > 0;
		if (module.cache === notCached || mocks[id]) {

			deps = Array.isArray(module.factory.deps) ? module.factory.deps : [];
			// merge dependencies and mocks
			deps = deps.map(function (id) {
				var dep = load(id, mocks);
				// For greater flexibility, the mocks are being called with the
				// dependency. They can then manipulate it or return something entirely new.
				if (mocks.hasOwnProperty(id)) return mocks[id](dep);
				else return dep;
			});

			if (hasMocks) return module.factory.apply({}, deps);
			module.cache = module.factory.apply({}, deps);
		}
		return module.cache;
	};



	load.flush = function (id) {
		if ('string' !== typeof id) throw new Error('`id` must be a string.');
		if (!modules[id]) throw new Error(id + ' has not been registered.');

		modules[id].cache = notCached;
		return this;  // for method chaining
	};



	load.publish = function (id, factory) {
		if ('string' !== typeof id) throw new Error('`id` must be a string.');
		if ('function' !== typeof factory) throw new Error('`factory` must be a function.');

		if (modules[id]) throw new Error(id + ' has already been registered.');
		else modules[id] = {factory: factory, cache: notCached};

		return factory; // To make publishing *and* exporting a factory easier.
	};



	return load;
}

if (module) module.exports = Flacon;
