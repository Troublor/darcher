import {DBContent} from "@darcher/rpc";

export default interface Adapter {
    connect(): Promise<Adapter>;

    getAllData(dbName: string): Promise<DBContent>;
}