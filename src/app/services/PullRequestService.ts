import { IMultiplePersistenceService } from "../services/IPersistenceService";
import { AbstractMultiplePersistenceService } from "../services/AbstractPersistenceService";
import { IPullRequestEntity, PullRequestEntity } from "../entities/PullRequestEntity";
import { PullRequestDocument } from "../entities/documents/PullRequestDocument";
import { IPullRequestRepository } from "../data/PullRequestRepository";
import { SinglePullRequestFilter, RepositoryPullRequestFilter, PullRequestFilterFactory, BetweenDatesPullRequestFilter } from "../data/filters/PullRequestFilter";
import * as math from "mathjs";
import * as moment from "moment";
import * as twix from "twix";
require("twix");

/**
 * IPullRequestService interface.
 * Describes specific functionality for Pull Request entities.
 * @author Mario Juez <mario@mjuez.com> 
 */
export interface IPullRequestService extends IMultiplePersistenceService<IPullRequestEntity> {

    getPullRequest(owner: string, repository: string, number: number): Promise<IPullRequestEntity>;
    getPullRequestsPage(page: number, direction?: number): Promise<IPullRequestEntity[]>;
    getPullRequestsByNamePage(page: number, direction?: number): Promise<IPullRequestEntity[]>;
    getPullRequestsByReviewsPage(page: number, direction?: number): Promise<IPullRequestEntity[]>;
    getRepositoryPullRequestsPage(owner: string, repository: string, page: number, direction?: number): Promise<IPullRequestEntity[]>;
    getRepositoryPullRequestsByNamePage(owner: string, repository: string, page: number, direction?: number): Promise<IPullRequestEntity[]>;
    getRepositoryPullRequestsByReviewsPage(owner: string, repository: string, page: number, direction?: number): Promise<IPullRequestEntity[]>;
    getPullRequestsStatsMeans(): Promise<Object>;
    numPagesForRepository(owner: string, repository: string): Promise<number>;
    getPageHandler(type?: string): any;
    getFilteredPageHandler(type?: string): any;

}

/**
 * Pull Request services.
 * @author Mario Juez <mario@mjuez.com>
 */
export class PullRequestService extends AbstractMultiplePersistenceService<IPullRequestRepository, IPullRequestEntity, PullRequestDocument> implements IPullRequestService {

    /**
     * Class constructor with Pull Request repository dependency
     * injection.
     * @param repository    Injected Pull Request repository.
     */
    constructor(repository: IPullRequestRepository) {
        super(repository);
    }

    public async getPullRequest(owner: string, repository: string, number: number): Promise<IPullRequestEntity> {
        const repo: IPullRequestRepository = this._repository;
        const filter: SinglePullRequestFilter = PullRequestFilterFactory.createSingle({ owner, repository, number });
        return repo.findOne(filter);
    }

    public getPullRequestsPage = async (page: number, direction: number = 1): Promise<IPullRequestEntity[]> => {
        return await this.getSortedPage(page, { created_at: direction });
    }

    public getPullRequestsByNamePage = async (page: number, direction: number = 1): Promise<IPullRequestEntity[]> => {
        return await this.getSortedPage(page, { title: direction });
    }

    public getPullRequestsByReviewsPage = async (page: number, direction: number = 1): Promise<IPullRequestEntity[]> => {
        return await this.getSortedPage(page, { reviews: direction });
    }

    public getRepositoryPullRequestsPage = async (owner: string, repository: string, page: number, direction: number = 1): Promise<IPullRequestEntity[]> => {
        const filter: RepositoryPullRequestFilter = PullRequestFilterFactory.createRepository({ owner, repository });
        return await this.getFilteredPage(filter, page, { created_at: direction });
    }

    public getRepositoryPullRequestsByNamePage = async (owner: string, repository: string, page: number, direction: number = 1): Promise<IPullRequestEntity[]> => {
        const filter: RepositoryPullRequestFilter = PullRequestFilterFactory.createRepository({ owner, repository });
        return await this.getFilteredPage(filter, page, { title: direction });
    }

    public getRepositoryPullRequestsByReviewsPage = async (owner: string, repository: string, page: number, direction: number = 1): Promise<IPullRequestEntity[]> => {
        const filter: RepositoryPullRequestFilter = PullRequestFilterFactory.createRepository({ owner, repository });
        return await this.getFilteredPage(filter, page, { reviews: direction });
    }

    public numPagesForRepository = async (owner: string, repository: string): Promise<number> => {
        const repo: IPullRequestRepository = this._repository;
        const filter: RepositoryPullRequestFilter = PullRequestFilterFactory.createRepository({ owner, repository });
        return await repo.numPages(filter);
    }

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

    private getPullRequestsStatsArray = (pulls: IPullRequestEntity[], statsField: string): number[] => {
        let array: number[] = pulls.map((pull): number => {
            if (pull.document[statsField] != undefined) {
                return pull.document[statsField];
            }
            return 0;
        });

        return array;
    }

    private getFilteredPage = (filter: any, page: number, sort: any): Promise<IPullRequestEntity[]> => {
        const repo: IPullRequestRepository = this._repository;
        return repo.retrieve({ filter, page, sort });
    }

    protected async findEntity(entity: IPullRequestEntity): Promise<IPullRequestEntity> {
        return await this._repository.findById(entity.id);
    }

}