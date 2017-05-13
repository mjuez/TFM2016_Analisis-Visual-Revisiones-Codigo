import * as mongoose from "mongoose";
import { IEntity } from "../entities/IEntity";

/**
 * IRepository interface.
 * Defines all functions that every repository should implement (CRUD).
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IRepository<T extends IEntity<E>, E extends mongoose.Document> {

    /** Gets the Mongoose Model. */
    model: mongoose.Model<E>;

    /**
     * Creates an item into database.
     * @param item      Item to create.
     * @returns a promise that returns the item created if resolved.
     */
    create(item: T): Promise<T>;

    /**
     * Updates an item from database.
     * @param item      Item with updated data.
     * @returns a promise that returns the number of rows affected if resolved.
     */
    update(item: T): Promise<number>;

    /**
     * Retrieves filtered items of a collection from database.
     * @param filter      Document filter.
     * @returns a promise that returns an array of items if resolved.
     */
    retrieve(filter?: Object): Promise<T[]>;

}