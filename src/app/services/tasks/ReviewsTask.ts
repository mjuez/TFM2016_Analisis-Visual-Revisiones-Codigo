import { ITask } from "./ITask";
import { GitHubTask } from "./GitHubTask";
import { ReviewEntity } from "../../entities/ReviewEntity";
import { IPullRequestEntity } from "../../entities/PullRequestEntity";
import { IPullRequestRepository } from "../../data/PullRequestRepository";
import { IReviewRepository } from "../../data/ReviewRepository";
import { IReviewService } from "../../services/ReviewService";
import { GitHubUtil } from "../../util/GitHubUtil";
import { AbstractPullRequestTask } from "./AbstractPullRequestTask";
import { IRepositories } from "../../data/IRepositories";
import * as GitHubAPI from "github";

/**
 * Reviews Task interface.
 * 
 * This task type is intended to obtain all reviews
 * from a GitHub repository. It loops all pull requests
 * and gets all reviews of each one.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IReviewsTask extends ITask { }

/**
 * Reviews task implementation.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class ReviewsTask extends AbstractPullRequestTask implements IReviewsTask {

    /** Review service. */
    private readonly _reviewService: IReviewService;

    /**
     * Creates the task instance.
     * 
     * @param repos         Repositories list
     * @param reviewService Review service.
     * @param api           optional GitHub API.
     * @param apiAuth       optional GitHub API Authorization.
     */
    constructor(repos: IRepositories, reviewService: IReviewService, api?: GitHubAPI, apiAuth?: GitHubAPI.Auth) {
        super(repos, api, apiAuth);
        this._reviewService = reviewService;
    }

    /**
     * Process all repository pull request for
     * getting the reviews of each one.
     * 
     * @async
     * @param pulls Pull requests list.
     */
    protected async processPullRequests(pulls: IPullRequestEntity[]): Promise<boolean> {
        for (let i: number = 0; i < pulls.length; i++) {
            let pull: IPullRequestEntity = pulls[i];
            try {
                await this.makeApiCall(pull.document.number);
                await this.updateStats(pull);
                this.entity.lastProcessed = pull.document.number;
                this.entity.currentPage = 1;
                await this.persist();
            } catch (error) {
                return false;
            }
        }
        return true;
    }

    /**
     * Makes a GitHub API Call.
     * Obtains and processes all pages of reviews in
     * a pull request.
     * 
     * @async
     * @param pullNumber    pull request number.
     */
    private async makeApiCall(pullNumber: number): Promise<void> {
        try {
            let page: any = await this.API.pullRequests.getReviews(<GitHubAPI.PullRequestsGetReviewsParams>{
                owner: this.entity.owner,
                repo: this.entity.repository,
                number: pullNumber,
                per_page: 100,
                direction: `asc`,
                page: this.entity.currentPage
            });
            await GitHubUtil.processPage(page, this.API, ReviewEntity.toReviewEntityArray, this._reviewService, this.updateCurrentPage);
        } catch (error) {
            this.emitError(error);
            throw error;
        }
    }

    /**
     * Updates the reviews stats (count)
     * of a pull request.
     * 
     * @param pull  Pull Request entity.
     */
    private async updateStats(pull: IPullRequestEntity): Promise<void> {
        let pullRepo: IPullRequestRepository = this._repositories.pull;
        let reviewRepo: IReviewRepository = this._repositories.review;
        let filter: Object = {
            pull_request_number: pull.document.number,
            repository: {
                name: pull.document.base.repo.name,
                owner: pull.document.base.repo.owner.login
            }
        }
        try {
            let reviewsCount: number = await reviewRepo.count(filter);
            console.log(`Updating pull reviews count, pull: #${pull.document.number} (${pull.document.base.repo.owner.login}/${pull.document.base.repo.name}, count: ${reviewsCount})`);
            pull.document["reviews"] = reviewsCount;
            await pullRepo.update(pull);
        } catch (error) {
            this.emit("db:error", error);
            throw error;
        }
    }
}