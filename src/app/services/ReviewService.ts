import { IMultiplePersistenceService } from "../services/IPersistenceService";
import { IPullRequestService } from "../services/PullRequestService";
import { IReviewEntity } from "../entities/ReviewEntity";
import { IPullRequestEntity } from "../entities/PullRequestEntity";
import { IReviewRepository } from "../data/ReviewRepository";
import { AbstractMultiplePersistenceService } from "./AbstractPersistenceService";

/**
 * Review service interface.
 * Describes services for getting reviews data.
 * 
 * @author Mario Juez <mario[at]mjuez.com> 
 */
export interface IReviewService extends IMultiplePersistenceService<IReviewEntity> {
    
    /**
     * Gets a page of data of filtered reviews.
     * The data is prepared to be easily converted to CSV.
     * 
     * @param filter    reviews filter (usually by repository).
     * @param page      page number.
     * @returns an array of reviews data.
     */
    getReviewPageForCSV(filter: any, page: number): Promise<any[]>;

}

/**
 * Review services implementation.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class ReviewService extends AbstractMultiplePersistenceService<IReviewRepository, IReviewEntity> implements IReviewService {

    /** Pull Request service. */
    private readonly _pullRequestService: IPullRequestService;

    /**
     * Class constructor with Review repository and
     * pull request service dependency injection.
     * 
     * @param repository            Injected Review repository.
     * @param pullRequestService    Injected pull request service.
     */
    constructor(repository: IReviewRepository, pullRequestService: IPullRequestService) {
        super(repository);
        this._pullRequestService = pullRequestService;
    }

    /**
     * Gets a page of data of filtered reviews.
     * The data is prepared to be easily converted to CSV.
     * 
     * @async
     * @param filter    reviews filter (usually by repository).
     * @param page      page number.
     * @returns an array of reviews data.
     */
    public async getReviewPageForCSV(filter: any, page: number): Promise<any[]> {
        const reviews: IReviewEntity[] = await this.getReviewPageBy(filter, page);
        const pageForCSV: any[] = [];
        for (let i = 0; i < reviews.length; i++) {
            const review: IReviewEntity = reviews[i];
            const owner: string = review.document.repository.owner;
            const repository: string = review.document.repository.name;
            const pullNumber: number = review.document.pull_request_number;
            const pull: IPullRequestEntity = await this._pullRequestService.getPullRequest(owner, repository, pullNumber);
            const reviewForCSV: any = {
                id_review: review.document.id,
                id_pull_request: pull.document.id,
                title_pull_request: pull.document.title,
                body_pull_request: pull.document.body,
                state_pull_request: pull.document.state,
                locked_pull_request: pull.document.locked,
                created_at_pull_request: pull.document.created_at,
                updated_at_pull_request: pull.document.updated_at,
                closed_at_pull_request: pull.document.closed_at,
                merged_pull_request: pull.document.merged,
                mergeable_pull_request: pull.document.mergeable,
                comments_pull_request: pull.document.comments,
                reviews_pull_request: pull.document.reviews,
                review_comments_pull_request: pull.document.review_comments,
                commits_pull_request: pull.document.commits,
                additions_pull_request: pull.document.additions,
                deletions_pull_request: pull.document.deletions,
                changed_files_pull_request: pull.document.changed_files,
                state_review: review.document.state,
                body_review: review.document.body,
                login_reviewer: review.document.user.login
            }
            pageForCSV.push(reviewForCSV);
        }
        return pageForCSV;
    }

    /**
     * Gets a filtered page of reviews.
     * 
     * @async
     * @param filter    reviews filter (usually by repository).
     * @param page      page number.
     * @returns an array of review entities.
     */
    private async getReviewPageBy(filter: any, page: number): Promise<IReviewEntity[]> {
        const repo: IReviewRepository = this._repository;
        return await repo.retrieve({ filter, page });
    }

    /**
     * Finds a persisted review by its id.
     *
     * @async 
     * @param entity    A in-memory review.
     * @returns the persisted review.
     */
    protected async findEntity(entity: IReviewEntity): Promise<IReviewEntity> {
        return await this._repository.findById(entity.id);
    }

}