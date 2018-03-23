import { ITask } from "./ITask";
import { GitHubTask } from "./GitHubTask";
import { ReviewCommentEntity } from "../../entities/ReviewCommentEntity";
import { IReviewCommentService } from "../../services/ReviewCommentService";
import { GitHubUtil } from "../../util/GitHubUtil";
import { IRepositories } from "../../data/IRepositories";
import * as GitHubAPI from "@octokit/rest";

/**
 * Review Comment Task interface.
 *
 * This task type is intended to obtain all review
 * comments from a GitHub repository.
 *
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IReviewCommentsTask extends ITask { }

/**
 * Review Comment task implementation.
 *
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class ReviewCommentsTask extends GitHubTask implements IReviewCommentsTask {

    /** Repositories list. */
    private readonly _repositories: IRepositories;

    /** Review comment service. */
    private readonly _reviewCommentService: IReviewCommentService;

    /**
     * Creates the task instance.
     *
     * @param repositories          Repositories list.
     * @param reviewCommentService  Review comment service.
     * @param api                   optional GitHub API.
     * @param apiAuth               optional GitHub API Authorization.
     */
    constructor(repositories: IRepositories, reviewCommentService: IReviewCommentService, api?: GitHubAPI, apiAuth?: GitHubAPI.Auth) {
        super(repositories.task, api, apiAuth);
        this._reviewCommentService = reviewCommentService;
        this._repositories = repositories;
    }

    /**
     * Runs the review comment task.
     *
     * @async
     */
    public async run(): Promise<void> {
        try {
            await this.startTask();
            await this.makeApiCall();
            await this.completeTask();
        } catch (error) {
            this.emit("db:error", error);
        }
    }

    /**
     * Makes a GitHub API Call.
     * Gets all pages of review comments.
     *
     * @async
     */
    private async makeApiCall(): Promise<void> {
        try {
            let page: any = await this.API.pullRequests.getCommentsForRepo(<GitHubAPI.PullRequestsGetCommentsForRepoParams>{
                owner: this.entity.owner,
                repo: this.entity.repository,
                per_page: 100,
                direction: `asc`,
                page: this.entity.currentPage
            });
            await GitHubUtil.processPage(page, this.API, ReviewCommentEntity.toReviewCommentEntityArray,
                this._reviewCommentService, this.updateCurrentPage);
        } catch (error) {
            this.emitError(error);
        }
    }
}