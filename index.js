var is = require('is');



var Container = function () {

	var modules = {}, notCached = {};



	var load = function (id, mocks) {
		var module, deps;

		if (!is.string(id)) throw new Error('`id` must be a string.');
		if (!is.object(mocks)) mocks = {};

		if (!modules[id]) throw new Error(id + ' has not been registered.');
		else module = modules[id];

		if (module.cache === notCached) {
			deps = module.deps.map(function (id) {
				var dep = load(id);
				if (mocks.hasOwnProperty(id)) return mocks[id](dep);
				else return dep;
			});
			module.cache = module.factory.apply(null, deps);
		}

		return module.cache;
	};



	var publish = function (id, deps, factory) {
		if (!is.string(id)) throw new Error('`id` must be a string.');
		if (arguments.length === 2) {
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

		return factory;
	};



	load.publish = publish;
	return load;
};



module.exports = Container;
