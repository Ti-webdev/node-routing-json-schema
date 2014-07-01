var Promise = require('promise');
var ZSchema = require('z-schema');
var validator = new ZSchema({
    forceMaxLength: false
});

var JsonRpcMethod;


JsonRpcMethod = function (method, options) {
  if (this instanceof JsonRpcMethod) {
    this.method = method;
    this.schema = {};
    this.logger = options && options.logger || console;
  }
  else {
    return new JsonRpcMethod(method, options);
  }
};

JsonRpcMethod.schemeNames = ['params', 'result', 'error']

JsonRpcMethod.prototype = {
  callback: function() {
    var params = Array.prototype.slice.call(arguments, 0);
    var callback = params.pop();

    this.validateParams(params)
      .then(this.run.bind(this))
      .then(this.validateResult.bind(this))
      .then(null, this.validateError.bind(this))
      .nodeify(callback)
    ;
  },

  validateParams: function(params) {
    if ('undefined' === typeof this.schema.params) {
      return Promise.resolve(params);
    }
    else {
      var self = this;
      return validator.validate(1 < params.length ? params : params[0], this.schema.params)
      .then(function() {
        return params;
      }, function(err) {
        return new Promise(function (resolve, reject) {
          self.logger.error("Invalid params: ", err, "params: ", params);
          reject({
              code: -32602,
              message: 'Invalid params',
              validator: err.errors
          })
        });
      });
    }
  },

  run: function(params) {
    return this.method.apply(this, params);
  },

  validateResult: function(resultData) {
    if ('undefined' === typeof this.schema.result) {
      return resultData;
    }
    else {
      var self = this;
      return validator.validate(resultData, this.schema.result)
      .then(function() {
        return resultData;
      }, function(err) {
        self.logger.error("Invalid response: ", err, "ResultData: ", resultData);
        throw err;
      });
    }
  },

  validateError: function(error) {
    var self = this;
    return new Promise(function (resolve, reject) {
      if ('undefined' === typeof self.schema.error) {
        reject(error);
      }
      else {
        var internalError = function() {
            reject({
              'code': -32603,
              'message': 'Internal error'
            });
        }
        try {
          validator.validate(error, self.schema.error)
            .then(function() {
              reject(error);
            })
            .then(null, function() {
                self.logger.error("Invalid error response: ", error);
                internalError();
            });
          }
          catch(e) {
              self.logger.error("On validate error: ", error, "; Catch error ", e);
              internalError();
          }
      }
    });
  }
};

module.exports = JsonRpcMethod;
