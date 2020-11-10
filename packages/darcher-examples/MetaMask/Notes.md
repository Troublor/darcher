# Metamask Extension Experiment

# Send Tx Instrumentation

## web3.js

Instrument `Provider.send()`: 

Location: `node_modules/web3/lib/web3/requestmanager.js`
```javascript
const { traceSend } = require('./instrument');
callback = traceSend(data.method, result.result);
```

Instrument `Provider.sendAsync()`:

Location: `node_modules/web3/lib/web3/requestmanager.js`
```javascript
    const { traceSendAsync } = require('./instrument');
    callback = traceSendAsync(data.method, callback);
```

## ethjs-query

Instrument `EthRPC.prototype.sendAsync`:

Location: `node_modules/ethjs-query/node_modules/ethjs-rpc/lib/index.js`
```javascript
const { traceSendAsync } = require('./instrument');
callback = traceSendAsync(payload.method, callback);
```
