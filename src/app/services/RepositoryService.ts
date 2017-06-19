import { IPersistenceService } from "../services/IPersistenceService";
import { IReviewService } from "../services/ReviewService";
import { AbstractPersistenceService } from "../services/AbstractPersistenceService";
import { IRepositoryEntity } from "../entities/RepositoryEntity";
import { IRepositoryRepository } from "../data/RepositoryRepository";
import * as math from "mathjs";

/**
 * Repository service interface.
 * Describes services for getting repositories in many ways.
 * Filtered, sorted... It also defines services for obtaining
 * repository related data like stats.
 * 
 * @author Mario Juez <mario[at]mjuez.com> 
 */
export interface IRepositoryService extends IPersistenceService<IRepositoryEntity> {

    /**
     * Gets a single repository.
     * 
     * @param owner         repository owner login.
     * @param repository    repository name.
     * @returns a repository entity.
     */
    getRepository(owner: string, repository: string): Promise<IRepositoryEntity>;
    
    /**
     * Gets a repositories page.
     * It retrieves a page from ALL repositories
     * stored in the database without filtering or
     * sorting.
     * 
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of repositories.
     */
    getRepositoriesPage(page: number, direction?: number): Promise<IRepositoryEntity[]>;
    
    /**
     * Gets a repositories page.
     * It retrieves a page from ALL repositories
     * stored in the database ordered by name.
     * 
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of repositories.
     */
    getRepositoriesByNamePage(page: number, direction?: number): Promise<IRepositoryEntity[]>;
    
    /**
     * Gets a repositories page.
     * It retrieves a page from ALL repositories
     * stored in the database ordered by number of reviews.
     * 
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of repositories.
     */
    getRepositoriesByReviewsPage(page: number, direction?: number): Promise<IRepositoryEntity[]>;
    
    /**
     * Gets a repositories page.
     * It retrieves a page from ALL repositories
     * stored in the database ordered by number of
     * pull requests.
     * 
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of repositories.
     */
    getRepositoriesByPullRequestsPage(page: number, direction?: number): Promise<IRepositoryEntity[]>;
    
    /**
     * Gets a list of all repositories.
     * Only the full_name field is filled.
     * 
     * @returns a list of repositories.
     */
    getRepositoriesList(): Promise<IRepositoryEntity[]>;

    /**
     * Calculates all repositories statistics means for:
     *  - stargazers.
     *  - watchers.
     *  - forks.
     *  - pull requests.
     *  - reviews.
     *  - review comments.
     * 
     * @returns a JSON object with all statistics.
     */
    getRepositoriesStatsMeans(): Promise<Object>;

    /**
     * Gets a page of data of repositories and its
     * pull requests and reviews. The data is prepared
     * to be easily converted to CSV.
     * 
     * @param owner         repository owner login.
     * @param repository    repository name. 
     * @param page          page number.
     * @returns an array of repositories data.
     */
    getRepositoryCSVPage(owner: string, repository: string, page: number): Promise<any[]>;

}

