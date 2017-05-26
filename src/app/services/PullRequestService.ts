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

    /**
     * Saves or updates many entities into database.
     * @param entities  an array of entities.
     * @returns a promise that retrns an array of entities if resolved.
     */
    createOrUpdateMultiple(entities: IPullRequestEntity[]): Promise<IPullRequestEntity[]>;
    getLocalPullRequest(owner: string, repository: string, id: number): Promise<IPullRequestEntity>;
    getLocalPullRequests(owner: string, repository: string, startingFrom?: number): Promise<IPullRequestEntity[]>;
    getCreatedAllTimeStats(owner: string, repository: string, dates: { start: Date, end: Date }): Promise<number[]>;
    getCreatedBetweenDatesStats(owner: string, repository: string, dates: { start: Date, end: Date }): Promise<number>;

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

    /** @inheritdoc */
    public getLocalPullRequest(owner: string, repo: string, id: number): Promise<IPullRequestEntity> {
        let repository: IPullRequestRepository = this._repository;
        let filter: SinglePullRequestFilter = PullRequestFilterFactory.createSingle({ owner, repository: repo, number: id });
        return repository.findOne(filter);
    }

    /** @inheritdoc */
    public getLocalPullRequests(owner: string, repo: string, page: number = 1, startingFrom: number = 0): Promise<IPullRequestEntity[]> {
        let repository: IPullRequestRepository = this._repository;
        let filter: RepositoryPullRequestFilter = PullRequestFilterFactory.createRepository({ owner, repository: repo });
        return repository.retrievePartial(filter, page, startingFrom);
    }

    public async getCreatedAllTimeStats(owner: string, repository: string, dates: { start: Date, end: Date }): Promise<number[]> {
        let dateRange: any = moment(dates.start).twix(dates.end);
        let portions = dateRange.count("days");
        if (portions > 20) portions = 20;
        const twixDates: any[] = dateRange.divide(portions);
        let counts: number[] = await Promise.all(twixDates.map(async (date) => {
            const partialDates = {
                start: date.start(),
                end: date.end()
            }
            return await this.getCreatedBetweenDatesStats(owner, repository, partialDates);
        }));
        return counts;
    }

    public async getCreatedBetweenDatesStats(owner: string, repository: string, dates: { start: Date, end: Date }): Promise<number> {
        let repo: IPullRequestRepository = this._repository;
        let filter: BetweenDatesPullRequestFilter =
            PullRequestFilterFactory.createBetweenDates({ owner, repository, startDate: dates.start, endDate: dates.end });
        return await repo.count(filter);
    }

    protected async findEntity(entity: IPullRequestEntity): Promise<IPullRequestEntity> {
        return await this._repository.findById(entity.id);
    }

}