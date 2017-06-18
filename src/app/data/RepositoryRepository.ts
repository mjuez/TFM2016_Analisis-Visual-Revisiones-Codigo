import { IRepository, RetrieveOptions } from "../data/IRepository";
import { AbstractRepository } from "./AbstractRepository";
import { IRepositoryEntity, RepositoryEntity } from "../entities/RepositoryEntity";
import { RepositoryDocument } from "../entities/documents/RepositoryDocument";
import { RepositorySchema } from "./schemas/RepositorySchema";
import { SinglePullRequestFilter } from "./filters/PullRequestFilter";
import * as mongoose from "mongoose";

/**
 * IRepositoryRepository interface.
 * Defines custom CRUD operations for a Repository.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IRepositoryRepository extends IRepository<IRepositoryEntity, RepositoryDocument> {

    /**
     * Retrieves a repository list given its GitHub owner id.
     * @param id    Owner GitHub id.
     * @returns a list of repository entities.
     */
    findByOwnerId(id: number, page?: number, startingFrom?: number): Promise<IRepositoryEntity[]>;

    /**
     * Retrieves a repository given its GitHub id.
     * 
     * @param id        repository GitHub id.
     * @returns a repository entity.
     */
    findById(id: number): Promise<IRepositoryEntity>;

}

/**
 * GitHub Repository Repository class.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class RepositoryRepository extends AbstractRepository<IRepositoryEntity, RepositoryDocument> implements IRepositoryRepository {

    /** MongoDB collection name. */
    public static readonly COLLECTION_NAME = "repository";

    /**
     * Class constructor.
     * Creates the repository using the collection name and the Repository schema.
     * 
     * @param model     Optional mongoose model dependency injection.
     */
    constructor(model?: mongoose.Model<RepositoryDocument>) {
        super(RepositoryRepository.COLLECTION_NAME, RepositorySchema.schema, model);
    }

    /**
     * Retrieves a repository list given its GitHub owner id.
     * 
     * @param id    Owner GitHub id.
     * @returns a list of repository entities.
     */
    public async findByOwnerId(id: number, page: number = 1, startingFrom: number = 0): Promise<IRepositoryEntity[]> {
        const filter: Object = { owner: { id: id } };
        return await this.retrieve({ filter, page, startingFrom });
    }

    /**
     * Retrieves a repository given its GitHub id.
     * 
     * @param id    repository GitHub id.
     * @returns a repository entity.
     */
    public async findById(id: number): Promise<IRepositoryEntity> {
        return await this.findOne({ id: id });
    }

    /**
     * Retrieves an array of repositories from database
     * given retrieving options.
     * 
     * @param param0    optional retrieving options.
     * @returns an array of repository entities.
     */
    public async retrieve({
        filter = {},
        page,
        startingFrom = 0,
        where = 'id',
        sort = { id: 1 },
        select = '' }: RetrieveOptions = {}): Promise<IRepositoryEntity[]> {

        return await this._retrieve({ filter, page, startingFrom, where, sort, select });
    }

    /**
     * Obtains the number of pages given a filter and 
     * a starting from value.
     * It allows to count the number of pages starting
     * from a specific repository id.
     * 
     * @param filter        filtering options.
     * @param startingFrom  starting from value.
     * @returns number of pages.
     */
    public async numPages(filter: Object = {}, startingFrom: number = 0): Promise<number> {
        return await this._numPages(filter, startingFrom, 'id');
    }

    /**
     * Converts a repository document to a
     * repository entity.
     * 
     * @param document  repository document.
     * @returns a repository entity.
     */
    protected convertToEntity(document: RepositoryDocument): IRepositoryEntity {
        return RepositoryEntity.toEntity(document);
    }

    /**
     * Converts a repository document array to an
     * array of repository entities.
     * 
     * @param documentArray repository document array.
     * @returns a repository entity array.
     */
    protected convertToEntityArray(documentArray: RepositoryDocument[]): IRepositoryEntity[] {
        return RepositoryEntity.toEntityArray(documentArray);
    }

    /**
     * Creates a filter for updating a repository entity.
     * The filter sets the id field as the repository id.
     * 
     * @param item  repository entity.
     * @return update filter.
     */
    protected updateFilter(item: IRepositoryEntity): Object {
        return { id: item.id };
    }

}