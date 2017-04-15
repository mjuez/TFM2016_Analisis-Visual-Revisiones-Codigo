import * as mongoose from "mongoose";
import { IRepository } from "./IRepository";
import { AbstractEntity } from "../models/AbstractEntity";
import { GenericFactory } from "../util/GenericFactory";

export abstract class AbstractRepository<T extends AbstractEntity<E>, E extends mongoose.Document> implements IRepository<T, E> {

    private _model: mongoose.Model<E>;

    private _genericFactory: GenericFactory<T>;

    constructor(name: string, schema: mongoose.Schema) {
        this._model = mongoose.model<E>(name, schema);
        this._genericFactory = new GenericFactory<T>();
    }

    public get model(): mongoose.Model<E> {
        return this._model;
    }

    public create(item: T, callback: (error: any, result: any) => void): void {
        this.model.create(item.document, callback);
    }

    public retrieve(callback: (error: any, result: any) => void): void {
        this.model.find({}, callback);
    }

    public findBy(key: any, value: any, callback: (error: any, result: any) => void): void {
        this.model.find({ key: value }, (error, documents) => {
            let entities: T[] = documents.map(document => new this._genericFactory.createInstance(document));
            callback(error, entities);
        });
    }

}