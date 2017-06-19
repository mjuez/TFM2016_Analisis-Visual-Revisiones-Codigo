import { IEntity } from "../entities/IEntity";

/**
 * IPersistenceService interface.
 * Declares shared functionality for all persistence services.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */

export interface IPersistenceService<T extends IEntity<any>> {

    /**
     * Saves or updates an entity into database.
     * 
     * @param entity    an entity.
     * @returns the persisted entity.
     */
    createOrUpdate(entity: T): Promise<T>;

    /**
     * Calculates the number of pages of results.
     * 
     * @param filter    optional filter
     * @returns the number of pages.
     */
    numPages(filter?: Object): Promise<number>;

}

/**
 * IMultiplePersistenceService interface.
 * Declares functionality for those services that can
 * persist multiple entities.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IMultiplePersistenceService<T extends IEntity<any>> extends IPersistenceService<T> {

    /**
     * Saves or updates many entities into database.
     * 
     * @param entities    an entity array.
     * @returns a list of persisted entities.
     */
    createOrUpdateMultiple(entities: T[]): Promise<T[]>;

}