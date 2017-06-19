import { IPullRequestRepository } from "../data/PullRequestRepository";
import { IReviewRepository } from "../data/ReviewRepository";
import { IReviewCommentRepository } from "../data/ReviewCommentRepository";
import { IPullRequestEntity } from "../entities/PullRequestEntity";
import { IReviewEntity } from "../entities/ReviewEntity";
import { IReviewCommentEntity } from "../entities/ReviewCommentEntity";
import { IRepositories } from "../data/IRepositories";
import * as moment from "moment";
import * as twix from "twix";
require("twix");

/**
 * Stats service interface.
 * Describes services calculating different
 * entity-based statistics.
 * 
 * @author Mario Juez <mario[at]mjuez.com> 
 */
export interface IStatsService {

    /**
     * Gets reviews stats for an user.
     * 
     * @param userLogin GitHub user login.
     * @returns a JSON object with statistics.
     */
    getReviewsStatsByUser(userLogin: string): Promise<any>;
    
    /**
     * Gets reviews stats for a repository.
     * 
     * @param owner repository owner login.
     * @param name  repository name. 
     * @returns a JSON object with statistics.
     */
    getReviewsStatsByRepository(owner: string, name: string): Promise<any>;

    /**
     * Gets pull requests stats for an user.
     * 
     * @param userLogin GitHub user login.
     * @returns a JSON object with statistics.
     */
    getPullRequestsStatsByUser(userLogin: string): Promise<any>;

    /**
     * Gets pull requests stats for a repository.
     * 
     * @param owner repository owner login.
     * @param name  repository name. 
     * @returns a JSON object with statistics.
     */
    getPullRequestsStatsByRepository(owner: string, name: string): Promise<any>;

    /**
     * Gets review comments stats for an user.
     * 
     * @param userLogin GitHub user login.
     * @returns a JSON object with statistics.
     */
    getReviewCommentsStatsByUser(userLogin: string): Promise<any>;

    /**
     * Gets review comments stats for a repository.
     * 
     * @param owner repository owner login.
     * @param name  repository name. 
     * @returns a JSON object with statistics.
     */
    getReviewCommentsStatsByRepository(owner: string, name: string): Promise<any>;
}

/**
 * Stats service implementation.
 * 
 * @author Mario Juez <mario[at]mjuez.com> 
 */
export class StatsService implements IStatsService {

    /** Repositories list. */
    private readonly _repos: IRepositories;

    /**
     * Stats service creation.
     * 
     * @param repos Repository list dependency injection.
     */
    constructor(repos: IRepositories) {
        this._repos = repos;
    }

    /**
     * Gets reviews stats for an user.
     * 
     * @async
     * @param userLogin GitHub user login.
     * @returns a JSON object with statistics.
     */
    public getReviewsStatsByUser = async (userLogin: string): Promise<any> => {
        const filter: any = { "user.login": userLogin };
        const dateRange: any = await this.getReviewsDateRange(filter);
        return await this.getReviewsStatsBetween(dateRange, filter);
    }

    /**
     * Gets reviews stats for a repository.
     * 
     * @async
     * @param owner repository owner login.
     * @param name  repository name. 
     * @returns a JSON object with statistics.
     */
    public getReviewsStatsByRepository = async (owner: string, name: string): Promise<any> => {
        const filter: any = { "repository.owner": owner, "repository.name": name };
        const dateRange: any = await this.getReviewsDateRange(filter);
        return await this.getReviewsStatsBetween(dateRange, filter);
    }

    /**
     * Gets pull requests stats for an user.
     * 
     * @async
     * @param userLogin GitHub user login.
     * @returns a JSON object with statistics.
     */
    public getPullRequestsStatsByUser = async (userLogin: string): Promise<any> => {
        const filter: any = { "user.login": userLogin };
        const dateRange: any = await this.getPullRequestsDateRange(filter);
        return await this.getPullRequestsStatsBetween(dateRange, filter);
    }

    /**
     * Gets pull requests stats for a repository.
     * 
     * @async
     * @param owner repository owner login.
     * @param name  repository name. 
     * @returns a JSON object with statistics.
     */
    public getPullRequestsStatsByRepository = async (owner: string, name: string): Promise<any> => {
        const filter: any = { "base.repo.owner.login": owner, "base.repo.name": name };
        const dateRange: any = await this.getPullRequestsDateRange(filter);
        return await this.getPullRequestsStatsBetween(dateRange, filter);
    }

