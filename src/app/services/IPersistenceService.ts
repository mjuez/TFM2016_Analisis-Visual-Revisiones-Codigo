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
     * @returns a promise that returns an entity if resolved.
     */
    createOrUpdate(entity: IEntity): Promise<IEntity>;

    /**
     * Saves or updates many entities into database.
     * @param entities  an array of entities.
     * @returns a promise that retrns an array of entities if resolved.
     */
    createOrUpdateMultiple(entities: IEntity[]): Promise<IEntity[]>;

}