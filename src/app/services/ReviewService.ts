import { IMultiplePersistenceService } from "../services/IPersistenceService";
import { IPullRequestService } from "../services/PullRequestService";
import { IUserService } from "../services/UserService";
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

}

/**
 * Review services.
 * @author Mario Juez <mario@mjuez.com>
 */
export class ReviewService extends AbstractMultiplePersistenceService<IReviewRepository, IReviewEntity, ReviewDocument> implements IReviewService {

    /** Pull Request service. */
    private readonly _pullRequestService: IPullRequestService;

    /** User service. */
    private readonly _userService: IUserService;

    /**
     * Class constructor with Review repository,
     * pull request service and user service dependency injection.
     * @param repository            Injected Review repository.
     * @param pullRequestService    Injected pull request service.
     * @param userService           Injected user service.
     */
    constructor(repository: IReviewRepository, pullRequestService: IPullRequestService, userService: IUserService) {
        super(repository);
        this._pullRequestService = pullRequestService;
        this._userService = userService;
    }

    protected async findEntity(entity: IReviewEntity): Promise<IReviewEntity> {
        return await this._repository.findById(entity.id);
    }

}