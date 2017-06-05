import { IEntity } from "../entities/IEntity";
import { IPersistenceService, IMultiplePersistenceService } from "./IPersistenceService";
import { IRepository } from "../data/IRepository";
import * as mongoose from "mongoose";

/**
 * AbstractPersistenceService.
 * @author Mario Juez <mario@mjuez.com>
 */
export abstract class AbstractPersistenceService<T extends IRepository<E, S>, E extends IEntity<S>, S extends mongoose.Document> implements IPersistenceService<E> {

    protected readonly _repository: T;

    constructor(repository: T){
        this._repository = repository;
    }
    
    /**
     * Saves or updates an entity into database.
     * @param entity    an entity.
     * @returns a promise that returns an entity if resolved.
     */
    public async createOrUpdate(entity: E): Promise<E>{
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

    public async numPages(): Promise<number> {
        let repo: T = this._repository;
        return await repo.numPages();
    }

    public async getSortedPage(page: number, sort: Object): Promise<E[]> {
        const repo: T = this._repository;
        return repo.retrieve({ page, sort });
    }

    protected abstract async findEntity(entity: E): Promise<E>;

}

/**
 * AbstractMultiplePersistenceService.
 * @author Mario Juez <mario@mjuez.com>
 */
export abstract class AbstractMultiplePersistenceService<T extends IRepository<E, S>, E extends IEntity<S>, S extends mongoose.Document> extends AbstractPersistenceService<T, E, S> implements IMultiplePersistenceService<E> {

    constructor(repository: T){
        super(repository);
    }
    
    /**
     * Saves or updates many Reviews into database.
     * @param entity    a Review array.
     * @returns a promise that returns an array of review entities if resolved.
     */
    public async createOrUpdateMultiple(entities: E[]): Promise<E[]> {
        let entitiesResult: E[] = [];
        await entities.map(async (entity) => {
            try {
                let persisted: E = await this.createOrUpdate(entity);
                entitiesResult.push(persisted);
            } catch (error) {
                throw error;
            }
        });
        return entitiesResult;
    }

    protected abstract async findEntity(entity: E): Promise<E>;

}