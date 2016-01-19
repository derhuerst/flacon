var is = require('is');



// A dependency injection container, holding all modules, mocks and dependencies.
var Container = function () {

	var modules = {},
	notCached = {}; // `{} is …` is never true.



	var load = function (id, mocks) {
		var module, deps;

		if (!is.string(id)) throw new Error('`id` must be a string.');
		if (!is.object(mocks)) mocks = {}; // `mocks` is optional

		if (!modules[id]) throw new Error(id + ' has not been registered.');
		else module = modules[id];

		if (module.cache === notCached) {
			// merge dependencies and mocks
			deps = module.deps.map(function (id) {
				var dep = load(id);
				// For greater flexibility, the mocks are being called with the
				// dependency. They can then manipulate it or return something entirely new.
				if (mocks.hasOwnProperty(id)) return mocks[id](dep);
				else return dep;
			});
			module.cache = module.factory.apply(null, deps);
		}

		return module.cache;
	};



	var publish = function (id, deps, factory) {
		if (!is.string(id)) throw new Error('`id` must be a string.');
		if (arguments.length === 2) {  // `deps` is optional
			factory = deps;
			deps = [];
		}
		if (!is.fn(factory)) throw new Error('`factory` must be a function.');

		if (modules[id]) throw new Error(id + ' has already been registered.');
		else modules[id] = {
			deps:    deps,
			factory: factory,
			cache:   notCached
		};

		// To make publishing *and* exporting a factory easier, we return it here.
		return factory;
	};



	load.publish = publish;
	return load;
};



module.exports = Container;
