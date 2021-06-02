# Installation

Before install, make sure you have met the requirements specified in [REQUIREMENTS](REQUIREMENTS.md).

The project is manager by [yarn workspace](https://classic.yarnpkg.com/en/docs/workspaces/). 
All commands below are executed at the root directory of the project, unless explicitly specified. 

## Fetch Node.js Dependencies

At root folder: 
```bash
yarn
```

## Build Project 

```bash
yarn build
```

## Generate Ethererum DAG

The [Ethereum DAG](https://eth.wiki/en/fundamentals/mining) (directed acyclic graph) is essential for the Controlled Blockchain insider *ĐArcher*. 

```bash
yarn workspace @darcher/go-ethereum gen:dag
```

The Ethereum DAG will be generated at the `ethash` folder under root directory.

Alternatively, we provide a pre-generated ethash [here](https://zenodo.org/record/4812350). Download it and extract it at the `ethash` folder under root directory.

## Prepare the Chrome Profile

*ĐArcher* is designed to test Web-based DApps, so we need to configure a browser profile to use *ĐArcher*.
We provide a preconfigured profile. 
Download [`ChromeProfile.zip`](https://github.com/Troublor/darcher/releases) and extract it at the `ChromeProfile` folder under the root directory.

The profile contains two extensions configured for *ĐArcher* as follows:

### MetaMask for *ĐArcher*

*ĐArcher* is working closely with an adapted version of [MetaMask](https://metamask.io/) to retrieve information of transactions sent by DApps. 

`MetaMask for *ĐArcher*` should be correctly built when [building the project](#Build Project).
The built artifact (Chrome Extension) can be found under `packages/darcher-metamask/builds/chrome`.

### Off-Chain State Fetcher (Browser Extension)

*ĐArcher* supports fetch off-chain state from HTML DOM in a DApp's website. 
This functionality requires a Chrome extension to make it possible. 

`Off-Chain State Fetcher (Browser Extension)` should be correctly built when [building the project](#Build Project).
The built artifact (Chrome Extension) can be found under `packages/darcher-dbmonitor-browser/dist`.


