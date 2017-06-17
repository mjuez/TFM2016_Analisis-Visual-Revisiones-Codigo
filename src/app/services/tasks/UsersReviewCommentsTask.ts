import { ITask } from "./ITask";
import { IUserEntity } from "../../entities/UserEntity";
import { ITaskEntity } from "../../entities/TaskEntity";
import { IReviewCommentEntity } from "../../entities/ReviewCommentEntity";
import { ITaskRepository } from "../../data/TaskRepository";
import { IReviewCommentRepository } from "../../data/ReviewCommentRepository";
import { IUserRepository } from "../../data/UserRepository";
import { IUserService } from "../../services/UserService";
import { IRepositories } from "../../data/IRepositories";
import { GitHubTask } from "./GitHubTask";
import { GetUserParams, GitHubUtil } from "../../util/GitHubUtil";
import * as GitHubAPI from "github";

export interface IUsersReviewCommentsTask extends ITask { }

export class UsersReviewCommentsTask extends GitHubTask implements IUsersReviewCommentsTask {

    private readonly _repos: IRepositories;

    private readonly _userService: IUserService;

    constructor(repos: IRepositories, userService: IUserService, api?: GitHubAPI, apiAuth?: GitHubAPI.Auth) {
        super(repos.task, api, apiAuth);
        this._repos = repos;
        this._userService = userService;
    }

    public async run(): Promise<void> {
        let reviewCommentRepo: IReviewCommentRepository = this._repos.reviewComment;
        let startingFrom: number = this.entity.lastProcessed;
        try {
            console.log("Starting user review comments task...");
            await this.startTask();
            let filter: Object = {
                repository: {
                    name: this.entity.repository,
                    owner: this.entity.owner
                }
            };
            let numPages: number = await reviewCommentRepo.numPages(filter, startingFrom);
            for (let page: number = 1; page <= numPages; page++) {
                let reviewComments: IReviewCommentEntity[] = await reviewCommentRepo.retrieve({ filter, page, startingFrom });
                let success: boolean = await this.processReviewComments(reviewComments);
                if (!success) return;
            }
            await this.completeTask();
        } catch (error) {
            this.emit("db:error", error);
        }
    }

    private async processReviewComments(reviewComments: IReviewCommentEntity[]): Promise<boolean> {
        let parameters: GetUserParams = {
            username: null,
            userRepo: this._repos.user,
            userService: this._userService,
            taskId: this.entity.parentTask.document._id,
            statsHandler: this.updateStats,
            errorHandler: this.emitError,
            api: this.API
        };
        for (let i: number = 0; i < reviewComments.length; i++) {
            let reviewComment: IReviewCommentEntity = reviewComments[i];
            try {
                parameters.username = reviewComment.document.user.login;
                await GitHubUtil.processUser(parameters);
                this.entity.lastProcessed = reviewComment.document.id;
                this.entity.currentPage = 1;
                await this.persist();
            } catch (error) {
                return false;
            }
        }
        return true;
    }

    private async updateStats(username: string): Promise<void> {
        let userRepo: IUserRepository = this._repos.user;
        let reviewCommentRepo: IReviewCommentRepository = this._repos.reviewComment;
        let filter: Object = { "user.login": username };
        try {
            let user: IUserEntity = await userRepo.findByLogin(username);
            let reviewCommentsCount: number = await reviewCommentRepo.count(filter);
            user.document.review_comments_count = reviewCommentsCount;
            await userRepo.update(user);
        } catch (error) {
            this.emit("db:error", error);
            throw error;
        }
    }
}