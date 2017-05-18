import { ITask } from "./ITask";
import { AbstractUserTask } from "./AbstractUserTask";
import { IUserEntity } from "../../entities/UserEntity";
import { ITaskEntity } from "../../entities/TaskEntity";
import { IReviewCommentEntity } from "../../entities/ReviewCommentEntity";
import { ITaskRepository } from "../../data/TaskRepository";
import { IReviewCommentRepository } from "../../data/ReviewCommentRepository";
import { IUserRepository } from "../../data/UserRepository";
import { IUserService } from "../../services/UserService";
import * as GitHubAPI from "github";

interface Repositories {
    reviewComment: IReviewCommentRepository,
    task: ITaskRepository,
    user: IUserRepository
}

export interface IUsersReviewCommentsTask extends ITask { }

export class UsersReviewCommentsTask extends AbstractUserTask implements IUsersReviewCommentsTask {

    private readonly _repos: Repositories;

    constructor(repos: Repositories, userService: IUserService, api?: GitHubAPI, apiAuth?: GitHubAPI.Auth) {
        super({ task: repos.task, user: repos.user }, userService, api, apiAuth);
        this._repos = repos;
    }

    public async run(): Promise<void> {
        let reviewCommentRepo: IReviewCommentRepository = this._repos.reviewComment;
        let startingFrom: number = this.entity.lastProcessed;
        try {
            await this.startTask();
            let filter: Object = {
                repository: {
                    name: this.entity.repository,
                    owner: this.entity.owner
                }
            };
            let numPages: number = await reviewCommentRepo.numPages(filter, startingFrom);
            for (let page: number = 1; page <= numPages; page++) {
                let reviewComments: IReviewCommentEntity[] = await reviewCommentRepo.retrievePartial(filter, startingFrom, page);
                let success: boolean = await this.processReviewComments(reviewComments);
                if (!success) return;
            }
            await this.completeTask();
        } catch (error) {
            this.emit("db:error", error);
        }
    }

    private async processReviewComments(reviewComments: IReviewCommentEntity[]): Promise<boolean> {
        for (let i: number = 0; i < reviewComments.length; i++) {
            let reviewComment: IReviewCommentEntity = reviewComments[i];
            try {
                await this.processUser(reviewComment.document.user.login);
                this.entity.lastProcessed = reviewComment.document.id;
                await this.persist();
            } catch (error) {
                return false;
            }
        }
        return true;
    }

    protected async updateStats(username: string): Promise<void> {
        let userRepo: IUserRepository = this._repos.user;
        let reviewCommentRepo: IReviewCommentRepository = this._repos.reviewComment;
        let filter: Object = {
            user: {
                login: username
            }
        }
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