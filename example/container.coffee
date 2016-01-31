Flacon = require '../index.js'

module.exports = container = new Flacon()

# In a container, we can pull together all those modules.
container.publish 'foo', require './foo'
container.publish 'bar', require './bar'
