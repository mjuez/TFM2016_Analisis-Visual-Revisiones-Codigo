import { ITask } from "./ITask";
import { GitHubTask } from "./GitHubTask";
import { ITaskRepository } from "../../data/TaskRepository";
import { IReviewCommentRepository } from "../../data/ReviewCommentRepository";
import { ITaskEntity } from "../../entities/TaskEntity";
import { IReviewCommentEntity, ReviewCommentEntity } from "../../entities/ReviewCommentEntity";
import { IReviewCommentService } from "../../services/ReviewCommentService";
import { GitHubUtil } from "../../util/GitHubUtil";
import * as GitHubAPI from "github";
import { IRepositories } from "../../data/IRepositories";

export interface IReviewCommentsTask extends ITask { }

export class ReviewCommentsTask extends GitHubTask implements IReviewCommentsTask {

    private readonly _repositories: IRepositories;

    private readonly _reviewCommentService: IReviewCommentService;

    constructor(repositories: IRepositories, reviewCommentService: IReviewCommentService, api?: GitHubAPI, apiAuth?: GitHubAPI.Auth) {
        super(repositories.task, api, apiAuth);
        this._reviewCommentService = reviewCommentService;
        this._repositories = repositories;
    }

    public async run(): Promise<void> {
        try {
            console.log("Starting review comments task...");
            await this.startTask();
            await this.makeApiCall();
            await this.completeTask();
        } catch (error) {
            this.emit("db:error", error);
        }
    }

    private async makeApiCall(): Promise<void> {
        try {
            let page: any = await this.API.pullRequests.getCommentsForRepo(<GitHubAPI.PullRequestsGetCommentsForRepoParams>{
                owner: this.entity.owner,
                repo: this.entity.repository,
                per_page: 100,
                direction: `asc`,
                page: this.entity.currentPage
            });
            await GitHubUtil.processPage(page, this.API, ReviewCommentEntity.toReviewCommentEntityArray, this._reviewCommentService, this.updateCurrentPage);
        } catch (error) {
            this.emitError(error);
        }
    }
}