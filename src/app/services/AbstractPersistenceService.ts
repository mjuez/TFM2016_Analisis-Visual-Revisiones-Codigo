import { IEntity } from "../entities/IEntity";
import { IPersistenceService, IMultiplePersistenceService } from "./IPersistenceService";
import { IRepository } from "../data/IRepository";
import * as mongoose from "mongoose";

/**
 * Abstract persistence service.
 * Defines shared functionality for all persistence services.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export abstract class AbstractPersistenceService<T extends IRepository<E, any>, E extends IEntity<any>> implements IPersistenceService<E> {

    /** Repository. */
    protected readonly _repository: T;

    /**
     * Creates the persistence service.
     * 
     * @param repository    Repository dependency injection.
     */
    constructor(repository: T) {
        this._repository = repository;
    }

    /**
     * Saves or updates an entity into database.
     * 
     * @async
     * @param entity    an entity.
     * @returns the persisted entity.
     */
    public async createOrUpdate(entity: E): Promise<E> {
        let repository: T = this._repository;
        let foundEntity: E = await this.findEntity(entity);
        if (foundEntity != null) {
            try {
                await repository.update(entity);
                return entity;
            } catch (error) {
                throw error;
            }
        } else {
            try {
                return await repository.create(entity);
            } catch (error) {
                throw error;
            }
        }
    }

    /**
     * Calculates the number of pages of results.
     * 
     * @async
     * @param filter    optional filter
     * @returns the number of pages.
     */
    public async numPages(filter: Object = {}): Promise<number> {
        let repo: T = this._repository;
        return await repo.numPages(filter);
    }

    /**
     * Gets a specific page of entities sorted.
     * 
     * @async
     * @param page  Page number.
     * @param sort  Sorting filter. Specifies field and direction.
     * @returns an array of entities.
     */
    public async getSortedPage(page: number, sort: Object): Promise<E[]> {
        const repo: T = this._repository;
        return repo.retrieve({ page, sort });
    }

    /**
     * Template method.
     * Finds a persisted entity.
     *
     * @async 
     * @param entity    A in-memory entity to find the
     *                  persisted one.
     * @returns the persisted entity.
     */
    protected abstract async findEntity(entity: E): Promise<E>;

}

/**
 * Abstract Multiple Persistence Service.
 * Declares functionality for those services that can
 * persist multiple entities.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export abstract class AbstractMultiplePersistenceService<T extends IRepository<E, any>, E extends IEntity<any>> extends AbstractPersistenceService<T, E> implements IMultiplePersistenceService<E> {

    /**
     * Creates the persistence service.
     * 
     * @param repository    Repository dependency injection.
     */
    constructor(repository: T) {
        super(repository);
    }

    /**
     * Saves or updates many entities into database.
     * 
     * @param entities    an entity array.
     * @returns a list of persisted entities.
     */
    public async createOrUpdateMultiple(entities: E[]): Promise<E[]> {
        let entitiesResult: E[] = [];
        for (let i = 0; i < entities.length; i++) {
            const entity: E = entities[i];
            const persisted: E = await this.createOrUpdate(entity);
            entitiesResult.push(persisted);
        }
        return entitiesResult;
    }

    /**
     * Template method.
     * Finds a persisted entity.
     *
     * @async 
     * @param entity    A in-memory entity to find the
     *                  persisted one.
     * @returns the persisted entity.
     */
    protected abstract async findEntity(entity: E): Promise<E>;

}