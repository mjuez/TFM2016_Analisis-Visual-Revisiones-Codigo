import { IRepository } from "../data/IRepository";
import { AbstractRepository } from "./AbstractRepository";
import { IRepositoryEntity, RepositoryEntity } from "../entities/RepositoryEntity";
import { RepositoryDocument } from "../entities/documents/RepositoryDocument";
import { RepositorySchema } from "./schemas/RepositorySchema";
import { SinglePullRequestFilter } from "./filters/PullRequestFilter";
import * as mongoose from "mongoose";

/**
 * IRepositoryRepository interface.
 * Defines custom CRUD operations for a Repository.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IRepositoryRepository extends IRepository<IRepositoryEntity, RepositoryDocument> {

    /**
     * Retrieves a repository list given its GitHub owner id.
     * @param id    Owner GitHub id.
     * @returns a promise that returns a list of repository entities if resolved.
     */
    findByOwnerId(id: number): Promise<IRepositoryEntity[]>;

    findById(id: number): Promise<IRepositoryEntity>;

}

/**
 * Repository Repository class.
 * @author Mario Juez <mario@mjuez.com>
 */
export class RepositoryRepository extends AbstractRepository<IRepositoryEntity, RepositoryDocument> implements IRepositoryRepository {

    /** MongoDB collection name. */
    public static readonly COLLECTION_NAME = "repository";

    /**
     * Class constructor.
     * Creates the repository using the collection name and the Repository schema.
     * @param model     Optional mongoose model dependency injection.
     */
    constructor(model?: mongoose.Model<RepositoryDocument>) {
        super(RepositoryRepository.COLLECTION_NAME, RepositorySchema.schema, model);
    }

    /**
     * Retrieves a repository list given its GitHub owner id.
     * @param id    Owner GitHub id.
     * @returns a promise that returns a list of repository entities if resolved.
     */
    public async findByOwnerId(id: number): Promise<IRepositoryEntity[]>{
        return this.retrieve({ owner: {id: id} }); // PAGINACION!
    }

    public findById(id: number): Promise<IRepositoryEntity> {
        return this.findOne({ id: id });
    }

    public async retrievePartial(filter: Object = {}, page: number = 1, startingFrom: number = 0): Promise<IRepositoryEntity[]> {
        return this._retrievePartial(filter, page, startingFrom, 'id', { id: 1 });
    }

    public async numPages(filter: Object = {}, startingFrom: number = 0): Promise<number> {
        return this._numPages(filter, startingFrom, 'id', { id: 1 });
    }

    protected convertToEntity(document: RepositoryDocument): IRepositoryEntity {
        return RepositoryEntity.toEntity(document);
    }

    protected convertToEntityArray(documentArray: RepositoryDocument[]): IRepositoryEntity[] {
        return RepositoryEntity.toEntityArray(documentArray);
    }

    protected updateFilter(item: IRepositoryEntity): Object {
        return { id: item.id };
    }

}