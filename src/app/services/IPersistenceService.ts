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