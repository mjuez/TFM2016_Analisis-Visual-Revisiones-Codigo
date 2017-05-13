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

    /**
     * Retrieves a repository given its GitHub owner id and its name.
     * @param ownerId   Owner GitHub id.
     * @param name      Owner GitHub id.
     * @returns a promise that returns a repository entity if resolved.
     */
    findOne(ownerId: number, name: string): Promise<IRepositoryEntity>;

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
     * Updates a Repository from database. Uses its GitHub id.
     * @param item      Repository entity with updated data.
     * @returns a promise that returns the number of rows affected if resolved.
     */
    public update(item: IRepositoryEntity): Promise<number> {
        let promise: Promise<number> = new Promise<number>((resolve, reject) => {
            this.model.update({ id: item.id }, item.document, (error, rowsAffected) => {
                if (!error) {
                    resolve(rowsAffected);
                } else {
                    reject(error);
                }
            });
        });
        return promise;
    }

    /**
     * Retrieves a repository list given its GitHub owner id.
     * @param id    Owner GitHub id.
     * @returns a promise that returns a list of repository entities if resolved.
     */
    findByOwnerId(id: number): Promise<IRepositoryEntity[]>{
        let promise: Promise<IRepositoryEntity[]> = new Promise<IRepositoryEntity[]>((resolve, reject) => {
            this.model.find({ owner: {id: id} }, (error, result) => {
                if (!error) {
                    let entityArray: IRepositoryEntity[] = RepositoryEntity.toEntityArray(result);
                    resolve(entityArray);
                } else {
                    reject(error);
                }
            });
        });
        return promise;
    }

    /**
     * Retrieves a repository given its GitHub owner id and its name.
     * @param ownerId   Owner GitHub id.
     * @param name      Owner GitHub id.
     * @returns a promise that returns a repository entity if resolved.
     */
    findOne(ownerId: number, name: string): Promise<IRepositoryEntity>{
        let promise: Promise<IRepositoryEntity> = new Promise<IRepositoryEntity>((resolve, reject) => {
            this.model.find({ name: name, owner: { id: ownerId } }, (error, result) => {
                if (!error) {
                    let entity: IRepositoryEntity = RepositoryEntity.toEntity(result[0]);
                    resolve(entity);
                } else {
                    reject(error);
                }
            });
        });
        return promise;
    }

    protected convertToEntity(document: RepositoryDocument): IRepositoryEntity {
        return RepositoryEntity.toEntity(document);
    }

    protected convertToEntityArray(documentArray: RepositoryDocument[]): IRepositoryEntity[] {
        return RepositoryEntity.toEntityArray(documentArray);
    }

}