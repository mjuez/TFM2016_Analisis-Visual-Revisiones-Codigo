import { AbstractRepository } from "./AbstractRepository";
import { PullRequestEntity } from "../models/PullRequestEntity";
import { PullRequestDocument } from "../models/documents/PullRequestDocument";
import { PullRequestSchema } from "../models/schemas/PullRequestSchema";

export class PullRequestRepository extends AbstractRepository<PullRequestEntity, PullRequestDocument> {

    private static readonly _NAME = "pullRequest";

    constructor() {
        super(PullRequestRepository._NAME, PullRequestSchema.schema);
    }

}