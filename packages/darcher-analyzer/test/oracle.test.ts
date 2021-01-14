import {
    ConsoleErrorOracle,
    ContractVulnerabilityOracle,
    DBChangeOracle,
    DBContentDiff,
    VulnerabilityType,
    Severity,
    TableContentDiff,
    TableRecord,
    TxErrorOracle, DBContentDiffFilter,
} from "../src/oracle";
import {expect} from "chai";
import {
    ConsoleErrorMsg,
    ContractVulReport,
    ContractVulType,
    DBContent,
    TableContent,
    TxErrorMsg,
    TxErrorType,
} from "@darcher/rpc";
import * as _ from "lodash";
import {LogicalTxState} from "../src";


describe("Oracle Tests", () => {
    describe("DBChangeOracle", () => {
        it("should TableRecord sameKeyAs works right", function () {
            const keyPath = ["id1", "id2"];
            const base = {
                "id1": "aaa",
                "id2": "bbb",
                "msg": "hello",
            };
            const same = {
                "id1": "aaa",
                "id2": "bbb",
                "msg": "hello world",
            };
            const diff = {
                "id1": "aaa",
                "id2": "ccc",
                "msg": "hi",
            };
            const r_base = new TableRecord(keyPath, base);
            expect(r_base.sameKeyAs(new TableRecord(["id1"], {}))).to.be.false;
            expect(r_base.sameKeyAs(new TableRecord(["id1", "id2"], JSON.stringify(same)))).to.be.true;
            expect(r_base.sameKeyAs(new TableRecord(keyPath, diff))).to.be.false;
            expect(r_base.sameKeyAs(new TableRecord(keyPath, {}))).to.be.false;
        });

        it("should TableRecord differentFrom works right", function () {
            const keyPath = ["id1", "id2"];
            const base = {
                "id1": "aaa",
                "id2": "bbb",
                "msg": "hello",
            };
            const same = {
                "id2": "bbb",
                "msg": "hello",
                "id1": "aaa",
            };
            const diff = {
                "id1": "aaa",
                "id2": "bbb",
                "msg": "hi",
            };
            const r_base = new TableRecord(keyPath, base);
            expect(r_base.equalTo(new TableRecord(["id1", "id3"], {}))).to.be.false;
            expect(r_base.equalTo(new TableRecord(["id2", "id1"], same))).to.be.true;
            expect(r_base.equalTo(new TableRecord(["id1", "id2"], diff))).to.be.false;
        });

        it("should TableContentDiff calDiff works right", function () {
            const base: TableContent = new TableContent();
            base.setKeypathList(["id"]).setEntriesList([
                JSON.stringify({
                    "id": "1",
                    "msg": "aaa",
                    "data": "AAA",
                }),
                JSON.stringify({
                    "id": "2",
                    "msg": "bbb",
                    "data": "BBB",
                }),
                JSON.stringify({
                    "id": "3",
                    "msg": "ccc",
                    "data": "CCC",
                }),
            ]);

            const same: TableContent = new TableContent();
            same.setKeypathList(["id"]).setEntriesList([
                JSON.stringify({
                    "id": "3",
                    "msg": "ccc",
                    "data": "CCC",
                }),
                JSON.stringify({
                    "id": "1",
                    "msg": "aaa",
                    "data": "AAA",
                }),
                JSON.stringify({
                    "id": "2",
                    "msg": "bbb",
                    "data": "BBB",
                }),
            ]);

            // define the different TableContent
            const addedRecord = {
                "id": "4",
                "msg": "ddd",
                "data": "DDD",
            };
            const changedRecord_from = {
                "id": "2",
                "msg": "bbb",
                "data": "BBB",
            };
            const changedRecord_to = {
                "id": "2",
                "msg": "BBB",
                "data": "bbb",
            };
            const deletedRecords = [{
                "id": "1",
                "msg": "aaa",
                "data": "AAA",
            }, {
                "id": "3",
                "msg": "ccc",
                "data": "CCC",
            }];
            const diff: TableContent = new TableContent();
            diff.setKeypathList(["id"]).setEntriesList([
                JSON.stringify(addedRecord),
                JSON.stringify(changedRecord_to),
            ]);

            expect(new TableContentDiff("", base, same).zero()).to.be.true;
            const difference = new TableContentDiff("", base, diff);
            expect(difference.zero()).to.be.false;
            expect(difference.addedRecords).to.be.lengthOf(1);
            expect(_.isEqual(difference.addedRecords[0].data, addedRecord)).to.be.true;
            expect(difference.changedRecords).to.be.lengthOf(1);
            expect(_.isEqual(difference.changedRecords[0].from.data, changedRecord_from)).to.be.true;
            expect(_.isEqual(difference.changedRecords[0].to.data, changedRecord_to)).to.be.true;
            expect(difference.deletedRecords).to.be.lengthOf(2);
            for (const r of deletedRecords) {
                expect(_.some(difference.deletedRecords, rr => _.isEqual(r, rr.data)));
            }
        });

        it("should DBContentDiff calDiff works right", function () {
            const base = new DBContent();
            base.getTablesMap()
                .set("table1", new TableContent().setKeypathList(["id"]).setEntriesList([
                    JSON.stringify({
                        "id": "1",
                        "msg": "aaa",
                        "data": "AAA",
                    }),
                    JSON.stringify({
                        "id": "2",
                        "msg": "bbb",
                        "data": "BBB",
                    }),
                    JSON.stringify({
                        "id": "3",
                        "msg": "ccc",
                        "data": "CCC",
                    }),
                ]))
                .set("table2", new TableContent().setKeypathList(["_id"]).setEntriesList([
                    JSON.stringify({
                        "_id": "1",
                        "content": "aaa",
                    }),
                    JSON.stringify({
                        "_id": "2",
                        "content": "bbb",
                    }),
                    JSON.stringify({
                        "_id": "3",
                        "content": "ccc",
                    }),
                ]));

            const same1 = new DBContent();
            same1.getTablesMap()
                .set("table1", new TableContent().setKeypathList(["id"]).setEntriesList([
                    JSON.stringify({
                        "id": "2",
                        "msg": "bbb",
                        "data": "BBB",
                    }),
                    JSON.stringify({
                        "id": "3",
                        "msg": "ccc",
                        "data": "CCC",
                    }),
                    JSON.stringify({
                        "id": "1",
                        "msg": "aaa",
                        "data": "AAA",
                    }),
                ]))
                .set("table2", new TableContent().setKeypathList(["_id"]).setEntriesList([
                    JSON.stringify({
                        "_id": "1",
                        "content": "aaa",
                    }),
                    JSON.stringify({
                        "_id": "3",
                        "content": "ccc",
                    }),
                    JSON.stringify({
                        "_id": "2",
                        "content": "bbb",
                    }),
                ]));

            const same2 = new DBContent();
            same2.getTablesMap()
                .set("table1", new TableContent().setKeypathList(["id"]).setEntriesList([
                    JSON.stringify({
                        "id": "2",
                        "msg": "bbb",
                        "data": "BBB",
                    }),
                    JSON.stringify({
                        "id": "3",
                        "msg": "ccc",
                        "data": "CCC",
                    }),
                    JSON.stringify({
                        "id": "1",
                        "msg": "aaa",
                        "data": "AAA",
                    }),
                ]));

            const diff = new DBContent();
            diff.getTablesMap()
                .set("table1", new TableContent().setKeypathList(["id"]).setEntriesList([
                    JSON.stringify({
                        "id": "2",
                        "msg": "bbb",
                        "data": "BBB",
                    }),
                    JSON.stringify({
                        "id": "3",
                        "msg": "ccc",
                        "data": "CCC",
                    }),
                    JSON.stringify({
                        "id": "1",
                        "msg": "aaa",
                        "data": "AAA",
                    }),
                ]))
                .set("table2", new TableContent().setKeypathList(["_id"]).setEntriesList([
                    JSON.stringify({
                        "_id": "1",
                        "content": "aaa",
                    }),
                    JSON.stringify({
                        "_id": "4",
                        "content": "ddd",
                    }),
                    JSON.stringify({
                        "_id": "2",
                        "content": "bbb",
                    }),
                ]));

            expect(new DBContentDiff(base, same1).zero()).to.be.true;
            expect(new DBContentDiff(base, same2).zero()).to.be.true;
            const difference = new DBContentDiff(base, diff);
            expect(difference.zero()).to.be.false;
            const tableNames = _.keys(difference.tableDiffs);
            expect(tableNames).to.be.lengthOf(2);
            expect(_.isEqual(tableNames.sort(), ["table1", "table2"].sort())).to.be.true;
            expect(difference.tableDiffs["table1"].zero()).to.be.true;
            expect(difference.tableDiffs["table2"].zero()).to.be.false;
            const tableDiff = difference.tableDiffs["table2"];
            expect(tableDiff.deletedRecords).to.be.lengthOf(1);
            expect(tableDiff.addedRecords).to.be.lengthOf(1);
        });

        it("should ConsoleErrorOracle works well", function () {
            const txHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
            const oracle = new ConsoleErrorOracle(txHash);
            oracle.onTxState(LogicalTxState.REMOVED, null, [], [], [
                new ConsoleErrorMsg().setDappName("test_dapp").setInstanceId("1").setErrorString("console error"),
            ], []);
            expect(oracle.isBuggy()).to.be.true;
            expect(oracle.getBugReports()).to.be.lengthOf(1);
            expect(oracle.getBugReports()[0].type()).to.be.equal(VulnerabilityType.ConsoleError);
            expect(oracle.getBugReports()[0].severity()).to.be.equal(Severity.Low);
            expect(oracle.getBugReports()[0].txHash()).to.be.equal(txHash);
            expect(oracle.getBugReports()[0].message()).to.include(VulnerabilityType.ConsoleError);
        });

        it("should TransactionErrorOracle works well", function () {
            const txHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
            const oracle = new TxErrorOracle(txHash);
            oracle.onTxState(LogicalTxState.REMOVED, null, [
                new TxErrorMsg().setHash(txHash).setType(TxErrorType.REVERT).setDescription("Transaction error"),
            ], [], [], []);
            expect(oracle.isBuggy()).to.be.true;
            expect(oracle.getBugReports()).to.be.lengthOf(1);
            expect(oracle.getBugReports()[0].type()).to.be.equal(VulnerabilityType.TransactionError);
            expect(oracle.getBugReports()[0].severity()).to.be.equal(Severity.Medium);
            expect(oracle.getBugReports()[0].txHash()).to.be.equal(txHash);
            expect(oracle.getBugReports()[0].message()).to.include(VulnerabilityType.TransactionError);
        });

        it("should ContractVulnerabilityOracle works well", function () {
            const txHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
            const oracle = new ContractVulnerabilityOracle(txHash);
            oracle.onTxState(LogicalTxState.REMOVED, null, [], [
                new ContractVulReport().setTxHash(txHash).setType(ContractVulType.REENTRANCY),
            ], [], []);
            expect(oracle.isBuggy()).to.be.true;
            expect(oracle.getBugReports()).to.be.lengthOf(1);
            expect(oracle.getBugReports()[0].type()).to.be.equal(VulnerabilityType.ContractVulnerability);
            expect(oracle.getBugReports()[0].severity()).to.be.equal(Severity.High);
            expect(oracle.getBugReports()[0].txHash()).to.be.equal(txHash);
            expect(oracle.getBugReports()[0].message()).to.include(VulnerabilityType.ContractVulnerability);
        });

        it("should DBChangeOracle works well", function () {
            const txHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
            const oracle = new DBChangeOracle(txHash);
            const createdContent = new DBContent();
            createdContent.getTablesMap()
                .set("table", new TableContent().setKeypathList(["id"]).setEntriesList([
                    JSON.stringify({
                        "id": "1",
                        "data": "aaa",
                    }),
                ]));
            const pendingContent = new DBContent();
            pendingContent.getTablesMap()
                .set("table", new TableContent().setKeypathList(["id"]).setEntriesList([
                    JSON.stringify({
                        "id": "1",
                        "data": "aaa",
                        "created": true,
                    }),
                ]));
            const removedContent = new DBContent();
            removedContent.getTablesMap()
                .set("table", new TableContent().setKeypathList(["id"]).setEntriesList([
                    JSON.stringify({
                        "id": "1",
                        "data": "aaa",
                        "created": false,
                    }),
                ]));
            const confirmedContent = new DBContent();
            confirmedContent.getTablesMap()
                .set("table", new TableContent().setKeypathList(["id"]).setEntriesList([
                    JSON.stringify({
                        "id": "1",
                        "data": "aaa",
                        "created": true,
                    }),
                ]));
            oracle.onTxState(LogicalTxState.CREATED, createdContent, [], [], [], []);
            oracle.onTxState(LogicalTxState.PENDING, pendingContent, [], [], [], []);
            oracle.onTxState(LogicalTxState.REMOVED, removedContent, [], [], [], []);
            oracle.onTxState(LogicalTxState.CONFIRMED, confirmedContent, [], [], [], []);
            expect(oracle.isBuggy()).to.be.true;
            expect(oracle.getBugReports()).to.be.lengthOf(2);
            expect(oracle.getBugReports()[0].type()).to.be.equal(VulnerabilityType.UnreliableTxHash);
            expect(oracle.getBugReports()[0].severity()).to.be.equal(Severity.Low);
            expect(oracle.getBugReports()[0].txHash()).to.be.equal(txHash);
            expect(oracle.getBugReports()[0].message()).to.include(VulnerabilityType.UnreliableTxHash);
            expect(oracle.getBugReports()[1].type()).to.be.equal(VulnerabilityType.DataInconsistency);
            expect(oracle.getBugReports()[1].severity()).to.be.equal(Severity.High);
            expect(oracle.getBugReports()[1].txHash()).to.be.equal(txHash);
            expect(oracle.getBugReports()[1].message()).to.include(VulnerabilityType.DataInconsistency);
        });
    });

    describe("DBContentDiff", () => {
        it("should be able to exclude fields", function () {
            const filter: DBContentDiffFilter = {
                "table": {
                    excludes: [
                        ["transaction", "timestamp"],
                    ],
                },
            };
            const from = new DBContent();
            from.getTablesMap()
                .set(
                    "table",
                    new TableContent().setKeypathList(["id"]).setEntriesList([
                        JSON.stringify({
                            "id": 1,
                            "transaction": {
                                hash: "0x1234",
                                timestamp: 0,
                            },
                        }),
                    ]),
                );
            const to = new DBContent();
            to.getTablesMap()
                .set(
                    "table",
                    new TableContent().setKeypathList(["id"]).setEntriesList([
                        JSON.stringify({
                            "id": 1,
                            "transaction": {
                                hash: "0x1234",
                                timestamp: 1,
                            },
                        }),
                    ]),
                );
            expect(new DBContentDiff(from, to).zero()).to.be.false;
            expect(new DBContentDiff(from, to, filter).zero()).to.be.true;
        });

        it("should be able to include fields with regex", function () {
            const filterTimestamp: DBContentDiffFilter = {
                "table": {
                    includes: [
                        ["transaction", "timestamp"],
                    ],
                },
            };
            const filterHash: DBContentDiffFilter = {
                "table": {
                    includes: [
                        ["transaction", "hash"],
                    ],
                },
            };
            const from = new DBContent();
            from.getTablesMap()
                .set(
                    "table",
                    new TableContent().setKeypathList(["id"]).setEntriesList([
                        JSON.stringify({
                            "id": 1,
                            "transaction": {
                                hash: "0x1234",
                                timestamp: 0,
                            },
                        }),
                    ]),
                );
            const to = new DBContent();
            to.getTablesMap()
                .set(
                    "table",
                    new TableContent().setKeypathList(["id"]).setEntriesList([
                        JSON.stringify({
                            "id": 1,
                            "transaction": {
                                hash: "0x1234",
                                timestamp: 1,
                            },
                        }),
                    ]),
                );
            expect(new DBContentDiff(from, to).zero()).to.be.false;
            expect(new DBContentDiff(from, to, filterTimestamp).zero()).to.be.false;
            expect(new DBContentDiff(from, to, filterHash).zero()).to.be.true;
        });

        it("should be able to include fields", function () {
            const filterRegex: DBContentDiffFilter = {
                "table": {
                    includes: [
                        ["transaction", /.*/],
                    ],
                },
            };
            const from = new DBContent();
            from.getTablesMap()
                .set(
                    "table",
                    new TableContent().setKeypathList(["id"]).setEntriesList([
                        JSON.stringify({
                            "id": 1,
                            "transaction": {
                                hash: "0x1234",
                                timestamp: 0,
                            },
                        }),
                    ]),
                );
            const to = new DBContent();
            to.getTablesMap()
                .set(
                    "table",
                    new TableContent().setKeypathList(["id"]).setEntriesList([
                        JSON.stringify({
                            "id": 1,
                            "transaction": {
                                hash: "0x1234",
                                timestamp: 1,
                            },
                        }),
                    ]),
                );
            expect(new DBContentDiff(from, to).zero()).to.be.false;
            expect(new DBContentDiff(from, to, filterRegex).zero()).to.be.false;
        });
    });
});