    /**
     * Gets review comments stats for an user.
     * 
     * @param userLogin GitHub user login.
     * @returns a JSON object with statistics.
     */
    public getReviewCommentsStatsByUser = async (userLogin: string): Promise<any> => {
        const filter: any = { "user.login": userLogin };
        const dateRange: any = await this.getReviewCommentsDateRange(filter);
        return await this.getReviewCommentsStatsBetween(dateRange, filter);
    }

    /**
     * Gets review comments stats for a repository.
     * 
     * @param owner repository owner login.
     * @param name  repository name. 
     * @returns a JSON object with statistics.
     */
    public getReviewCommentsStatsByRepository = async (owner: string, name: string): Promise<any> => {
        const filter: any = { "repository.owner": owner, "repository.name": name };
        const dateRange: any = await this.getReviewCommentsDateRange(filter);
        return await this.getReviewCommentsStatsBetween(dateRange, filter);
    }

    /**
     * Gets review-based statistics between two dates.
     * 
     * @async
     * @param dateRange date range to obtain statistics.
     * @param filter    reviews filter.
     * @returns a JSON object with statistics.
     */
    private async getReviewsStatsBetween(dateRange: { start: Date, end: Date }, filter: any): Promise<any> {
        let stats: any = {
            labels: [],
            all: [],
            approved: [],
            commented: [],
            changes_requested: [],
            dismissed: []
        }

        const handler = async (dates, datesLabel) => {
            const all: number = await this.getReviewsSingleStatsBetweenDates(filter, dates);
            const approved: number = await this.getReviewsSingleStatsBetweenDates(filter, dates, "APPROVED");
            const commented: number = await this.getReviewsSingleStatsBetweenDates(filter, dates, "COMMENTED");
            const changes_requested: number = await this.getReviewsSingleStatsBetweenDates(filter, dates, "CHANGES_REQUESTED");
            const dismissed: number = await this.getReviewsSingleStatsBetweenDates(filter, dates, "DISMISSED");
            stats.labels.push(datesLabel);
            stats.all.push(all);
            stats.approved.push(approved);
            stats.commented.push(commented);
            stats.changes_requested.push(changes_requested);
            stats.dismissed.push(dismissed);
        };

        await this.getStatsBetweenDates(dateRange, handler);
        return stats;
    }

    /**
     * Gets single stats for a review specific state.
     * 
     * @async
     * @param filter    reviews base filter. 
     * @param dates     date range.
     * @param state     specific state:
     *                  - all
     *                  - approved
     *                  - commented
     *                  - changes_requested
     *                  - dismissed
     * @returns count of entities (stats).
     */
    private async getReviewsSingleStatsBetweenDates(filter: any, dates: { start: Date, end: Date }, state: string = "ALL"): Promise<number> {
        const repo: IReviewRepository = this._repos.review;
        let sharedFilter: any = {
            $and: [
                { submitted_at: { $gt: dates.start } },
                { submitted_at: { $lte: dates.end } }
            ]
        };
        if (state != "ALL") sharedFilter.state = state;
        const mixedFilter = Object.assign(sharedFilter, filter);
        return await repo.count(mixedFilter);
    }

    /**
     * Gets filtered reviews date range.
     * Since first created review to last created one.
     * 
     * @async
     * @param filter    reviews filter.
     * @returns a JSON object with date range.
     */
    private async getReviewsDateRange(filter: any): Promise<any> {
        const repo: IReviewRepository = this._repos.review;
        const firstPage: IReviewEntity[] = await repo.retrieve({ filter, page: 1, sort: { submitted_at: 1 } });
        const lastPage: IReviewEntity[] = await repo.retrieve({ filter, page: 1, sort: { submitted_at: -1 } });
        const start: Date = moment(firstPage[0].document.submitted_at).add(-1, 'days').toDate();
        const end: Date = lastPage[0].document.submitted_at;
        return { start, end };
    }

    /**
     * Gets pull request-based statistics between two dates.
     * 
     * @async
     * @param dateRange date range to obtain statistics.
     * @param filter    pull requests filter.
     * @returns a JSON object with statistics.
     */
    private async getPullRequestsStatsBetween(dateRange: { start: Date, end: Date }, filter: any): Promise<any> {
        let stats: any = {
            labels: [],
            created: []
        }

        const handler = async (dates, datesLabel) => {
            stats.labels.push(datesLabel);
            const created: number = await this.getPullRequestsSingleStatsBetweenDates(filter, dates);
            stats.created.push(created);
        };
        await this.getStatsBetweenDates(dateRange, handler);
        stats.open = await this.getPullRequestsSingleStatsBetweenDates(filter, dateRange, "open");
        stats.closed = await this.getPullRequestsSingleStatsBetweenDates(filter, dateRange, "closed");
        
        return stats;
    }

