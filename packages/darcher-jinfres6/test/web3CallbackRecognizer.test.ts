import {expect, assert} from "chai";
import {Recognizer} from "../src/runtime/hooks/Web3CallbackHook";

describe("web3 callback recognizer testing", () => {
    it('should recognize txHash callback', function () {
        let hash = "0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8b";
        expect(Recognizer.isHash(hash)).to.equal(true);
        // sendTransaction 'txHash' PromiEvent callback
        let args: any = [hash];
        expect(Recognizer.checkTxHashCallback(args, txHash => {
            expect(txHash).to.equal(hash);
        })).to.equal(true);
        // sendTransaction default callback
        args = [null, hash];
        expect(Recognizer.checkTxHashCallback(args, txHash => {
            expect(txHash).to.equal(hash);
        })).to.equal(true);
        // sendTransaction default callback with error not null
        args = [{}, hash];
        expect(Recognizer.checkTxHashCallback(args, txHash => {
            assert(false);
        })).to.equal(false);
        // other scenarios
        args = [];
        expect(Recognizer.checkTxHashCallback(args)).to.equal(false);
        args = [123456];
        expect(Recognizer.checkTxHashCallback(args)).to.equal(false);
    });

    it('should recognize receipt callback', function () {
        let receipt = {
            "transactionHash": "0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8b",
            "transactionIndex": 0,
            "blockHash": "0xef95f2f1ed3ca60b048b4bf67cde2195961e0bba6f70bcbea9a2c4e133e34b46",
            "blockNumber": 3,
            "contractAddress": "0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe",
            "cumulativeGasUsed": 314159,
            "gasUsed": 30234,
            "events": {
                "MyEvent": {
                    returnValues: {
                        myIndexedParam: 20,
                        myOtherIndexedParam: '0x123456789',
                        myNonIndexParam: 'My String'
                    },
                    raw: {
                        data: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
                        topics: ['0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7', '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385']
                    },
                    event: 'MyEvent',
                    signature: '0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7',
                    logIndex: 0,
                    transactionIndex: 0,
                    transactionHash: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
                    blockHash: '0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7',
                    blockNumber: 1234,
                    address: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe'
                },
            }
        };
        assert(Recognizer.isReceipt(receipt));
        // sendTransaction 'receipt' PromiEvent callback
        let args: any[] = [receipt];
        expect(Recognizer.checkReceiptCallback(args, receipt1 => {
            expect(receipt1).to.equal(receipt);
        })).to.equal(true);
        // other scenarios
        args = [];
        expect(Recognizer.checkReceiptCallback(args, receipt1 => {
            assert(false);
        })).to.equal(false);
        args = [{"blockHash": "0xef95f2f1ed3ca60b048b4bf67cde2195961e0bba6f70bcbea9a2c4e133e34b46"}];
        expect(Recognizer.checkReceiptCallback(args, receipt1 => {
            assert(false);
        })).to.equal(false);
    });

    it('should recognize confirmation callback', function () {
        let receipt = {
            "transactionHash": "0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8b",
            "transactionIndex": 0,
            "blockHash": "0xef95f2f1ed3ca60b048b4bf67cde2195961e0bba6f70bcbea9a2c4e133e34b46",
            "blockNumber": 3,
            "contractAddress": "0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe",
            "cumulativeGasUsed": 314159,
            "gasUsed": 30234,
            "events": {
                "MyEvent": {
                    returnValues: {
                        myIndexedParam: 20,
                        myOtherIndexedParam: '0x123456789',
                        myNonIndexParam: 'My String'
                    },
                    raw: {
                        data: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
                        topics: ['0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7', '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385']
                    },
                    event: 'MyEvent',
                    signature: '0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7',
                    logIndex: 0,
                    transactionIndex: 0,
                    transactionHash: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
                    blockHash: '0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7',
                    blockNumber: 1234,
                    address: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe'
                },
            }
        };
        assert(Recognizer.isReceipt(receipt));
        assert(!Recognizer.isEvent(receipt));
        // sendTransaction 'confirmation' PromiEvent callback
        let args: any[] = [1, receipt];
        expect(Recognizer.checkConfirmationCallback(args, (confirmationNumber, receipt1) => {
            expect(confirmationNumber).to.equal(1);
            expect(receipt1).to.equal(receipt);
        })).to.equal(true);
        // other scenarios
        args = [-1, receipt];
        expect(Recognizer.checkConfirmationCallback(args, () => {
            assert(false);
        })).to.equal(false);
        args = [receipt];
        expect(Recognizer.checkConfirmationCallback(args, () => {
            assert(false);
        })).to.equal(false);
        args = [];
        expect(Recognizer.checkConfirmationCallback(args, () => {
            assert(false);
        })).to.equal(false);
    });

    it('should recognize event data', function () {
        let event = {
            returnValues: {
                myIndexedParam: 20,
                myOtherIndexedParam: '0x123456789',
                myNonIndexParam: 'My String'
            },
            raw: {
                data: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
                topics: ['0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7', '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385']
            },
            event: 'MyEvent',
            signature: '0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7',
            logIndex: 0,
            transactionIndex: 0,
            transactionHash: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a913',
            blockHash: '0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ea',
            blockNumber: 1234,
            address: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe'
        };
        assert(Recognizer.isEvent(event));
        assert(!Recognizer.isReceipt(event));
        // subscribe event default callback
        let args: any[] = [null, event];
        expect(Recognizer.checkEventDataCallback(args, event1 => {
            expect(event1).to.equal(event);
        })).to.equal(true);
        // subscribe event 'data' PromiEvent callback
        args = [event];
        expect(Recognizer.checkEventDataCallback(args, event1 => {
            expect(event1).to.equal(event);
        })).to.equal(true);
        // other scenarios
        args = [];
        expect(Recognizer.checkEventDataCallback(args, () => {
            assert(false);
        })).to.equal(false);
    });

    it('should recognize event change callback', function () {
        let event = {
            returnValues: {
                myIndexedParam: 20,
                myOtherIndexedParam: '0x123456789',
                myNonIndexParam: 'My String'
            },
            raw: {
                data: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
                topics: ['0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7', '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385']
            },
            event: 'MyEvent',
            removed: true,
            signature: '0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7',
            logIndex: 0,
            transactionIndex: 0,
            transactionHash: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a913',
            blockHash: '0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ea',
            blockNumber: 1234,
            address: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe'
        };
        assert(Recognizer.isEvent(event, true));
        // subscribe event default callback
        let args: any[] = [null, event];
        expect(Recognizer.checkEventChangedCallback(args, event1 => {
            expect(event1).to.equal(event);
        })).to.equal(true);
        // subscribe event 'data' PromiEvent callback
        args = [event];
        expect(Recognizer.checkEventChangedCallback(args, event1 => {
            expect(event1).to.equal(event);
        })).to.equal(true);
        // other scenarios
        args = [];
        expect(Recognizer.checkEventChangedCallback(args, () => {
            assert(false);
        })).to.equal(false);
    });
});
