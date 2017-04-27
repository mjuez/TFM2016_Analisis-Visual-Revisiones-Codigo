import * as mongoose from "mongoose";
import { IRepository } from "./IRepository";
import { IEntity } from "../entities/IEntity";
import * as Promise from "bluebird";

/**
 * Abstract Repository class. Includes all functionality that every
 * repository should have (shared CRUD functionality).
 * @author Mario Juez <mario@mjuez.com>
 */
export abstract class AbstractRepository<T extends IEntity<E>, E extends mongoose.Document> implements IRepository<T, E> {

    /** Mongoose Model (repository). */
    private readonly _model: mongoose.Model<E>;

    /**
     * Class constructor. Creates a Mongoose Model given
     * a name and a schema.
     * @param name      Mongoose collection name.
     * @param schema    Mongoose entity schema.
     * @param model     Optional mongoose model dependency injection.
     */
    constructor(name: string, schema: mongoose.Schema, model?: mongoose.Model<E>) {
        this._model = model || mongoose.model<E>(name, schema);
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

}