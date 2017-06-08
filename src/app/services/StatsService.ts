import { IPullRequestRepository } from "../data/PullRequestRepository";
import { IReviewRepository } from "../data/ReviewRepository";
import { IReviewCommentRepository } from "../data/ReviewCommentRepository";
import { IRepositoryRepository } from "../data/RepositoryRepository";
import { IUserRepository } from "../data/UserRepository";
import { IReviewEntity } from "../entities/ReviewEntity";
import { IUserEntity } from "../entities/UserEntity";
import { IRepositoryEntity } from "../entities/RepositoryEntity";
import * as moment from "moment";
import * as twix from "twix";
require("twix");

interface Repositories {
    pull: IPullRequestRepository,
    review: IReviewRepository,
    reviewComment: IReviewCommentRepository,
    user: IUserRepository,
    repo: IRepositoryRepository
}

export interface IStatsService {
    getReviewsStatsByUser(userLogin: string): Promise<any>;
    getReviewsStatsByRepository(owner: string, name: string): Promise<any>;
}

export class StatsService implements IStatsService {

    private readonly _repos: Repositories;

    constructor(repos: Repositories) {
        this._repos = repos;
    }

    public async getReviewsStatsByUser(userLogin: string): Promise<any> {
        const repo: IUserRepository = this._repos.user;
        const user: IUserEntity = await repo.findByLogin(userLogin);
        const filter: any = { "user.login": userLogin };
        const since: Date = user.document.created_at;
        return await this.getReviewsStatsSince(since, filter);
    }

    public async getReviewsStatsByRepository(owner: string, name: string): Promise<any> {
        const repo: IRepositoryRepository = this._repos.repo;
        const repository: IRepositoryEntity = await repo.findOne({ "owner.login": owner, name });
        const filter: any = { "repository.owner": owner, "repository.name": name };
        const since: Date = repository.document.created_at;
        return await this.getReviewsStatsSince(since, filter);
    }

    private async getReviewsStatsSince(since: Date, filter: any): Promise<any> {
        const dateRange: any = {
            start: since,
            end: await this.getLastReviewDate()
        };

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

        await this.getAllStatsBetweenDates(dateRange, handler);
        return stats;
    }

    private async getLastReviewDate(): Promise<Date> {
        const repo: IReviewRepository = this._repos.review;
        const lastPage: IReviewEntity[] = await repo.retrieve({ page: 1, sort: { submitted_at: -1 } });
        return lastPage[0].document.submitted_at;
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

    private async getAllStatsBetweenDates(dates: { start: Date, end: Date }, handler: any): Promise<void> {
        const startDate: moment.Moment = moment(dates.start).add(-1, 'days');
        const dateRange: any = moment(startDate).twix(dates.end);
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