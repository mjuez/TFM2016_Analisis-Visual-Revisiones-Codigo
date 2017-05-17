import { IRepository } from "../data/IRepository";
import { AbstractRepository } from "./AbstractRepository";
import { IPullRequestEntity, PullRequestEntity } from "../entities/PullRequestEntity";
import { PullRequestDocument } from "../entities/documents/PullRequestDocument";
import { PullRequestSchema } from "./schemas/PullRequestSchema";
import { SinglePullRequestFilter } from "./filters/PullRequestFilter";
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

    findSublist(filter: Object, startingFrom?: number): Promise<IPullRequestEntity[]>;
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
     * Retrieves a Pull Request given its GitHub id.
     * @param id        Pull Request GitHub id.
     * @returns a promise that returns a pull request entity if resolved.
     */
    public async findOneByPullId(id: number): Promise<IPullRequestEntity> {
        return this.findOne({id: id});
    }

    public async findSublist(filter: Object = {}, startingFrom: number = 0): Promise<IPullRequestEntity[]> {
        try {
            let documentArray: PullRequestDocument[] =
                await this.model.find(filter)
                    .where('number')
                    .gt(startingFrom)
                    .sort({ number: 1 });
            let pullRequestArray: IPullRequestEntity[] = this.convertToEntityArray(documentArray);
            return pullRequestArray;
        } catch (error) {
            throw error;
        }
    }

    protected convertToEntity(document: PullRequestDocument): IPullRequestEntity {
        return PullRequestEntity.toEntity(document);
    }

    protected convertToEntityArray(documentArray: PullRequestDocument[]): IPullRequestEntity[] {
        return PullRequestEntity.toEntityArray(documentArray);
    }

    protected updateFilter(item: IPullRequestEntity): Object {
        return { id: item.id };
    }

}