node-routing-json-schema
========================

Define routing using json schema

Load and validate params, result and error json-schema for each method of routing.


```javascript
var RpcRouting = require('routing-json-schema');
var rpcRouting = RpcRouting();
rpcRouting.addMethod(__dirname + '/auth/method/login');
rpcRouting.addDirMethods(__dirname + '/method');

var jsonrpc = require('multitransport-jsonrpc');
var Server = jsonrpc.server;
var ServerMiddleware = jsonrpc.transports.server.middleware;

var jsonRpcMiddlewareServer = new Server(new ServerMiddleware(), rpcRouting.getMethods());
```


auth/method/login/index.js:
```javascript
module.exports = function (params) {
  // check login and password here
  return true;
};
```

auth/method/login/params.json
```json
{
  "title": "login params json-chema",
  "type": "object",
  "required": [ "name", "password" ],
  "properties": {
    "name": {
      "type": "string"
    },
    "password": {
      "type": "string"
    }
  }
}
```

auth/method/login/result.json:
```json
{ "enum": [true] }
```

auth/method/login/error.json:
```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "required": ["code", "message"],
  "properties": {
    "code": {
      "enum": [404]
    },
    "message": {
      "enum": ["Couldn't found account with that login and password"]
    }
  }
}
```

or auth/method/login/error.js:
```javascript
module.exports = {
    "$schema": "http://json-schema.org/draft-04/schema#",

    "allOf": [
        require('./definitions/errors'),
        {
          "anyOf": [
            require('./definitions/errors_connect'),
            {
                "type": "object",
                "required": ["code", "message"],
                "properties": {
                    "code": {
                        "enum": [404]
                    },
                    "message": {
                        "enum": ["Couldn't found account with that login and password"]
                    }
                }
            },
            require('./definitions/error_empty_login'),
            require('./definitions/error_empty_password')
          ]
        }
    ]
};
```
