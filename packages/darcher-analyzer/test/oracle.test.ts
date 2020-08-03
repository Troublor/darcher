import {DBContentDiff, TableContentDiff, TableRecord} from "../src/oracle";
import {expect} from "chai";
import {DBContent, TableContent} from "@darcher/rpc";
import * as _ from "lodash";

describe("DBChangeOracle", () => {
    it('should TableRecord sameKeyAs works right', function () {
        let keyPath = ["id1", "id2"];
        let base = {
            "id1": "aaa",
            "id2": "bbb",
            "msg": "hello",
        };
        let same = {
            "id1": "aaa",
            "id2": "bbb",
            "msg": "hello world",
        };
        let diff = {
            "id1": "aaa",
            "id2": "ccc",
            "msg": "hi",
        }
        let r_base = new TableRecord(keyPath, base);
        expect(r_base.sameKeyAs(new TableRecord(["id1"], {}))).to.be.false;
        expect(r_base.sameKeyAs(new TableRecord(["id1", "id2"], JSON.stringify(same)))).to.be.true;
        expect(r_base.sameKeyAs(new TableRecord(keyPath, diff))).to.be.false;
        expect(r_base.sameKeyAs(new TableRecord(keyPath, {}))).to.be.false;
    });

    it('should TableRecord differentFrom works right', function () {
        let keyPath = ["id1", "id2"];
        let base = {
            "id1": "aaa",
            "id2": "bbb",
            "msg": "hello",
        };
        let same = {
            "id2": "bbb",
            "msg": "hello",
            "id1": "aaa",
        };
        let diff = {
            "id1": "aaa",
            "id2": "bbb",
            "msg": "hi",
        };
        let r_base = new TableRecord(keyPath, base);
        expect(r_base.equalTo(new TableRecord(["id1", "id3"], {}))).to.be.false;
        expect(r_base.equalTo(new TableRecord(["id2", "id1"], same))).to.be.true;
        expect(r_base.equalTo(new TableRecord(["id1", "id2"], diff))).to.be.false;
    });

    it('should TableContentDiff calDiff works right', function () {
        let base: TableContent = new TableContent();
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

        let same: TableContent = new TableContent();
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
        let addedRecord = {
            "id": "4",
            "msg": "ddd",
            "data": "DDD",
        };
        let changedRecord_from = {
            "id": "2",
            "msg": "bbb",
            "data": "BBB",
        }
        let changedRecord_to = {
            "id": "2",
            "msg": "BBB",
            "data": "bbb",
        };
        let deletedRecords = [{
            "id": "1",
            "msg": "aaa",
            "data": "AAA",
        }, {
            "id": "3",
            "msg": "ccc",
            "data": "CCC",
        }];
        let diff: TableContent = new TableContent();
        diff.setKeypathList(["id"]).setEntriesList([
            JSON.stringify(addedRecord),
            JSON.stringify(changedRecord_to),
        ]);

        expect(new TableContentDiff("", base, same).zero()).to.be.true;
        let difference = new TableContentDiff("", base, diff);
        expect(difference.zero()).to.be.false;
        expect(difference.addedRecords).to.be.lengthOf(1);
        expect(_.isEqual(difference.addedRecords[0].data, addedRecord)).to.be.true;
        expect(difference.changedRecords).to.be.lengthOf(1);
        expect(_.isEqual(difference.changedRecords[0].from.data, changedRecord_from)).to.be.true;
        expect(_.isEqual(difference.changedRecords[0].to.data, changedRecord_to)).to.be.true;
        expect(difference.deletedRecords).to.be.lengthOf(2);
        for (let r of deletedRecords) {
            expect(_.some(difference.deletedRecords, rr => _.isEqual(r, rr.data)));
        }
    });

    it('should DBContentDiff calDiff works right', function () {
        let base = new DBContent();
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

        let same1 = new DBContent();
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

        let same2 = new DBContent();
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

        let diff = new DBContent();
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
        let difference = new DBContentDiff(base, diff);
        expect(difference.zero()).to.be.false;
        let tableNames = _.keys(difference.tableDiffs);
        expect(tableNames).to.be.lengthOf(2);
        expect(_.isEqual(tableNames.sort(), ["table1", "table2"].sort())).to.be.true;
        expect(difference.tableDiffs["table1"].zero()).to.be.true;
        expect(difference.tableDiffs["table2"].zero()).to.be.false;
        let tableDiff = difference.tableDiffs["table2"];
        expect(tableDiff.deletedRecords).to.be.lengthOf(1);
        expect(tableDiff.addedRecords).to.be.lengthOf(1);
    });
});