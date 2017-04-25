import { IEntity } from "../entities/IEntity";
import * as Promise from "bluebird";

/**
 * IPersistenceService interface.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IPersistenceService<IEntity> {

    /**
     * Saves or updates an entity into database.
     * @param entity    an entity.
     * @param callback  optional callback function to retrieve the created/updated
     *                  entity (or an error if something goes wrong).
     */
    createOrUpdate(entity: IEntity): Promise<IEntity>;

    /**
     * Saves or updates many entities into database.
     * @param entities  an array of entities.
     * @param callback  optional callback function to retrieve the created/updated
     *                  entity array (or an error if something goes wrong).
     */
    createOrUpdateMultiple(entities: IEntity[]): Promise<IEntity[]>;
    
}