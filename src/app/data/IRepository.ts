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
     * @param callback  Callback function to retrieve the created item
     *                  or an error if something goes wrong.
     */
    create(item: T): Promise<T>;

    /**
     * Updates an item from database.
     * @param item      Item with updated data.
     * @param callback  Callback function to retrieve the number of updated
     *                  items or an error if something goes wrong.
     */
    update(item: T): Promise<number>;

    /**
     * Retrieves all items of a collection from database.
     * @param callback  Callback function to retrieve the items
     *                  or an error if something goes wrong.
     */
    retrieve(): Promise<T[]>;

    /**
     * Finds items that one of its keys match with a specific value.
     * @param key       key to compare value.
     * @param value     value to compare 
     * @param callback  Callback function to retrieve the items
     *                  or an error if something goes wrong.
     */
    findBy(key: any, value: any): Promise<T[]>;

}