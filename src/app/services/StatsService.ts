import { IPullRequestRepository } from "../data/PullRequestRepository";
import { IReviewRepository } from "../data/ReviewRepository";
import { IReviewCommentRepository } from "../data/ReviewCommentRepository";
import { IRepositoryRepository } from "../data/RepositoryRepository";
import { IPullRequestEntity } from "../entities/PullRequestEntity";
import { IReviewEntity } from "../entities/ReviewEntity";
import { IReviewCommentEntity } from "../entities/ReviewCommentEntity";
import * as moment from "moment";
import * as twix from "twix";
require("twix");

interface Repositories {
    pull: IPullRequestRepository,
    review: IReviewRepository,
    reviewComment: IReviewCommentRepository,
    repo: IRepositoryRepository
}

export interface IStatsService {
    getReviewsStatsByUser(userLogin: string): Promise<any>;
    getReviewsStatsByRepository(owner: string, name: string): Promise<any>;
    getPullRequestsStatsByUser(userLogin: string): Promise<any>;
    getPullRequestsStatsByRepository(owner: string, name: string): Promise<any>;
    getReviewCommentsStatsByUser(userLogin: string): Promise<any>;
    getReviewCommentsStatsByRepository(owner: string, name: string): Promise<any>;
}

export class StatsService implements IStatsService {

    private readonly _repos: Repositories;

    constructor(repos: Repositories) {
        this._repos = repos;
    }

    public async getReviewsStatsByUser(userLogin: string): Promise<any> {
        const filter: any = { "user.login": userLogin };
        const dateRange: any = await this.getReviewsDateRange(filter);
        return await this.getReviewsStatsBetween(dateRange, filter);
    }

    public async getReviewsStatsByRepository(owner: string, name: string): Promise<any> {
        const filter: any = { "repository.owner": owner, "repository.name": name };
        const dateRange: any = await this.getReviewsDateRange(filter);
        return await this.getReviewsStatsBetween(dateRange, filter);
    }

    public async getPullRequestsStatsByUser(userLogin: string): Promise<any> {
        const filter: any = { "user.login": userLogin };
        const dateRange: any = await this.getPullRequestsDateRange(filter);
        return await this.getPullRequestsStatsBetween(dateRange, filter);
    }

    public async getPullRequestsStatsByRepository(owner: string, name: string): Promise<any> {
        const filter: any = { "base.repo.owner.login": owner, "base.repo.name": name };
        const dateRange: any = await this.getPullRequestsDateRange(filter);
        return await this.getPullRequestsStatsBetween(dateRange, filter);
    }

    public async getReviewCommentsStatsByUser(userLogin: string): Promise<any> {
        const filter: any = { "user.login": userLogin };
        const dateRange: any = await this.getReviewCommentsDateRange(filter);
        return await this.getReviewCommentsStatsBetween(dateRange, filter);
    }

    public async getReviewCommentsStatsByRepository(owner: string, name: string): Promise<any> {
        const filter: any = { "repository.owner": owner, "repository.name": name };
        const dateRange: any = await this.getReviewCommentsDateRange(filter);
        return await this.getReviewCommentsStatsBetween(dateRange, filter);
    }

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

    private async getReviewsDateRange(filter: any): Promise<any> {
        const repo: IReviewRepository = this._repos.review;
        const firstPage: IReviewEntity[] = await repo.retrieve({ filter, page: 1, sort: { submitted_at: 1 } });
        const lastPage: IReviewEntity[] = await repo.retrieve({ filter, page: 1, sort: { submitted_at: -1 } });
        const start: Date = moment(firstPage[0].document.submitted_at).add(-1, 'days').toDate();
        const end: Date = lastPage[0].document.submitted_at;
        return { start, end };
    }

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

    private async getPullRequestsDateRange(filter: any): Promise<any> {
        const repo: IPullRequestRepository = this._repos.pull;
        const firstPage: IPullRequestEntity[] = await repo.retrieve({ filter, page: 1, sort: { created_at: 1 } });
        const lastPage: IPullRequestEntity[] = await repo.retrieve({ filter, page: 1, sort: { created_at: -1 } });
        const start: Date = moment(firstPage[0].document.created_at).add(-1, 'days').toDate();
        const end: Date = lastPage[0].document.created_at;
        return { start, end };
    }

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

    private async getReviewCommentsDateRange(filter: any): Promise<any> {
        const repo: IReviewCommentRepository = this._repos.reviewComment;
        const firstPage: IReviewCommentEntity[] = await repo.retrieve({ filter, page: 1, sort: { created_at: 1 } });
        const lastPage: IReviewCommentEntity[] = await repo.retrieve({ filter, page: 1, sort: { created_at: -1 } });
        const start: Date = moment(firstPage[0].document.created_at).add(-1, 'days').toDate();
        const end: Date = lastPage[0].document.created_at;
        return { start, end };
    }

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