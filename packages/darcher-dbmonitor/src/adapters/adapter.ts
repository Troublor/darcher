import {DBContent} from "@darcher/rpc";

export default interface Adapter {
    connect(): Promise<Adapter>;

    close(): Promise<void>;

    getAllData(dbName: string): Promise<DBContent>;
}
