var JsonRpcMethod = require(__dirname+'/JsonRpcMethod');

var fs = require('fs');
var path = require('path');

var Routing = function(options) {
  if (this instanceof Routing) {
    this.methods = {};
    this.logger = options && options.logger || console;
  }
  else {
    return new Routing(options);
  }
}

Routing.prototype = {
  addDirMethods: function(dir) {
    var self = this;
    fs.readdirSync(dir).forEach(function(file) {
      try {
        self.addMethod(path.join(dir, file));
      }
      catch (e) {
        self.logger.log('Cannot load file "'+file+'": '+e);
      }
    });
    return this.methods;
  },

  addMethod: function(filepath) {
    var self = this;
    var method = require(filepath);
    var name = path.basename(filepath, '.js');
    var jsonRpcMethod = JsonRpcMethod(method);

    JsonRpcMethod.schemeNames.forEach(function(key) {
      var module = path.join(filepath, key);
      try {
        jsonRpcMethod.schema[key] = require(module);
      }
      catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND' || e.toString() !== "Error: Cannot find module '"+module+"'") throw e;
      }
    });

    self.methods[name] = jsonRpcMethod.callback.bind(jsonRpcMethod);
  },

  getMethods: function() {
    return this.methods;
  }
}

module.exports = function() {
  return new Routing;
}
