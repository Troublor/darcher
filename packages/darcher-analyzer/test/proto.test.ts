import {DBContent, TableContent} from "@darcher/rpc";
import {expect} from "chai";

describe("protobuf definitions", () => {
    it('should keep nested type', function () {
        let dbContent = new DBContent();
        let tableContent = new TableContent();
        tableContent.setKeypathList(["a", "b"]);
        tableContent.setEntriesList(["{'c':1}"]);
        dbContent.getTablesMap().set("table", tableContent);
        let data = dbContent.serializeBinary();
        dbContent = DBContent.deserializeBinary(data);
        expect(dbContent.getTablesMap().get("table")).to.have.property("setKeypathList");
        expect(dbContent.getTablesMap().getEntryList()[0]).not.to.have.property("setKeypathList");
    });
})