/**
 * Repository services implementation.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class RepositoryService extends AbstractPersistenceService<IRepositoryRepository, IRepositoryEntity> implements IRepositoryService {

    /** Review service. */
    private readonly _reviewService: IReviewService;

    /**
     * Class constructor with Repository repository and
     * review service dependency injection.
     * 
     * @param repository    Injected Repository repository.
     * @param reviewService Injected Review Service.
     */
    constructor(repository: IRepositoryRepository, reviewService: IReviewService) {
        super(repository);
        this._reviewService = reviewService;
    }

    /**
     * Gets a single repository.
     * 
     * @async
     * @param owner         repository owner login.
     * @param repository    repository name.
     * @returns a repository entity.
     */
    public async getRepository(owner: string, repository: string): Promise<IRepositoryEntity> {
        const repo: IRepositoryRepository = this._repository;
        return await repo.findOne({ "owner.login": owner, "name": repository });
    }

    /**
     * Gets a repositories page.
     * It retrieves a page from ALL repositories
     * stored in the database without filtering or
     * sorting.
     * 
     * @async
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of repositories.
     */
    public async getRepositoriesPage(page: number, direction: number = 1): Promise<IRepositoryEntity[]> {
        return await this.getSortedPage(page, { created_at: direction });
    }

    /**
     * Gets a repositories page.
     * It retrieves a page from ALL repositories
     * stored in the database ordered by name.
     * 
     * @async
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of repositories.
     */
    public async getRepositoriesByNamePage(page: number, direction: number = 1): Promise<IRepositoryEntity[]> {
        return await this.getSortedPage(page, { full_name: direction });
    }

    /**
     * Gets a repositories page.
     * It retrieves a page from ALL repositories
     * stored in the database ordered by number of reviews.
     * 
     * @async
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of repositories.
     */
    public async getRepositoriesByReviewsPage(page: number, direction: number = 1): Promise<IRepositoryEntity[]> {
        return await this.getSortedPage(page, { reviews_count: direction });
    }

    /**
     * Gets a repositories page.
     * It retrieves a page from ALL repositories
     * stored in the database ordered by number of
     * pull requests.
     * 
     * @async
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of repositories.
     */
    public async getRepositoriesByPullRequestsPage(page: number, direction: number = 1): Promise<IRepositoryEntity[]> {
        return await this.getSortedPage(page, { pull_requests_count: direction });
    }

    /**
     * Gets a list of all repositories.
     * Only the full_name field is filled.
     * 
     * @async
     * @returns a list of repositories.
     */
    public async getRepositoriesList(): Promise<IRepositoryEntity[]> {
        const repo: IRepositoryRepository = this._repository;
        const sort: Object = { full_name: 1 };
        const select: string = 'full_name -_id';
        const entities: IRepositoryEntity[] = await repo.retrieve({ sort, select });
        return entities;
    }

    /**
     * Calculates all repositories statistics means for:
     *  - stargazers.
     *  - watchers.
     *  - forks.
     *  - pull requests.
     *  - reviews.
     *  - review comments.
     * 
     * @async
     * @returns a JSON object with all statistics.
     */
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

    /**
     * Gets a page of data of repositories and its
     * pull requests and reviews. The data is prepared
     * to be easily converted to CSV.
     * 
     * @async
     * @param owner         repository owner login.
     * @param repository    repository name. 
     * @param page          page number.
     * @returns an array of repositories data.
     */
    public async getRepositoryCSVPage(owner: string, repository: string, page: number): Promise<any[]> {
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
            reviewData.body_pull_request, reviewData.state_pull_request, reviewData.locked_pull_request,
            reviewData.created_at_pull_request, reviewData.updated_at_pull_request, reviewData.closed_at_pull_request, 
            reviewData.merged_pull_request, reviewData.mergeable_pull_request, reviewData.comments_pull_request, 
            reviewData.reviews_pull_request, reviewData.review_comments_pull_request, reviewData.commits_pull_request, 
            reviewData.additions_pull_request, reviewData.deletions_pull_request, reviewData.changed_files_pull_request, 
            reviewData.state_review, reviewData.body_review, reviewData.login_reviewer];
            dataArray.push(column);
        }

        return dataArray;
    }

    /**
     * Gets a specific field stats from a list
     * of reviews.
     * 
     * @param pulls         list of reviews.
     * @param statsField    field name.
     * @returns an array of stats.
     */
    private getRepositoriesStatsArray(repositories: IRepositoryEntity[], statsField: string): number[] {
        let array: number[] = repositories.map((repository): number => {
            return repository.document[statsField];
        });

        return array;
    }

    /**
     * Finds a persisted repository by its id.
     *
     * @async 
     * @param entity    A in-memory repository.
     * @returns the persisted repository.
     */
    protected async findEntity(entity: IRepositoryEntity): Promise<IRepositoryEntity> {
        return await this._repository.findById(entity.id);
    }

}