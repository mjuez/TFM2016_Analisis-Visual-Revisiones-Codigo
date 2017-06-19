import { IMultiplePersistenceService } from "../services/IPersistenceService";
import { AbstractMultiplePersistenceService } from "../services/AbstractPersistenceService";
import { IPullRequestEntity } from "../entities/PullRequestEntity";
import { IPullRequestRepository } from "../data/PullRequestRepository";
import { SinglePullRequestFilter, RepositoryPullRequestFilter, PullRequestFilterFactory} from "../data/filters/PullRequestFilter";
import * as math from "mathjs";
import * as moment from "moment";
import * as twix from "twix";
require("twix");

/**
 * Pull Request service interface.
 * Describes services for getting pull requests in many ways.
 * Filtered, sorted... It also defines services for obtaining
 * pull request related data like stats.
 * 
 * @author Mario Juez <mario[at]mjuez.com> 
 */
export interface IPullRequestService extends IMultiplePersistenceService<IPullRequestEntity> {

    /**
     * Gets a single pull request.
     * 
     * @param owner         repository owner login.
     * @param repository    repository name.
     * @param number        pull request number.
     * @returns a pull request entity.
     */
    getPullRequest(owner: string, repository: string, number: number): Promise<IPullRequestEntity>;

    /**
     * Gets a pull requests page.
     * It retrieves a page from ALL pull requests
     * stored in the database without filtering or
     * sorting.
     * 
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of pull requests.
     */
    getPullRequestsPage(page: number, direction?: number): Promise<IPullRequestEntity[]>;

    /**
     * Gets a pull requests page.
     * It retrieves a page from ALL pull requests
     * stored in the database ordered by title (name).
     * 
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of pull requests.
     */
    getPullRequestsByNamePage(page: number, direction?: number): Promise<IPullRequestEntity[]>;

    /**
     * Gets a pull requests page.
     * It retrieves a page from ALL pull requests
     * stored in the database ordered by number of reviews.
     * 
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of pull requests.
     */
    getPullRequestsByReviewsPage(page: number, direction?: number): Promise<IPullRequestEntity[]>;

    /**
     * Gets a pull requests page.
     * It retrieves a page from pull requests of a
     * specific repository stored in the database.
     *
     * @param owner         repository owner login.
     * @param repository    repository name. 
     * @param page          page number.
     * @param direction     optional direction 1 (asc), -1 (desc).
     * @returns a list of pull requests.
     */
    getRepositoryPullRequestsPage(owner: string, repository: string, page: number, direction?: number): Promise<IPullRequestEntity[]>;
    
    /**
     * Gets a pull requests page.
     * It retrieves a page from pull requests of a
     * specific repository stored in the database
     * ordered by title (name).
     *
     * @param owner         repository owner login.
     * @param repository    repository name. 
     * @param page          page number.
     * @param direction     optional direction 1 (asc), -1 (desc).
     * @returns a list of pull requests.
     */
    getRepositoryPullRequestsByNamePage(owner: string, repository: string, page: number, direction?: number): Promise<IPullRequestEntity[]>;
    
    /**
     * Gets a pull requests page.
     * It retrieves a page from pull requests of a
     * specific repository stored in the database
     * ordered by number of reviews.
     *
     * @param owner         repository owner login.
     * @param repository    repository name. 
     * @param page          page number.
     * @param direction     optional direction 1 (asc), -1 (desc).
     * @returns a list of pull requests.
     */
    getRepositoryPullRequestsByReviewsPage(owner: string, repository: string, page: number, direction?: number): Promise<IPullRequestEntity[]>;
    
    /**
     * Calculates all pull requests statistics means for:
     *  - changed files.
     *  - additions.
     *  - deletions. 
     *  - commits.
     *  - comments.
     *  - reviews.
     *  - review comments.
     * 
     * @returns a JSON object with all statistics.
     */
    getPullRequestsStatsMeans(): Promise<Object>;

    /**
     * Gets the number of pages of pull requests
     * of a specific repository.
     * 
     * @param owner         repository owner login.
     * @param repository    repository name. 
     * @returns the number of pages.
     */
    numPagesForRepository(owner: string, repository: string): Promise<number>;

    /**
     * Gets a page obtaining handler.
     * 
     * @param type  optional parameter. Can take
     *              values "NAME" and "REVIEWS".
     * @returns a page obtaining handler.
     */
    getPageHandler(type?: string): any;

