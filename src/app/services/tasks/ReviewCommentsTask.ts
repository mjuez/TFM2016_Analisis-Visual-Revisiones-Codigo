import { ITask } from "./ITask";
import { GitHubTask } from "./GitHubTask";
import { ITaskRepository } from "../../data/TaskRepository";
import { IReviewCommentRepository } from "../../data/ReviewCommentRepository";
import { ITaskEntity } from "../../entities/TaskEntity";
import { IReviewCommentEntity, ReviewCommentEntity } from "../../entities/ReviewCommentEntity";
import { IReviewCommentService } from "../../services/ReviewCommentService";
import { GitHubUtil } from "../../util/GitHubUtil";
import * as GitHubAPI from "github";

interface Repositories {
    task: ITaskRepository,
    reviewComment: IReviewCommentRepository
}

export interface IReviewCommentsTask extends ITask { }

export class ReviewCommentsTask extends GitHubTask implements IReviewCommentsTask {

    private readonly _repositories: Repositories;

    private readonly _reviewCommentService: IReviewCommentService;

    constructor(entity: ITaskEntity, repositories: Repositories, reviewCommentService: IReviewCommentService, api?: GitHubAPI, apiAuth?: GitHubAPI.Auth) {
        super(entity, repositories.task, api, apiAuth);
        this._reviewCommentService = reviewCommentService;
        this._repositories = repositories;
    }

    public async run(): Promise<void> {
        try {
            await this.startTask();
            await this.makeApiCall();
            await this.completeTask();
        } catch (error) {
            this.emit("db:error", error);
            this.emit("task:stopped");
            return;
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
            await this.processPage(page);
        } catch (error) {
            this.emit("api:error", error);
            this.emit("task:stopped");
        }
    }

    private async processPage(page: any): Promise<void> {
        let api: GitHubAPI = this.API;
        let reviewComments: IReviewCommentEntity[] = ReviewCommentEntity.toEntityArray(page.data);
        console.log(`[${new Date()}] - Getting page ${this.entity.currentPage}, remaining reqs: ${page.meta['x-ratelimit-remaining']}`);
        try {
            await this._reviewCommentService.createOrUpdateMultiple(reviewComments);
            let links: string = page.meta.link;
            let nextPage: number = GitHubUtil.getNextPageNumber(links);
            this.entity.currentPage = nextPage;
            await this.persist();
        } catch (error) {
            this.emit("db:error", error);
            this.emit("task:stopped");
            return;
        }
        if (api.hasNextPage(page)) {
            try {
                let nextPage: any = await api.getNextPage(page);
                await this.processPage(nextPage);
            }catch(error){
                throw error;
            }
        }
    }
}