import * as mongoose from "mongoose";
import { IEntity } from "../models/IEntity";

export interface IRepository<T extends IEntity<E>, E extends mongoose.Document> {
    create(item: T, callback: (error: any, result: any) => void): void;
    retrieve(callback: (error: any, result: any) => void): void;
    findBy(key: any, value: any, callback: (error: any, result: any) => void): void;
}