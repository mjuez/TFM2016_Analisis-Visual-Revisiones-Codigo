import { IEntity } from "../entities/IEntity";

/**
 * IService interface.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IService<IEntity> {

    /**
     * Saves or updates an entity into database.
     * @param entity    an entity.
     * @param callback  optional callback function to retrieve the created/updated
     *                  entity (or an error if something goes wrong).
     */
    createOrUpdate(entity: IEntity, callback?: (err: any, result: IEntity) => void): void;
}