    /**
     * Gets a filtered by repository page
     * obtaining handler.
     * 
     * @param type  optional parameter. Can take
     *              values "NAME" and "REVIEWS".
     * @returns a page obtaining handler.
     */
    getFilteredPageHandler(type?: string): any;

}

/**
 * Pull Request services implementation.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class PullRequestService extends AbstractMultiplePersistenceService<IPullRequestRepository, IPullRequestEntity> implements IPullRequestService {

    /**
     * Class constructor with Pull Request repository dependency
     * injection.
     * 
     * @param repository    Injected Pull Request repository.
     */
    constructor(repository: IPullRequestRepository) {
        super(repository);
    }

    /**
     * Gets a single pull request.
     * 
     * @async
     * @param owner         repository owner login.
     * @param repository    repository name.
     * @param number        pull request number.
     * @returns a pull request entity.
     */
    public async getPullRequest(owner: string, repository: string, number: number): Promise<IPullRequestEntity> {
        const repo: IPullRequestRepository = this._repository;
        const filter: SinglePullRequestFilter = PullRequestFilterFactory.createSingle({ owner, repository, number });
        return repo.findOne(filter);
    }

    /**
     * Gets a pull requests page.
     * It retrieves a page from ALL pull requests
     * stored in the database without filtering or
     * sorting.
     * 
     * @async
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of pull requests.
     */
    public getPullRequestsPage = async (page: number, direction: number = 1): Promise<IPullRequestEntity[]> => {
        return await this.getSortedPage(page, { created_at: direction });
    }

    /**
     * Gets a pull requests page.
     * It retrieves a page from ALL pull requests
     * stored in the database ordered by title (name).
     * 
     * @async
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of pull requests.
     */
    public getPullRequestsByNamePage = async (page: number, direction: number = 1): Promise<IPullRequestEntity[]> => {
        return await this.getSortedPage(page, { title: direction });
    }

    /**
     * Gets a pull requests page.
     * It retrieves a page from ALL pull requests
     * stored in the database ordered by number of reviews.
     * 
     * @async
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of pull requests.
     */
    public getPullRequestsByReviewsPage = async (page: number, direction: number = 1): Promise<IPullRequestEntity[]> => {
        return await this.getSortedPage(page, { reviews: direction });
    }

    /**
     * Gets a pull requests page.
     * It retrieves a page from pull requests of a
     * specific repository stored in the database.
     *
     * @async
     * @param owner         repository owner login.
     * @param repository    repository name. 
     * @param page          page number.
     * @param direction     optional direction 1 (asc), -1 (desc).
     * @returns a list of pull requests.
     */
    public getRepositoryPullRequestsPage = async (owner: string, repository: string, page: number, direction: number = 1): Promise<IPullRequestEntity[]> => {
        const filter: RepositoryPullRequestFilter = PullRequestFilterFactory.createRepository({ owner, repository });
        return await this.getFilteredPage(filter, page, { created_at: direction });
    }

    /**
     * Gets a pull requests page.
     * It retrieves a page from pull requests of a
     * specific repository stored in the database
     * ordered by title (name).
     *
     * @async
     * @param owner         repository owner login.
     * @param repository    repository name. 
     * @param page          page number.
     * @param direction     optional direction 1 (asc), -1 (desc).
     * @returns a list of pull requests.
     */
    public getRepositoryPullRequestsByNamePage = async (owner: string, repository: string, page: number, direction: number = 1): Promise<IPullRequestEntity[]> => {
        const filter: RepositoryPullRequestFilter = PullRequestFilterFactory.createRepository({ owner, repository });
        return await this.getFilteredPage(filter, page, { title: direction });
    }

    /**
     * Gets a pull requests page.
     * It retrieves a page from pull requests of a
     * specific repository stored in the database
     * ordered by number of reviews.
     *
     * @async
     * @param owner         repository owner login.
     * @param repository    repository name. 
     * @param page          page number.
     * @param direction     optional direction 1 (asc), -1 (desc).
     * @returns a list of pull requests.
     */
    public getRepositoryPullRequestsByReviewsPage = async (owner: string, repository: string, page: number, direction: number = 1): Promise<IPullRequestEntity[]> => {
        const filter: RepositoryPullRequestFilter = PullRequestFilterFactory.createRepository({ owner, repository });
        return await this.getFilteredPage(filter, page, { reviews: direction });
    }

    /**
     * Gets the number of pages of pull requests
     * of a specific repository.
     * 
     * @async
     * @param owner         repository owner login.
     * @param repository    repository name. 
     * @returns the number of pages.
     */
    public numPagesForRepository = async (owner: string, repository: string): Promise<number> => {
        const repo: IPullRequestRepository = this._repository;
        const filter: RepositoryPullRequestFilter = PullRequestFilterFactory.createRepository({ owner, repository });
        return await repo.numPages(filter);
    }

    /**
     * Calculates all pull requests statistics means for:
     *  - changed files.
     *  - additions.
     *  - deletions. 
     *  - commits.
     *  - comments.
     *  - reviews.
     *  - review comments.
     * 
     * @async
     * @returns a JSON object with all statistics.
     */
    public getPullRequestsStatsMeans = async (): Promise<Object> => {
        const repo: IPullRequestRepository = this._repository;
        const select: string = 'changed_files additions deletions commits comments reviews review_comments -_id';
        const entities: IPullRequestEntity[] = await repo.retrieve({ select });
        const changedFiles: number[] = this.getPullRequestsStatsArray(entities, "changed_files");
        const additions: number[] = this.getPullRequestsStatsArray(entities, "additions");
        const deletions: number[] = this.getPullRequestsStatsArray(entities, "deletions");
        const commits: number[] = this.getPullRequestsStatsArray(entities, "commits");
        const comments: number[] = this.getPullRequestsStatsArray(entities, "comments");
        const reviews: number[] = this.getPullRequestsStatsArray(entities, "reviews");
        const reviewComments: number[] = this.getPullRequestsStatsArray(entities, "review_comments");

        const means: Object = {
            changed_files: math.ceil(math.mean(changedFiles)),
            additions: math.ceil(math.mean(additions)),
            deletions: math.ceil(math.mean(deletions)),
            commits: math.ceil(math.mean(commits)),
            comments: math.ceil(math.mean(comments)),
            reviews: math.ceil(math.mean(reviews)),
            review_comments: math.ceil(math.mean(reviewComments))
        };

        return means;
    }

    /**
     * Gets a page obtaining handler.
     * 
     * @param type  optional parameter. Can take
     *              values "NAME" and "REVIEWS".
     * @returns a page obtaining handler.
     */
    public getPageHandler = (type: string = "NONE"): any => {
        switch (type) {
            case "NONE":
                return this.getPullRequestsPage;
            case "NAME":
                return this.getPullRequestsByNamePage;
            case "REVIEWS":
                return this.getPullRequestsByReviewsPage;
        }
    }

    /**
     * Gets a filtered by repository page
     * obtaining handler.
     * 
     * @param type  optional parameter. Can take
     *              values "NAME" and "REVIEWS".
     * @returns a page obtaining handler.
     */
    public getFilteredPageHandler = (type: string = "NONE"): any => {
        switch (type) {
            case "NONE":
                return this.getRepositoryPullRequestsPage;
            case "NAME":
                return this.getRepositoryPullRequestsByNamePage;
            case "REVIEWS":
                return this.getRepositoryPullRequestsByReviewsPage;
        }
    }

    /**
     * Gets a specific field stats from a list
     * of pull requests.
     * 
     * @param pulls         list of pull requests.
     * @param statsField    field name.
     * @returns an array of stats.
     */
    private getPullRequestsStatsArray = (pulls: IPullRequestEntity[], statsField: string): number[] => {
        let array: number[] = pulls.map((pull): number => {
            if (pull.document[statsField] != undefined) {
                return pull.document[statsField];
            }
            return 0;
        });

        return array;
    }

    /**
     * Gets a filtered pull requests page.
     * 
     * @async
     * @param page      page number.
     * @param sort   optional direction 1 (asc), -1 (desc).
     * @returns a list of pull requests.
     */
    private getFilteredPage = async (filter: any, page: number, sort: any): Promise<IPullRequestEntity[]> => {
        const repo: IPullRequestRepository = this._repository;
        return await repo.retrieve({ filter, page, sort });
    }

    /**
     * Finds a persisted pull request by its id.
     *
     * @async 
     * @param entity    A in-memory pull request.
     * @returns the persisted pull request.
     */
    protected async findEntity(entity: IPullRequestEntity): Promise<IPullRequestEntity> {
        return await this._repository.findById(entity.id);
    }

}