    /**
     * Gets single stats for a pull request specific state.
     * 
     * @async
     * @param filter    pull requests base filter. 
     * @param dates     date range.
     * @param state     specific state:
     *                  - open
     *                  - closed
     * @returns count of entities (stats).
     */
    private async getPullRequestsSingleStatsBetweenDates(filter: any, dates: { start: Date, end: Date }, state: string = "ALL"): Promise<number> {
        const repo: IPullRequestRepository = this._repos.pull;
        let sharedFilter: any = {
            $and: [
                { created_at: { $gt: dates.start } },
                { created_at: { $lte: dates.end } }
            ]
        };
        if (state != "ALL") sharedFilter.state = state;
        const mixedFilter = Object.assign(sharedFilter, filter);
        return await repo.count(mixedFilter);
    }

    /**
     * Gets filtered pull requests date range.
     * Since first created review to last created one.
     * 
     * @async
     * @param filter    pull requests filter.
     * @returns a JSON object with date range.
     */
    private async getPullRequestsDateRange(filter: any): Promise<any> {
        const repo: IPullRequestRepository = this._repos.pull;
        const firstPage: IPullRequestEntity[] = await repo.retrieve({ filter, page: 1, sort: { created_at: 1 } });
        const lastPage: IPullRequestEntity[] = await repo.retrieve({ filter, page: 1, sort: { created_at: -1 } });
        const start: Date = moment(firstPage[0].document.created_at).add(-1, 'days').toDate();
        const end: Date = lastPage[0].document.created_at;
        return { start, end };
    }

    /**
     * Gets review comment-based statistics between two dates.
     * 
     * @async
     * @param dateRange date range to obtain statistics.
     * @param filter    review comments filter.
     * @returns a JSON object with statistics.
     */
    private async getReviewCommentsStatsBetween(dateRange: { start: Date, end: Date }, filter: any): Promise<any> {
        let stats: any = {
            labels: [],
            created: []
        }

        const handler = async (dates, datesLabel) => {
            stats.labels.push(datesLabel);
            const created: number = await this.getReviewCommentsSingleStatsBetweenDates(filter, dates);
            stats.created.push(created);
        };

        await this.getStatsBetweenDates(dateRange, handler);
        return stats;
    }

    /**
     * Gets the count of review comments between two dates.
     * 
     * @async
     * @param filter    review comments filter. 
     * @param dates     date range.
     * @returns count of entities (stats).
     */
    private async getReviewCommentsSingleStatsBetweenDates(filter: any, dates: { start: Date, end: Date }): Promise<number> {
        const repo: IReviewCommentRepository = this._repos.reviewComment;
        let sharedFilter: any = {
            $and: [
                { created_at: { $gt: dates.start } },
                { created_at: { $lte: dates.end } }
            ]
        };
        const mixedFilter = Object.assign(sharedFilter, filter);
        return await repo.count(mixedFilter);
    }

    /**
     * Gets filtered review comments date range.
     * Since first created review to last created one.
     * 
     * @async
     * @param filter    review comments filter.
     * @returns a JSON object with date range.
     */
    private async getReviewCommentsDateRange(filter: any): Promise<any> {
        const repo: IReviewCommentRepository = this._repos.reviewComment;
        const firstPage: IReviewCommentEntity[] = await repo.retrieve({ filter, page: 1, sort: { created_at: 1 } });
        const lastPage: IReviewCommentEntity[] = await repo.retrieve({ filter, page: 1, sort: { created_at: -1 } });
        const start: Date = moment(firstPage[0].document.created_at).add(-1, 'days').toDate();
        const end: Date = lastPage[0].document.created_at;
        return { start, end };
    }

    /**
     * Gets stats between two dates divided in 20 portions
     * or less if the two dates has less than 20 days.
     * 
     * @async
     * @param dates     date range.
     * @param handler   handler function. Calculates the statistics.
     */
    private async getStatsBetweenDates(dates: { start: Date, end: Date }, handler: any): Promise<void> {
        const dateRange: any = moment(dates.start).twix(dates.end);
        let portions = dateRange.count("days");
        if (portions > 20) portions = 20;
        const twixDates: any[] = dateRange.divide(portions);

        for (let i = 0; i < twixDates.length; i++) {
            const dateRange: any = twixDates[i];
            const partialDates: any = {
                start: dateRange.start(),
                end: dateRange.end()
            };
            const partialDatesLabel: string = `${partialDates.start.format("DD/MM/YYYY")} - ${partialDates.end.format("DD/MM/YYYY")}`;
            await handler(partialDates, partialDatesLabel);
        }
    }

}