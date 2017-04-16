import { IRepository } from "../data/IRepository";
import { AbstractRepository } from "./AbstractRepository";
import { IPullRequestEntity } from "../entities/PullRequestEntity";
import { PullRequestDocument } from "../entities/documents/PullRequestDocument";
import { PullRequestSchema } from "./schemas/PullRequestSchema";

export interface IPullRequestRepository extends IRepository<IPullRequestEntity, PullRequestDocument> {
    findOneByPullId(id: number, callback: (error: any, result: IPullRequestEntity) => void): void;
}

export class PullRequestRepository extends AbstractRepository<IPullRequestEntity, PullRequestDocument> implements IPullRequestRepository {

    private static readonly _NAME = "pullRequest";

    constructor() {
        super(PullRequestRepository._NAME, PullRequestSchema.schema);
    }

    public update(item: IPullRequestEntity, callback: (error: any, rowsAffected: number) => void): void {
        this.model.update({ id: item.id }, item.document, callback);
    }

    public findOneByPullId(id: number, callback: (error: any, result: IPullRequestEntity) => void): void {
        this.model.findOne({ id: id }, callback);
    }

}