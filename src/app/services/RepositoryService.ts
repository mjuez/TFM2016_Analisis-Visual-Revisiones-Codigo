import { IPersistenceService } from "../services/IPersistenceService";
import { IReviewService } from "../services/ReviewService";
import { AbstractPersistenceService } from "../services/AbstractPersistenceService";
import { IRepositoryEntity, RepositoryEntity } from "../entities/RepositoryEntity";
import { RepositoryDocument } from "../entities/documents/RepositoryDocument";
import { IRepositoryRepository } from "../data/RepositoryRepository";
import * as math from "mathjs";

/**
 * IRepositoryService interface.
 * Describes specific functionality for Repository entities.
 * @author Mario Juez <mario@mjuez.com> 
 */
export interface IRepositoryService extends IPersistenceService<IRepositoryEntity> {

    getRepository(owner: string, repository: string): Promise<IRepositoryEntity>;
    getRepositoriesPage(page: number, direction?: number): Promise<IRepositoryEntity[]>;
    getRepositoriesByNamePage(page: number, direction?: number): Promise<IRepositoryEntity[]>;
    getRepositoriesByReviewsPage(page: number, direction?: number): Promise<IRepositoryEntity[]>;
    getRepositoriesByPullRequestsPage(page: number, direction?: number): Promise<IRepositoryEntity[]>;
    getRepositoriesList(): Promise<IRepositoryEntity[]>;
    getRepositoriesStatsMeans(): Promise<any>;
    getRepositoryCSVPage(owner: string, repository: string, page: number): Promise<any>;

}

/**
 * Repository services.
 * @author Mario Juez <mario@mjuez.com>
 */
export class RepositoryService extends AbstractPersistenceService<IRepositoryRepository, IRepositoryEntity, RepositoryDocument> implements IRepositoryService {

    /** Review service. */
    private readonly _reviewService: IReviewService;

    /**
     * Class constructor with Repository repository and
     * review service dependency injection.
     * @param repository    Injected Repository repository.
     * @param reviewService Injected Review Service.
     */
    constructor(repository: IRepositoryRepository, reviewService: IReviewService) {
        super(repository);
        this._reviewService = reviewService;
    }

    public async getRepository(owner: string, repository: string): Promise<IRepositoryEntity> {
        const repo: IRepositoryRepository = this._repository;
        return await repo.findOne({ "owner.login": owner, "name": repository });
    }

    public async getRepositoriesPage(page: number, direction: number = 1): Promise<IRepositoryEntity[]> {
        const repo: IRepositoryRepository = this._repository;
        const sort: Object = { created_at: direction };
        const entities: IRepositoryEntity[] = await repo.retrieve({ page, sort });
        return entities;
    }

    public async getRepositoriesByNamePage(page: number, direction: number = 1): Promise<IRepositoryEntity[]> {
        const repo: IRepositoryRepository = this._repository;
        const sort: Object = { full_name: direction };
        const entities: IRepositoryEntity[] = await repo.retrieve({ page, sort });
        return entities;
    }

    public async getRepositoriesByReviewsPage(page: number, direction: number = 1): Promise<IRepositoryEntity[]> {
        const repo: IRepositoryRepository = this._repository;
        const sort: Object = { reviews_count: direction };
        const entities: IRepositoryEntity[] = await repo.retrieve({ page, sort });
        return entities;
    }

    public async getRepositoriesByPullRequestsPage(page: number, direction: number = 1): Promise<IRepositoryEntity[]> {
        const repo: IRepositoryRepository = this._repository;
        const sort: Object = { pull_requests_count: direction };
        const entities: IRepositoryEntity[] = await repo.retrieve({ page, sort });
        return entities;
    }

    public async getRepositoriesList(): Promise<IRepositoryEntity[]> {
        const repo: IRepositoryRepository = this._repository;
        const sort: Object = { full_name: 1 };
        const select: string = 'full_name -_id';
        const entities: IRepositoryEntity[] = await repo.retrieve({ sort, select });
        return entities;
    }

    public async getRepositoriesStatsMeans(): Promise<Object> {
        const repo: IRepositoryRepository = this._repository;
        const select: string = 'stargazers_count watchers_count forks_count review_comments_count reviews_count pull_requests_count -_id';
        const entities: IRepositoryEntity[] = await repo.retrieve({ select });
        const stargazersCounts: number[] = this.getRepositoriesStatsArray(entities, "stargazers_count");
        const watchersCounts: number[] = this.getRepositoriesStatsArray(entities, "watchers_count");
        const forksCounts: number[] = this.getRepositoriesStatsArray(entities, "forks_count");
        const pullRequestCounts: number[] = this.getRepositoriesStatsArray(entities, "pull_requests_count");
        const reviewCounts: number[] = this.getRepositoriesStatsArray(entities, "reviews_count");
        const reviewCommentCounts: number[] = this.getRepositoriesStatsArray(entities, "review_comments_count");

        const means: Object = {
            stargazers_count: math.ceil(math.mean(stargazersCounts)),
            watchers_count: math.ceil(math.mean(watchersCounts)),
            forks_count: math.ceil(math.mean(forksCounts)),
            pull_requests_count: math.ceil(math.mean(pullRequestCounts)),
            reviews_count: math.ceil(math.mean(reviewCounts)),
            review_comments_count: math.ceil(math.mean(reviewCommentCounts))
        };

        return means;
    }

    public async getRepositoryCSVPage(owner: string, repository: string, page: number): Promise<any> {
        const reviewService: IReviewService = this._reviewService;
        const filter: any = { "repository.owner": owner, "repository.name": repository };
        const repositoryEntity: IRepositoryEntity = await this.getRepository(owner, repository);
        let dataArray: any[] = [];

        const pageData: any[] = await reviewService.getReviewPageForCSV(filter, page);
        for (let i = 0; i < pageData.length; i++) {
            const reviewData: any = pageData[i];
            const column: any[] = [reviewData.id_review, repositoryEntity.id, repositoryEntity.document.owner.login,
            repositoryEntity.document.name, repositoryEntity.document.language, repositoryEntity.document.created_at,
            repositoryEntity.document.updated_at, reviewData.id_pull_request, reviewData.title_pull_request,
            reviewData.body_pull_request, reviewData.state_review, reviewData.body_review,
            reviewData.login_reviewer];
            dataArray.push(column);
        }

        return dataArray;
    }

    private getRepositoriesStatsArray(repositories: IRepositoryEntity[], statsField: string): number[] {
        let array: number[] = repositories.map((repository): number => {
            return repository.document[statsField];
        });

        return array;
    }

    protected async findEntity(entity: IRepositoryEntity): Promise<IRepositoryEntity> {
        return await this._repository.findById(entity.id);
    }

}