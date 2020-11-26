# Giveth Experiment

## Send Tx Instrumentation

### Giveth-dapp

#### Web3.js

File: `node_modules/web3-core-method/src/index.js`

File: `node_modules/web3-eth/node_modules/web3-core-method/src/index.js`

File: `node_modules/web3-eth-contract/node_modules/web3-core-method/src/index.js`

```javascript
const { traceSendAsync } = require("./trace-instrument");
sendTxCallback = traceSendAsync(method.call, payload.params, sendTxCallback);
```
