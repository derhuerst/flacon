'use strict';

// A dependency injection container, holding all modules, mocks and dependencies.
var Flacon = function () {

	var modules = {},
	notCached = {}; // `{} is …` is never true.



	var load = function (id, mocks) {
		var module, deps;

		if ('string' !== typeof id) throw new Error('`id` must be a string.');
		// `mocks` is optional
		if (Array.isArray(mocks) || 'object' !== typeof mocks) mocks = {};

		if (!modules[id]) throw new Error(id + ' has not been registered.');
		else module = modules[id];

		var hasMocks = Object.keys(mocks).length > 0;
		if (module.cache === notCached || hasMocks) {
			// merge dependencies and mocks
			deps = module.deps.map(function (id) {
				var dep = load(id);
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



	var flush = function (id) {
		if ('string' !== typeof id) throw new Error('`id` must be a string.');
		if (!modules[id]) throw new Error(id + ' has not been registered.');

		modules[id].cache = notCached;

		return this;  // for method chaining
	};



	var publish = function (id, deps, factory) {
		if ('string' !== typeof id) throw new Error('`id` must be a string.');
		if (arguments.length === 2) {  // `deps` is optional
			factory = deps;
			deps = [];
		}
		if ('function' !== typeof factory) throw new Error('`factory` must be a function.');

		if (modules[id]) throw new Error(id + ' has already been registered.');
		else modules[id] = {
			deps:    deps,
			factory: factory,
			cache:   notCached
		};

		// To make publishing *and* exporting a factory easier, we return it here.
		return factory;
	};



	load.flush = flush;
	load.publish = publish;
	return load;
};



if (module) module.exports = Flacon;
