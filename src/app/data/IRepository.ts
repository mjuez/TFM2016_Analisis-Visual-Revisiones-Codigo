import * as mongoose from "mongoose";
import { IEntity } from "../entities/IEntity";
import * as Promise from "bluebird";

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
     * Retrieves all items of a collection from database.
     * @returns a promise that returns an array of items if resolved.
     */
    retrieve(): Promise<T[]>;

    /**
     * Finds items that one of its keys match with a specific value.
     * @param key       key to compare value.
     * @param value     value to compare 
     * @returns a promise that returns an array of items if resolved.
     */
    findBy(key: any, value: any): Promise<T[]>;

}