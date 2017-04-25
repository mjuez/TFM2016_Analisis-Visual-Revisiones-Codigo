import { IRepository } from "../data/IRepository";
import { AbstractRepository } from "./AbstractRepository";
import { IPullRequestEntity } from "../entities/PullRequestEntity";
import { PullRequestDocument } from "../entities/documents/PullRequestDocument";
import { PullRequestSchema } from "./schemas/PullRequestSchema";
import * as Promise from "bluebird";

/**
 * IPullRequestRepository interface.
 * Defines custom CRUD operations for a Pull Request.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IPullRequestRepository extends IRepository<IPullRequestEntity, PullRequestDocument> {

    /**
     * Retrieves a Pull Request given its GitHub id.
     * @param id        Pull Request GitHub id.
     * @param callback  Callback function to retrieve the Pull Request entity.
     *                  or an error if something goes wrong.
     */
    findOneByPullId(id: number): Promise<IPullRequestEntity>;
}

/**
 * Pull Request Repository class.
 * @author Mario Juez <mario@mjuez.com>
 */
export class PullRequestRepository extends AbstractRepository<IPullRequestEntity, PullRequestDocument> implements IPullRequestRepository {

    /** MongoDB collection name. */
    private static readonly _NAME = "pullRequest";

    /**
     * Class constructor.
     * Creates the repository using the collection name and the Pull Request schema.
     */
    constructor() {
        super(PullRequestRepository._NAME, PullRequestSchema.schema);
    }

    /**
     * Updates a Pull Request from database. Uses its GitHub id.
     * @param item      Pull Request entity with updated data.
     * @param callback  Callback function to retrieve the number of updated
     *                  items or an error if something goes wrong.
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
     * @param callback  Callback function to retrieve the Pull Request entity.
     *                  or an error if something goes wrong.
     */
    public findOneByPullId(id: number): Promise<IPullRequestEntity> {
        let promise: Promise<IPullRequestEntity> = new Promise<IPullRequestEntity>((resolve, reject) => {
            this.model.findOne({ id: id }, (error, result) => {
                if (!error) {
                    resolve(result);
                } else {
                    reject(error);
                }
            });
        });
        return promise;
    }

}