import * as mongoose from "mongoose";
import { IRepository } from "./IRepository";
import { IEntity } from "../entities/IEntity";

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
        if (model) {
            this._model = model;
        } else {
            try {
                this._model = mongoose.model<E>(name);
            } catch (error) {
                this._model = mongoose.model<E>(name, schema);
            }
        }
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
    public async create(item: T): Promise<T> {
        try {
            let persistedDocument: E = await this.model.create(item.document);
            let entity: T = this.convertToEntity(persistedDocument);
            return entity;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Updates an item from database.
     * @param item      Item with updated data.
     * @returns a promise that returns the number of rows affected if resolved.
     */
    public async update(item: T): Promise<number> {
        try {
            let result: any = await this.model.update(this.updateFilter(item), item.document);
            return result.nModified;
        } catch (error) {
            return error;
        }
    }

    /**
     * Retrieves filtered items of a collection from database.
     * @param filter      Document filter, by default an empty filter
     *                    which retrieves all items of a collection.
     * @returns a promise that returns an array of items if resolved.
     */
    public async retrieve(filter: Object = {}): Promise<T[]> {
        try {
            let documentArray: E[] = await this.model.find(filter);
            let entityArray: T[] = this.convertToEntityArray(documentArray);
            return entityArray;
        }catch(error){
            throw error;
        }
    }

    public async findOne(filter: Object): Promise<T> {
        try {
            let document: E = await this.model.findOne(filter);
            let entity: T = this.convertToEntity(document);
            return entity;
        } catch (error) {
            return error;
        }
    }

    // template method
    protected abstract convertToEntity(documentArray: E): T;

    // template method
    protected abstract convertToEntityArray(documentArray: E[]): T[];

    protected abstract updateFilter(item: T): Object;

}