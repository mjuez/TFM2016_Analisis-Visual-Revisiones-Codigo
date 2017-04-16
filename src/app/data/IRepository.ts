import * as mongoose from "mongoose";
import { IEntity } from "../entities/IEntity";

export interface IRepository<T extends IEntity<E>, E extends mongoose.Document> {
    model: mongoose.Model<E>;
    create(item: T, callback: (error: any, result: any) => void): void;
    update(item: T, callback: (error: any, rowsAffected: number) => void): void;
    retrieve(callback: (error: any, result: any) => void): void;
    findBy(key: any, value: any, callback: (error: any, result: any) => void): void;
}