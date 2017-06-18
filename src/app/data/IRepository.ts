import * as mongoose from "mongoose";
import { IEntity } from "../entities/IEntity";

/**
 * Retrieving options interface.
 * It allows to filter, paginate, make subsets,
 * sort, and select specific fields.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
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
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IRepository<T extends IEntity<E>, E extends mongoose.Document> {

    /** Gets the Mongoose Model. */
    model: mongoose.Model<E>;

    /**
     * Creates an item into database.
     * @param item      Item to create.
     * @returns the created item.
     */
    create(item: T): Promise<T>;

    /**
     * Updates an item from database.
     * @param item      Item with updated data.
     * @returns the number of rows affected.
     */
    update(item: T): Promise<number>;

    /**
     * Retrieves an array of entities from database given
     * retrieving options.
     * 
     * @param options   retrieving options.
     * @returns an array of entities.
     */
    retrieve(options: RetrieveOptions): Promise<T[]>;

    /**
     * Retrieves a single entity from database.
     * @param filter    filtering options.
     * 
     * @returns one entity.
     */
    findOne(filter: Object): Promise<T>;

    /**
     * Counts the number of entities in database
     * given an optional filter.
     * 
     * @param filter    Optional filtering options.
     * @returns the number of entities.
     */
    count(filter?: Object): mongoose.Query<number>;

    /**
     * Obtains the number of pages given a filter and 
     * a starting from value.
     * 
     * @param filter        filtering options.
     * @param startingFrom  starting from value.
     * @returns number of pages.
     */
    numPages(filter?: Object, startingFrom?: number): Promise<number>;

    /**
     * Removes elements that match a filter from database.
     * 
     * @param filter filtering options.
     */
    remove(filter?: Object): Promise<void>;

}