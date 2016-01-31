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

		deps = Array.isArray(module.factory.deps) ? module.factory.deps : [];
		hasMocks = Object.keys(mocks).some(function (mock) {
			return deps.indexOf(mock) >= 0;
		});

		if (hasMocks) {
			deps = deps.map(function (id) { // merge dependencies and mocks
				var dep = load(id, mocks);
				// For greater flexibility, the mocks are being called with the
				// dependency. They can then manipulate it or return something entirely new.
				return mocks.hasOwnProperty(id) ? mocks[id](dep) : dep;
			});
			return module.factory.apply({}, deps);

		} else if (module.cache === notCached) {
			deps = deps.map(function (id) {return load(id, mocks)});
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
