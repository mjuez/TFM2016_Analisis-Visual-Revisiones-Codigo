import * as mongoose from "mongoose";
import { IRepository } from "./IRepository";
import { IEntity } from "../entities/IEntity";
import { GenericFactory } from "../util/GenericFactory";
import * as Promise from "bluebird";

/**
 * Abstract Repository class. Includes all functionality that every
 * repository should have (shared CRUD functionality).
 * @author Mario Juez <mario@mjuez.com>
 */
export abstract class AbstractRepository<T extends IEntity<E>, E extends mongoose.Document> implements IRepository<T, E> {

    /** Mongoose Model (repository). */
    private readonly _model: mongoose.Model<E>;

    /** Generic Factory utility. */
    private readonly _genericFactory: GenericFactory<T>;

    /**
     * Class constructor. Creates a Mongoose Model given
     * a name and a schema.
     * @param name      Mongoose collection name.
     * @param schema    Mongoose entity schema.
     */
    constructor(name: string, schema: mongoose.Schema) {
        this._model = mongoose.model<E>(name, schema);
        this._genericFactory = new GenericFactory<T>();
    }

    /** Gets the Mongoose Model. */
    public get model(): mongoose.Model<E> {
        return this._model;
    }

    /**
     * Creates an item into database.
     * @param item      Item to create.
     * @returns a promise that returns the item created if resolved.
     */
    public create(item: T): Promise<T> {
        return this.model.create(item.document);
    }

    /**
     * Updates an item from database.
     * @param item      Item with updated data.
     * @returns a promise that returns the number of rows affected if resolved.
     */
    public abstract update(item: T): Promise<number>;

    /**
     * Retrieves all items of a collection from database.
     * @returns a promise that returns an array of items if resolved.
     */
    public retrieve(): Promise<T[]> {
        let promise: Promise<T[]> = new Promise<T[]>((resolve, reject) => {
            this.model.find({}, (err, res) => {
                if (!err) {
                    resolve(res);
                } else {
                    reject(err);
                }
            });
        });

        return promise;
    }

    /**
     * Finds items that one of its keys match with a specific value.
     * @param key       key to compare value.
     * @param value     value to compare 
     * @returns a promise that returns an array of items if resolved.
     */
    public findBy(key: any, value: any): Promise<T[]> {
        let promise: Promise<T[]> = new Promise<T[]>((resolve, reject) => {
            this.model.find({ key: value }, (error, documents) => {
                if (!error) {
                    let entities: T[] = documents.map(document => new this._genericFactory.createInstance(document));
                    resolve(entities);
                } else {
                    reject(error);
                }
            });
        });

        return promise;
    }

}