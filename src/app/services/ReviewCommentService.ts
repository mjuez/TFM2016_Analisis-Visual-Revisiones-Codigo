import { IMultiplePersistenceService } from "../services/IPersistenceService";
import { IPullRequestService } from "../services/PullRequestService";
import { IReviewCommentEntity, ReviewCommentEntity } from "../entities/ReviewCommentEntity";
import { IPullRequestEntity } from "../entities/PullRequestEntity";
import { ReviewCommentDocument } from "../entities/documents/ReviewCommentDocument";
import { IReviewCommentRepository } from "../data/ReviewCommentRepository";
import { AbstractMultiplePersistenceService } from "./AbstractPersistenceService";

/**
 * IReviewCommentService interface.
 * Describes specific functionality for Review Comment entities.
 * @author Mario Juez <mario@mjuez.com> 
 */
export interface IReviewCommentService extends IMultiplePersistenceService<IReviewCommentEntity> {
}

/**
 * Review Comment services.
 * @author Mario Juez <mario@mjuez.com>
 */
export class ReviewCommentService extends AbstractMultiplePersistenceService<IReviewCommentRepository, IReviewCommentEntity, ReviewCommentDocument> implements IReviewCommentService {

    /** Pull Request service. */
    private readonly _pullRequestService: IPullRequestService;

    /**
     * Class constructor with ReviewComment repository and
     * pull request service dependency injection.
     * @param repository            Injected ReviewComment repository.
     */
    constructor(repository: IReviewCommentRepository) {
        super(repository);
    }

    protected async findEntity(entity: IReviewCommentEntity): Promise<IReviewCommentEntity> {
        return await this._repository.findById(entity.id);
    }

}