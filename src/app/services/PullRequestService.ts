import { IMultiplePersistenceService } from "../services/IPersistenceService";
import { AbstractMultiplePersistenceService } from "../services/AbstractPersistenceService";
import { IPullRequestEntity, PullRequestEntity } from "../entities/PullRequestEntity";
import { PullRequestDocument } from "../entities/documents/PullRequestDocument";
import { IPullRequestRepository } from "../data/PullRequestRepository";
import { SinglePullRequestFilter, RepositoryPullRequestFilter, PullRequestFilterFactory, BetweenDatesPullRequestFilter } from "../data/filters/PullRequestFilter";
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

    public async getPullRequestsPage(page: number, direction: number = 1): Promise<IPullRequestEntity[]> {
        const repo: IPullRequestRepository = this._repository;
        const sort: Object = { created_at: direction };
        return repo.retrieve({ page, sort });
    }

    public async getPullRequestsByNamePage(page: number, direction: number = 1): Promise<IPullRequestEntity[]> {
        const repo: IPullRequestRepository = this._repository;
        const sort: Object = { title: direction };
        return repo.retrieve({ page, sort });
    }

    public async getPullRequestsByReviewsPage(page: number, direction: number = 1): Promise<IPullRequestEntity[]> {
        const repo: IPullRequestRepository = this._repository;
        const sort: Object = { reviews: direction };
        return repo.retrieve({ page, sort });
    }

    public async getRepositoryPullRequestsPage(
        owner: string, repository: string, page: number, direction: number = 1): Promise<IPullRequestEntity[]> {

        const repo: IPullRequestRepository = this._repository;
        const filter: RepositoryPullRequestFilter = PullRequestFilterFactory.createRepository({ owner, repository });
        const sort: Object = { created_at: direction };
        return repo.retrieve({ filter, page, sort });
    }
    
    public async getRepositoryPullRequestsByNamePage(
        owner: string, repository: string, page: number, direction: number = 1): Promise<IPullRequestEntity[]> {

        const repo: IPullRequestRepository = this._repository;
        const filter: RepositoryPullRequestFilter = PullRequestFilterFactory.createRepository({ owner, repository });
        const sort: Object = { title: direction };
        return repo.retrieve({ filter, page, sort });
    }

    public async getRepositoryPullRequestsByReviewsPage(
        owner: string, repository: string, page: number, direction: number = 1): Promise<IPullRequestEntity[]> {

        const repo: IPullRequestRepository = this._repository;
        const filter: RepositoryPullRequestFilter = PullRequestFilterFactory.createRepository({ owner, repository });
        const sort: Object = { reviews: direction };
        return repo.retrieve({ filter, page, sort });
    }

    public async numPagesForRepository(owner: string, repository: string): Promise<number> {
        const repo: IPullRequestRepository = this._repository;
        const filter: RepositoryPullRequestFilter = PullRequestFilterFactory.createRepository({ owner, repository });
        return await repo.numPages(filter);
    }

    public async getPullRequestsStatsMeans(): Promise<Object> {
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
            reviews: math.ceil(math.mean(reviews))
        };

        return means;
    }

    private getPullRequestsStatsArray(pulls: IPullRequestEntity[], statsField: string): number[] {
        let array: number[] = pulls.map((pull): number => {
            return pull.document[statsField];
        });

        return array;
    }

    protected async findEntity(entity: IPullRequestEntity): Promise<IPullRequestEntity> {
        return await this._repository.findById(entity.id);
    }

}