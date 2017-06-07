import { IMultiplePersistenceService } from "../services/IPersistenceService";
import { IPullRequestService } from "../services/PullRequestService";
import { IReviewEntity, ReviewEntity } from "../entities/ReviewEntity";
import { IPullRequestEntity } from "../entities/PullRequestEntity";
import { ReviewDocument } from "../entities/documents/ReviewDocument";
import { IReviewRepository } from "../data/ReviewRepository";
import { AbstractMultiplePersistenceService } from "./AbstractPersistenceService";
import { FormatUtil } from "../util/FormatUtil";
import * as moment from "moment";
import * as twix from "twix";
require("twix");

/**
 * IReviewService interface.
 * Describes specific functionality for Review entities.
 * @author Mario Juez <mario@mjuez.com> 
 */
export interface IReviewService extends IMultiplePersistenceService<IReviewEntity> {

    getFirstAndLast(): Promise<any>;
    getAllTimeStatsByUser(userLogin: string, dates: { start: Date, end: Date }): Promise<number[]>;

}

/**
 * Review services.
 * @author Mario Juez <mario@mjuez.com>
 */
export class ReviewService extends AbstractMultiplePersistenceService<IReviewRepository, IReviewEntity, ReviewDocument> implements IReviewService {

    /** Pull Request service. */
    private readonly _pullRequestService: IPullRequestService;

    /**
     * Class constructor with Review repository and
     * pull request service dependency injection.
     * @param repository            Injected Review repository.
     * @param pullRequestService    Injected pull request service.
     */
    constructor(repository: IReviewRepository, pullRequestService: IPullRequestService) {
        super(repository);
        this._pullRequestService = pullRequestService;
    }

    public async getFirstAndLast(): Promise<any> {
        const repo: IReviewRepository = this._repository;
        const firstPage: IReviewEntity[] = await repo.retrieve({ page: 1, sort: { submitted_at: 1 } });
        const lastPage: IReviewEntity[] = await repo.retrieve({ page: 1, sort: { submitted_at: -1 } });
        return {
            first: firstPage[0],
            last: lastPage[0]
        };
    }

    public async getAllTimeStatsByUser(userLogin: string, dates: { start: Date, end: Date }): Promise<Object> {
        const startDate: moment.Moment = moment(dates.start).add(-1, 'days');
        const dateRange: any = moment(startDate).twix(dates.end);
        let portions = dateRange.count("days");
        if (portions > 20) portions = 20;
        const twixDates: any[] = dateRange.divide(portions);
        let stats: any = {
            labels: FormatUtil.toDateLabels(twixDates),
            all: [],
            approved: [],
            changes_requested: [],
            commented: [],
            dismissed: []
        }
        for (let i = 0; i < twixDates.length; i++) {
            const dateRange: any = twixDates[i];
            const partialDates: any = {
                start: dateRange.start(),
                end: dateRange.end()
            }
            const all = await this.getCreatedBetweenDatesStatsByUser(userLogin, partialDates);
            const approved = await this.getCreatedBetweenDatesStatsByUser(userLogin, partialDates, "APPROVED");
            const changes_requested = await this.getCreatedBetweenDatesStatsByUser(userLogin, partialDates, "CHANGES_REQUESTED");
            const commented = await this.getCreatedBetweenDatesStatsByUser(userLogin, partialDates, "COMMENTED");
            const dismissed = await this.getCreatedBetweenDatesStatsByUser(userLogin, partialDates, "DISMISSED");
            stats.all.push(all);
            stats.approved.push(approved);
            stats.changes_requested.push(changes_requested);
            stats.commented.push(commented);
            stats.dismissed.push(dismissed);
        }
        return stats;
    }

    private async getCreatedBetweenDatesStatsByUser(userLogin: string, dates: { start: Date, end: Date }, state: string = "ALL"): Promise<number> {
        const repo: IReviewRepository = this._repository;
        let filter: Object = {
            "user.login": userLogin,
            $and: [
                { submitted_at: { $gt: dates.start } },
                { submitted_at: { $lte: dates.end } }
            ]
        };
        if (state != "ALL") filter["state"] = state;
        return await repo.count(filter);
    }

    protected async findEntity(entity: IReviewEntity): Promise<IReviewEntity> {
        return await this._repository.findById(entity.id);
    }

}