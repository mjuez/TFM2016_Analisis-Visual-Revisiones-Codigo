import * as mongoose from "mongoose";
import { IEntity } from "../entities/IEntity";

export interface RetrieveOptions {
    filter?: Object, 
    page?: number, 
    startingFrom?: number, 
    where?: string, 
    sort?: Object,
    select?: string
}

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

    retrieve(options: RetrieveOptions): Promise<T[]>;

    findOne(filter: Object): Promise<T>;

    count(filter?: Object): mongoose.Query<number>;

    numPages(filter?: Object, startingFrom?: number): Promise<number>;

    remove(filter?: Object): Promise<void>;

}