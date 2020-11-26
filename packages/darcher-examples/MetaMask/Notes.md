# Metamask Extension Experiment

## Send Tx Instrumentation

### web3.js

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

### ethjs-query

Instrument `EthRPC.prototype.sendAsync`:

Location: `node_modules/ethjs-query/node_modules/ethjs-rpc/lib/index.js`
```javascript
const { traceSendAsync } = require('./instrument');
callback = traceSendAsync(payload.method, callback);
```

## ERC20 Token 

Address: `0x1AADAa0620e0306156d8aF95E56b92e48eF1e6b8`

## Others

MetaMask Home must be in `Activity` tab, so that Crawljax can continue the crawl after a transaction is sent, since after a transaction is sent, the Home page will be set in `Activity` tab.
