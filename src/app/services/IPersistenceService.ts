import { IEntity } from "../entities/IEntity";

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

}

/**
 * IMultiplePersistenceService interface.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IMultiplePersistenceService<IEntity> extends IPersistenceService<IEntity> {

    /**
     * Saves or updates many entities into database.
     * @param entity    a entity array.
     * @returns a promise that returns an array of entities if resolved.
     */
    createOrUpdateMultiple(entities: IEntity[]): Promise<IEntity[]>

}