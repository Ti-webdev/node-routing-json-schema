node-routing-json-schema
========================

Define routing using json schema

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

auth/method/result.json:
```json
{ "enum": [true] }
```
