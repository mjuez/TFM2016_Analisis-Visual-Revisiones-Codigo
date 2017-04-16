import * as mongoose from "mongoose";

export interface IEntity<T extends mongoose.Document> {
    document: T;
}