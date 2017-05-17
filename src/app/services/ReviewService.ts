import { IMultiplePersistenceService } from "../services/IPersistenceService";
import { IPullRequestService } from "../services/PullRequestService";
import { IReviewEntity, ReviewEntity } from "../entities/ReviewEntity";
import { IPullRequestEntity } from "../entities/PullRequestEntity";
import { ReviewDocument } from "../entities/documents/ReviewDocument";
import { IReviewRepository } from "../data/ReviewRepository";
import { AbstractMultiplePersistenceService } from "./AbstractPersistenceService";

/**
 * IReviewService interface.
 * Describes specific functionality for Review entities.
 * @author Mario Juez <mario@mjuez.com> 
 */
export interface IReviewService extends IMultiplePersistenceService<IReviewEntity> {

    getPullRequestLocalReviews(owner: string, repository: string, pullNumber: number): Promise<IReviewEntity[]>;

    getUserLocalReviews(userLogin: string): Promise<IReviewEntity[]>;

    /**
     * Saves or updates many entities into database.
     * @param entities  an array of entities.
     * @returns a promise that retrns an array of entities if resolved.
     */
    createOrUpdateMultiple(entities: IReviewEntity[]): Promise<IReviewEntity[]>;

}

/**
 * Review services.
 * @author Mario Juez <mario@mjuez.com>
 */
export class ReviewService extends AbstractMultiplePersistenceService<IReviewRepository, IReviewEntity, ReviewDocument> implements IReviewService {

    /** Pull Request service. */
    private readonly _pullRequestService: IPullRequestService;

    /**
     * Class constructor with Review repository and
     * pull request service dependency injection.
     * @param repository            Injected Review repository.
     * @param pullRequestService    Injected pull request service.
     */
    constructor(repository: IReviewRepository, pullRequestService: IPullRequestService) {
        super(repository);
        this._pullRequestService = pullRequestService;
    }

    // will be paginated?
    public async getPullRequestLocalReviews(owner: string, repo: string, pullNumber: number): Promise<IReviewEntity[]>{
        let repository: IReviewRepository = this._repository;
        let service: IPullRequestService = this._pullRequestService;
        let pullRequest: IPullRequestEntity = await service.getLocalPullRequest(owner, repo, pullNumber);
        return await repository.findByPullId(pullRequest.id); // promise or promise inside promise?
    }

    // will be paginated?
    public async getUserLocalReviews(userLogin: string): Promise<IReviewEntity[]>{
        let repository: IReviewRepository = this._repository;
        return await repository.retrieve({"user.login": userLogin});
    }

    protected async findEntity(entity: IReviewEntity): Promise<IReviewEntity> {
        return await this._repository.findById(entity.id);
    }

}