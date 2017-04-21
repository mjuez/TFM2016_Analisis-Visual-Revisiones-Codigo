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
     * @param callback  Callback function to retrieve the created item
     *                  or an error if something goes wrong.
     */
    create(item: T, callback: (error: any, result: any) => void): void;

    /**
     * Updates an item from database.
     * @param item      Item with updated data.
     * @param callback  Callback function to retrieve the number of updated
     *                  items or an error if something goes wrong.
     */
    update(item: T, callback: (error: any, rowsAffected: number) => void): void;
    
    /**
     * Retrieves all items of a collection from database.
     * @param callback  Callback function to retrieve the items
     *                  or an error if something goes wrong.
     */
    retrieve(callback: (error: any, result: any) => void): void;

    /**
     * Finds items that one of its keys match with a specific value.
     * @param key       key to compare value.
     * @param value     value to compare 
     * @param callback  Callback function to retrieve the items
     *                  or an error if something goes wrong.
     */
    findBy(key: any, value: any, callback: (error: any, result: any) => void): void;

}