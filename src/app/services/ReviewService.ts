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
    //getReviewPageByRepository(owner: string, repository: string): Promise<IReviewEntity[]>;
    getReviewPageForCSV(filter: any, page: number): Promise<any[]>;
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

    public async getReviewPageForCSV(filter: any, page: number): Promise<any[]> {
        const reviews: IReviewEntity[] = await this.getReviewPageByRepository(filter, page);
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
                state_review: review.document.state,
                body_review: review.document.body,
                reviewer_login: review.document.user.login
            }
            pageForCSV.push(reviewForCSV);
        }
        return pageForCSV;
    }

    private async getReviewPageByRepository(filter: any, page: number): Promise<IReviewEntity[]> {
        const repo: IReviewRepository = this._repository;
        //const filter: any = { "repository.owner": owner, "repository.name": repository };
        return await repo.retrieve({ filter, page });
    }

    protected async findEntity(entity: IReviewEntity): Promise<IReviewEntity> {
        return await this._repository.findById(entity.id);
    }

}