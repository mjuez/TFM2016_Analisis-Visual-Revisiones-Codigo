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
    getRepositoryCreatedAllTimeStats(owner: string, repository: string, dates: { start: Date, end: Date }): Promise<number[]>;
    getRepositoryCreatedBetweenDatesStats(owner: string, repository: string, dates: { start: Date, end: Date }): Promise<number>;
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
        const sort: Object = { full_name: direction };
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
        const sort: Object = { full_name: direction };
        return repo.retrieve({ filter, page, sort });
    }
    public async getRepositoryPullRequestsByReviewsPage(
        owner: string, repository: string, page: number, direction: number = 1): Promise<IPullRequestEntity[]> {

        const repo: IPullRequestRepository = this._repository;
        const filter: RepositoryPullRequestFilter = PullRequestFilterFactory.createRepository({ owner, repository });
        const sort: Object = { reviews: direction };
        return repo.retrieve({ filter, page, sort });
    }

    public async getRepositoryCreatedAllTimeStats(
        owner: string, repository: string, dates: { start: Date, end: Date }): Promise<number[]> {

        let dateRange: any = moment(dates.start).twix(dates.end);
        let portions = dateRange.count("days");
        if (portions > 20) portions = 20;
        const twixDates: any[] = dateRange.divide(portions);
        let counts: number[] = await Promise.all(twixDates.map(async (date) => {
            const partialDates = {
                start: date.start(),
                end: date.end()
            }
            return await this.getRepositoryCreatedBetweenDatesStats(owner, repository, partialDates);
        }));
        return counts;
    }

    public async getRepositoryCreatedBetweenDatesStats(
        owner: string, repository: string, dates: { start: Date, end: Date }): Promise<number> {

        let repo: IPullRequestRepository = this._repository;
        let filter: BetweenDatesPullRequestFilter =
            PullRequestFilterFactory.createBetweenDates({ owner, repository, startDate: dates.start, endDate: dates.end });
        return await repo.count(filter);
    }

    public async numPagesForRepository(owner: string, repository: string): Promise<number> {
        const repo: IPullRequestRepository = this._repository;
        const filter: RepositoryPullRequestFilter = PullRequestFilterFactory.createRepository({ owner, repository });
        return await repo.numPages(filter);
    }

    protected async findEntity(entity: IPullRequestEntity): Promise<IPullRequestEntity> {
        return await this._repository.findById(entity.id);
    }

}