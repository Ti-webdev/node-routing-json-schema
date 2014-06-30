var util = require('util');

var JsonRpcError = function(code, message) {
  var formatArgs;

  if (code.code && code.message) {
    message = code.message;
    code    = code.code;
    formatArgs = 1;
  }
  else {
    formatArgs = 2;
  }
  if (formatArgs < arguments.length) {
    message = util.format(message, Array.prototype.slice.call(arguments, formatArgs));
  }
  if (this instanceof JsonRpcError) {
    this.code = code;
    this.message = message;
    Error.captureStackTrace(this, JsonRpcError);
  }
  else {
    return new Error(code, message);
  }
}

util.inherits(JsonRpcError, Error);
JsonRpcError.prototype.name = 'JsonRpcError';

module.exports = JsonRpcError;
