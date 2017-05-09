import { IRepository } from "../data/IRepository";
import { AbstractRepository } from "./AbstractRepository";
import { IPullRequestEntity, PullRequestEntity } from "../entities/PullRequestEntity";
import { PullRequestDocument } from "../entities/documents/PullRequestDocument";
import { PullRequestSchema } from "./schemas/PullRequestSchema";
import { SinglePullRequestFilter } from "./filters/PullRequestFilter";
import * as Promise from "bluebird";
import * as mongoose from "mongoose";

/**
 * IPullRequestRepository interface.
 * Defines custom CRUD operations for a Pull Request.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IPullRequestRepository extends IRepository<IPullRequestEntity, PullRequestDocument> {

    /**
     * Retrieves a Pull Request given its GitHub id.
     * @param id        Pull Request GitHub id.
     * @returns a promise that returns a pull request entity if resolved.
     */
    findOneByPullId(id: number): Promise<IPullRequestEntity>;

    /**
     * 
     */
    findOne(filter: SinglePullRequestFilter): Promise<IPullRequestEntity>;
}

/**
 * Pull Request Repository class.
 * @author Mario Juez <mario@mjuez.com>
 */
export class PullRequestRepository extends AbstractRepository<IPullRequestEntity, PullRequestDocument> implements IPullRequestRepository {

    /** MongoDB collection name. */
    public static readonly COLLECTION_NAME = "pull_request";

    /**
     * Class constructor.
     * Creates the repository using the collection name and the Pull Request schema.
     * @param model     Optional mongoose model dependency injection.
     */
    constructor(model?: mongoose.Model<PullRequestDocument>) {
        super(PullRequestRepository.COLLECTION_NAME, PullRequestSchema.schema, model);
    }

    /**
     * Updates a Pull Request from database. Uses its GitHub id.
     * @param item      Pull Request entity with updated data.
     * @returns a promise that returns the number of rows affected if resolved.
     */
    public update(item: IPullRequestEntity): Promise<number> {
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
     * Retrieves a Pull Request given its GitHub id.
     * @param id        Pull Request GitHub id.
     * @returns a promise that returns a pull request entity if resolved.
     */
    public findOneByPullId(id: number): Promise<IPullRequestEntity> {
        let promise: Promise<IPullRequestEntity> = new Promise<IPullRequestEntity>((resolve, reject) => {
            this.model.findOne({ id: id }, (error, result) => {
                if (!error) {
                    let entity: IPullRequestEntity = PullRequestEntity.toEntity(result);
                    resolve(entity);
                } else {
                    reject(error);
                }
            });
        });
        return promise;
    }

    public findOne(filter: SinglePullRequestFilter): Promise<IPullRequestEntity> {
        let promise: Promise<IPullRequestEntity> = new Promise<IPullRequestEntity>((resolve, reject) => {
            this.retrieve(filter).then((entities) => {
                resolve(entities[0]);
            }).catch((error) => {
                reject(error);
            });
        });

        return promise;
    }

    protected convertToEntity(document: PullRequestDocument): IPullRequestEntity {
        return PullRequestEntity.toEntity(document);
    }

    protected convertToEntityArray(documentArray: PullRequestDocument[]): IPullRequestEntity[] {
        return PullRequestEntity.toEntityArray(documentArray);
    }

}