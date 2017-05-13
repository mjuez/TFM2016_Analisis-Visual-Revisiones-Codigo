import { IPersistenceService } from "../services/IPersistenceService";
import { IPullRequestService } from "../services/PullRequestService";
import { IReviewEntity, ReviewEntity } from "../entities/ReviewEntity";
import { IPullRequestEntity } from "../entities/PullRequestEntity";
import { ReviewDocument } from "../entities/documents/ReviewDocument";
import { IReviewRepository } from "../data/ReviewRepository";
import * as BluebirdPromise from "bluebird";

/**
 * IReviewService interface.
 * Describes specific functionality for Review entities.
 * @author Mario Juez <mario@mjuez.com> 
 */
export interface IReviewService extends IPersistenceService<IReviewEntity> {

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
export class ReviewService implements IReviewService {

    /** Review repository. */
    private readonly _repository: IReviewRepository;

    /** Pull Request service. */
    private readonly _pullRequestService: IPullRequestService;

    /**
     * Class constructor with Review repository and
     * pull request service dependency injection.
     * @param repository            Injected Review repository.
     * @param pullRequestService    Injected pull request service.
     */
    constructor(repository: IReviewRepository, pullRequestService: IPullRequestService) {
        this._repository = repository;
        this._pullRequestService = pullRequestService;
    }

    /**
     * Saves or updates a Review into database.
     * @param entity    a Review.
     * @returns a promise that returns a review entity if resolved.
     */
    public async createOrUpdate(entity: IReviewEntity): Promise<IReviewEntity> {
        let repository: IReviewRepository = this._repository;
        let foundEntity: IReviewEntity = await repository.findById(entity.id);
        if (foundEntity != null) {
            try {
                await repository.update(entity);
                return entity;
            } catch (error) {
                throw error;
            }
        } else {
            try {
                return await repository.create(entity);
            } catch (error) {
                throw error;
            }
        }
    }

    /**
     * Saves or updates many Reviews into database.
     * @param entity    a Review array.
     * @returns a promise that returns an array of review entities if resolved.
     */
    public async createOrUpdateMultiple(entities: IReviewEntity[]): Promise<IReviewEntity[]> {
        let entitiesResult: IReviewEntity[] = [];
        entities.map(async (entity) => {
            try {
                let persisted: IReviewEntity = await this.createOrUpdate(entity);
                entitiesResult.push(persisted);
            } catch (error) {
                throw error;
            }
        });
        return entitiesResult;
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

}