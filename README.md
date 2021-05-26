# *ĐArcher* - Detecting On-Chain-Off-Chain Synchronization Bugs in Decentralized Applications 

*ĐArcher* is an automated testing framework aiming to test on-chain-off-chain synchronization bugs in [decentralized applications (DApps)](https://ethereum.org/en/dapps/).

A DApp usually consists of an on-chain layer (smart contracts on blockchain) and an off-chain layer (programs running outside blockchain).
The on-chain layer provides adequate security to the DApp, while the off-chain layer focuses on the performance and user experience. 
The on-chain and off-chain layers cooperate to provide various kinds of high-quality services to ordinary users. 

The consistency between on-chain and off-chain layers of a DApp matters.
On-chain-off-chain synchronization bugs refer to those bugs that result in the state of the off-chain to be inconsistent with that of the on-chain layer.
The inconsistencies may result in significant consequences, such as financial loss or make unexpected changes in the DApp. 
*ĐArcher* aims to detect these bugs on top of fuzzing with some oracles, as proposed in the paper. 

## Publication

## Requirements

See [REQUIREMENTS](./REQUIREMENTS.md)

## Installation

Clone this project:
```bash
git clone --recurse-submodules https://github.com/Troublor/darcher.git && cd darcher 
```
**Note**: This project contains several submodules. Be sure to add `--recurse-submodules` when git cloning.

See [INSTALL](./INSTALL.md)

## Experiment Results

### Subjects
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

### Transactions during Testing

The transactions initiated and processed during the experiments are
in folder [`experiment-results`](./experiment-results), where each
transaction is stored along with the `off-chain states` of the DApp at each lifecycle state.

### Transaction Analysis with _ĐArcher_ Oracles

The transactions in `experiment-results` do not indicate the on-chain-off-chain synchronization bugs in the DApp until the oracle is applied to the off-chain states. 

Run the follow command in terminal to analysis the transactions of a subject using oracles.
```bash
yarn analysis:<subject>
```
`<subject>` should be substituted with one of the subject names as given above.
The report (a `.report.json` file) shall be generated at the current directory.

The report groups transactions with the stack trace where they are initiated in DApps.
We consider different transactions with the same stack trace as explorations of the same functionality in the DApp.
The report marks the transactions as buggy (Type-I or Type-II bugs) if they violate oracles in ĐArcher or baselines.

## Evaluation Reproduction

To generate the raw data in `experiment-results` folder, we need to reproduce the experiment. 

**Note**: Before start, please make sure that the `Ethash` and `Chrome Profile` are properly set as stated in [INSTALL](./INSTALL.md#Generate Ethererum DAG)

Run the following command to start experiment of each subject:
```bash
yarn workspace @darcher/examples experiment:<subject>
```
`<subject>` should be substituted with one of the subject names as given above.

The experiment will take 1 hour, and the results will be generated at `./packages/darcher-examples/<subject>/results` directory.

After the experiment finishes, cleanup the services used in the experiment using the following command:
```bash
yarn workspace @darcher/examples cleanup:<subject>
```