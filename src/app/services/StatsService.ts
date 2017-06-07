import { IPullRequestRepository } from "../data/PullRequestRepository";
import { IReviewRepository } from "../data/ReviewRepository";
import { IReviewCommentRepository } from "../data/ReviewCommentRepository";
import { IRepositoryRepository } from "../data/RepositoryRepository";
import { IReviewEntity } from "../entities/ReviewEntity";
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
    getReviewsAllTimeStatsByUser(userLogin: string): Promise<any>;
}

export class StatsService implements IStatsService {

    private readonly _repos: Repositories;

    constructor(repos: Repositories) {
        this._repos = repos;
    }

    public async getReviewsAllTimeStatsByUser(userLogin: string): Promise<any> {
        const dateRange: any = this.getReviewsAllTimeDateRange();

        let stats: any = {
            labels: [],
            all: [],
            approved: [],
            commented: [],
            changes_requested: [],
            dismissed: []
        }

        const handler = async (dates, datesLabel) => {
            const all: number = await this.getReviewsSingleStatsBetweenDates(userLogin, dates);
            const approved: number = await this.getReviewsSingleStatsBetweenDates(userLogin, dates, "APPROVED");
            const commented: number = await this.getReviewsSingleStatsBetweenDates(userLogin, dates, "COMMENTED");
            const changes_requested: number = await this.getReviewsSingleStatsBetweenDates(userLogin, dates, "CHANGES_REQUESTED");
            const dismissed: number = await this.getReviewsSingleStatsBetweenDates(userLogin, dates, "DISMISSED");
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

    private async getReviewsAllTimeDateRange(): Promise<any> {
        const repo: IReviewRepository = this._repos.review;
        const firstPage: IReviewEntity[] = await repo.retrieve({ page: 1, sort: { submitted_at: 1 } });
        const lastPage: IReviewEntity[] = await repo.retrieve({ page: 1, sort: { submitted_at: -1 } });
        return {
            start: firstPage[0].document.submitted_at,
            end: lastPage[0].document.submitted_at
        };
    }

    private async getReviewsSingleStatsBetweenDates(userLogin: string, dates: { start: Date, end: Date }, state: string = "ALL"): Promise<number> {
        const repo: IReviewRepository = this._repos.review;
        const filter: any = {
            "user.login": userLogin,
            $and: [
                { created_at: { $gt: dates.start } },
                { created_at: { $lte: dates.end } }
            ]
        };
        if (state != "ALL") filter["state"] = state;
        return await repo.count(filter);
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