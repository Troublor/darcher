# *ĐArcher* - Detecting On-Chain-Off-Chain Synchronization Bugs in Decentralized Applications 

*ĐArcher* is an automated testing framework aiming to test on-chain-off-chain synchronization bugs in [decentralized applications (DApps)](https://ethereum.org/en/dapps/).

# Introduction

A DApp usually consists of an on-chain layer (smart contracts on blockchain) and an off-chain layer (programs running outside blockchain).
The on-chain layer provides adequate security to the DApp, while the off-chain layer focuses on the performance and user experience. 
The on-chain and off-chain layers cooperate to provide various kinds of high-quality services to ordinary users. 
![two layers](./img/two-layers.png)

The consistency between on-chain and off-chain layers of a DApp matters.
The on-chain state updates as transactions are executed on blockchain, while the DApp has to update off-chain state accordingly to make them consistent.
Each transaction has its lifecycle on blockchain, which is quite different from conventionaly transactions (e.g., database transaction), due to the existence of `Pending` and `Reversed` state.
![lifecycle](./img/lifecycle.png)
DApps may improperly update the off-chain state during the lifecycle of transactions, inducing inconsistencies between on-chain and off-chain states.
The inconsistencies may result in significant consequences, such as financial loss or make unexpected changes in the DApp.

On-chain-off-chain synchronization bugs refer to those bugs that result in the off-chain state to be inconsistent with the on-chain state.
*ĐArcher* aims to detect these bugs on top of fuzzing with some oracles, as proposed in the paper. 

The workflow of *ĐArcher* is shown as follows:
![workflow](./img/workflow.png)

*ĐArcher* leverages [Crawljax](https://github.com/crawljax/crawljax) to automatically explore the functionalities of DApps and initiate transactions. 
For each transaction, *ĐArcher* tries to check whether the on-chain and off-chain states are inconsistent during the lifecycle of the transaction. 

Each transaction will be driven to traverse its lifecycle in the order: `Created` -> `Pending` -> `Executed` -> `Reversed` -> `Executed` -> `Finalized`. 
At each lifecycle state, the off-chain state of the DApp will be fetched and saved for later analysis. 

By the end of functionality exploration using Crawljax, a set of transaction executed will be recorded along with the off-chain states at each transaction lifecycle state. 
An analyzer will be used to apply oracles proposed in the paper on each transaction to check whether the inconsistencies between on-chain and off-chain states are induced during its lifecycle. 
In fact, here the oracles only use off-chain states to check inconsistencies based on the heuristics explained in the paper. 
This is one of our contributions. 

In the end, a report will be generated, stating during the lifecycle of which transactions the inconsistencies between on-chain and off-chain states occur. 
This indicates the on-chain-off-chain synchronization bugs in the DApp. 

Note that *ĐArcher* does not locate bugs in the source code.
*ĐArcher* only identifies transactions, of which the handling program may have bugs to keep on-chain and off-chain states consistent.

## Publication

See the FSE'21 submission [#98](./darcher.pdf).

## Requirements

See [REQUIREMENTS](./REQUIREMENTS.md)

## Installation

### Build from Source
Clone this project:
```bash
git clone --recurse-submodules https://github.com/Troublor/darcher.git && cd darcher 
```
**Note**: This project contains several submodules. Be sure to add `--recurse-submodules` when git cloning.

Proceed at [INSTALL](./INSTALL.md) for installation of dependencies and compilation. 

### Pre-configured Virtual Machine

Alternatively, we provide a virtual box image [here](), which contains pre-configured environment of *ĐArcher*. 
Note that the size of the image is huge (approximate xx GB) due to the fact that *ĐArcher* works on integrated testing of Apps, which requires a GUI environment.  

The default user of the virtual machine is `darcher` with password `darcher` (in case you need root privilege).
Inside the virtual machine, the *ĐArcher* project is located at `$HOME/darcher`.
All commands below are executed at the root directory of *ĐArcher* project.

## Experiment

### DApp Subjects
- [AgroChain](https://github.com/Kerala-Blockchain-Academy/AgroChain)
- [Augur](https://augur.net/)
- [DemocracyEarth](https://github.com/DemocracyEarth)
- [ETH-Hot-Wallet](https://github.com/PaulLaux/eth-hot-wallet)
- [Ethereum-Voting-Dapp](https://github.com/maheshmurthy/ethereum_voting_dapp)
- [Giveth](https://giveth.io/)
- [Heiswap](https://github.com/kendricktan/heiswap-dapp)
- [MetaMask](https://metamask.io/)
- [Multisender](https://github.com/rstormsf/multisender)
- [PublicVotes](https://github.com/domschiener/publicvotes)
- [TodoList-Dapp](https://github.com/mbeaudru/ethereum-todolist)

### Experiment Results

The results of experiments in the paper are located in the folder

The transactions initiated and processed during the experiments are [`experiment-results`](./experiment-results).
The results are grouped by each DApp and each round of experiment. 
The experiment for each DApp is set to be 1 hour. 
We repeated experiments for each DApp 10 times (10 rounds).

Every transaction executed in each round of experiments is stored in a `.json` file, which contains:
- the stack trace of DApp where the transaction is initiated
- the off-chain state of DApp at each transaction lifecycle state
- the console error during the handling of the transaction (used as Baseline-II in the paper)
- the contract vulnerability revealed by the transaction (used as Baseline-I in the paper)

Note that to facilitate programming, the transaction lifecycle states are encoded as integers:
- 0: `Created`
- 1: `Pending`
- 2: `Executed`
- 3: `Dropped`
- 4: `Finalized`
- 5: `Reversed`
- 6: `Re-executed` (the second time the transaction reach `Executed` state)

The analysis report of all transactions of a DApp are put in a `.report.json` file.  
The report groups the transactions by the stack traces that indicate the corresponding functionalities in the DApp. 
In each group, the following things are listed: 
- A list of all transactions with this stack trace.
- A list of transactions that induce console errors in the DApp.
- A list of transactions that reveal vulnerabilities in the smart contract on blockchain.
- A list of transactions that are reported by oracles of *ĐArcher* to reveal Type-I or Type-II bugs (see the definitions in the paper) in the DApp.

### Evaluation Reproduction

To facilitate the experiments on DApps, we have built docker images (publicly available on Docker Hub [here](https://hub.docker.com/u/darcherframework)) for each DApp subject along with the controlled blockchain that traverses the transaction lifecycles. 

**Note**: Before proceeding, please make sure that the `Ethash` and `Chrome Profile` are properly set as stated in [INSTALL](./INSTALL.md#Generate Ethererum DAG)

We provide scripts to start experiments of each DApp with only one command.
```bash
yarn workspace @darcher/examples experiment:<subject>
```
`<subject>` should be substituted with one of the subject names as given above.

The script will first start the docker-compose services of the DApp (the DApp itself and the controlled blockchain). 
Then, a Chrome browser session will be created with the profile configured as [here](./INSTALL.md#Prepare the Chrome Profile).
After that, the experiment will start.

**Note**: Some DApps may take some time to initialize, so it may wait for a while after docker compose services are started. (You may see `Waiting for services in docker ready...` in the console).

**To interrupt the experiment**, press `CTRL-C` to send `SIGINT` signal. 
If the experiment is interrupted, you need to manually stop the docker-compose services using `yarn workspace @darcher/examples cleanup:<subject>`.

#### Special Case - MetaMask
Since *ĐArcher* depends on MetaMask, when using MetaMask as experiment subject, we need to do some special treatment.
The `ChromeProfile` provided contains three MetaMask extensions: `*ĐArcher* - MetaMask (the dependency of *ĐArcher*)`, `MetaMask (the subject DApp)`, and `dbMonitor (DApp off-chain state fetcher)`.
These two MetaMask extensions conflict with each other.
- When testing other DApp, we need to enable `*ĐArcher* - MetaMask` and `dbMonitor`, disabling `MetaMask`.
- When testing MetaMask, we need to enable `MetaMask`, disabling `*ĐArcher* - MetaMask` and `dbMonitor`.

We have a convenient script `yarn chrome` to open the Google Chrome browser with the profile at `ChromeProfile` folder under root directory.
Disabling and enabling extensions need to be done manually.

### Experiment Output

Each experiment will take 1 hour, and the transactions executed during the experiment will be placed under `./packages/darcher-examples/<subject>/results` directory.
A `.json` file will be generated for each transaction, as stated [above](#Experiment Results), with the off-chain states at each lifecycle states.

Note that the functionality exploration using Crawljax is a random process. 
The output may not be the same across different runs. 

After the experiment finishes, if the docker-compose services are not stopped automatically, cleanup the services using the following command:
```bash
yarn workspace @darcher/examples cleanup:<subject>
```

At this moment, the results output are only transactions with raw data of off-chain states. 
We need to further analyze the transactions using the oracles proposed in the paper.
See below.

### Analysis with _ĐArcher_ Oracles

The transactions `.json` files generated in the experiment do not reveal the on-chain-off-chain synchronization bugs in the DApp until the oracle is applied to the off-chain states. 

We provided scripts to analyze the transactions in the `scripts` folder of the root directory. 
The script `<subject>.analyze.ts` are TypeScript scripts for each subject.

Previously when off-chain states are fetched at each transaction lifecycle state, all data in the DApp are fetched.
However, some data fields that changes all the time (if considered, the off-chain and on-chain state will always be inconsistent) need to be ignored, e.g., timestamp, to reduce noises in oracle checking.
In each `<subject>.analyze.ts` script, we provide some rules to ignore those data fields if necessary for each DApp, as well as the folder containing the transactions to analyze.

To analyze the transactions of each DApp in `experiment-results` folder, run the follow command:
```bash
yarn analysis:<subject>
```
`<subject>` should be substituted with one of the subject names as given above.
The report (a `.report.json` file) as described as [above](#Experiment Results) shall be generated at the current directory.