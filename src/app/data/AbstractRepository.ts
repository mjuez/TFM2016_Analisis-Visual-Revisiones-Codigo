import * as mongoose from "mongoose";
import { IRepository } from "./IRepository";
import { IEntity } from "../entities/IEntity";
import { GenericFactory } from "../util/GenericFactory";

/**
 * Abstract Repository class. Includes all functionality that every
 * repository should have (shared CRUD functionality).
 * @author Mario Juez <mario@mjuez.com>
 */
export abstract class AbstractRepository<T extends IEntity<E>, E extends mongoose.Document> implements IRepository<T, E> {

    /** Mongoose Model (repository). */
    private _model: mongoose.Model<E>;

    /** Generic Factory utility. */
    private _genericFactory: GenericFactory<T>;

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
     * @param callback  Callback function to retrieve the created item
     *                  or an error if something goes wrong.
     */
    public create(item: T, callback: (error: any, result: any) => void): void {
        this.model.create(item.document, callback);
    }

    /**
     * Updates an item from database.
     * @param item      Item with updated data.
     * @param callback  Callback function to retrieve the number of updated
     *                  items or an error if something goes wrong.
     */
    public abstract update(item: T, callback: (error: any, result: any) => void): void;

    /**
     * Retrieves all items of a collection from database.
     * @param callback  Callback function to retrieve the items
     *                  or an error if something goes wrong.
     */
    public retrieve(callback: (error: any, result: any) => void): void {
        this.model.find({}, callback);
    }

    /**
     * Finds items that one of its keys match with a specific value.
     * @param key       key to compare value.
     * @param value     value to compare 
     * @param callback  Callback function to retrieve the items
     *                  or an error if something goes wrong.
     */
    public findBy(key: any, value: any, callback: (error: any, result: any) => void): void {
        this.model.find({ key: value }, (error, documents) => {
            let entities: T[] = documents.map(document => new this._genericFactory.createInstance(document));
            callback(error, entities);
        });
    }

}