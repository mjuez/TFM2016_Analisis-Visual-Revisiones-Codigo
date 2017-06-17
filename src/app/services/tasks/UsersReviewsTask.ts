import { ITask } from "./ITask";
import { IUserEntity } from "../../entities/UserEntity";
import { ITaskEntity } from "../../entities/TaskEntity";
import { IReviewEntity } from "../../entities/ReviewEntity";
import { ITaskRepository } from "../../data/TaskRepository";
import { IReviewRepository } from "../../data/ReviewRepository";
import { IUserRepository } from "../../data/UserRepository";
import { IUserService } from "../../services/UserService";
import { GitHubTask } from "./GitHubTask";
import { IRepositories } from "../../data/IRepositories";
import { GetUserParams, GitHubUtil } from "../../util/GitHubUtil";
import * as GitHubAPI from "github";

export interface IUsersReviewsTask extends ITask { }

export class UsersReviewsTask extends GitHubTask implements IUsersReviewsTask {

    private readonly _repos: IRepositories;

    private readonly _userService: IUserService;

    constructor(repos: IRepositories, userService: IUserService, api?: GitHubAPI, apiAuth?: GitHubAPI.Auth) {
        super(repos.task, api, apiAuth);
        this._repos = repos;
        this._userService = userService;
    }

    public async run(): Promise<void> {
        let reviewRepo: IReviewRepository = this._repos.review;
        let startingFrom: number = this.entity.lastProcessed;
        try {
            console.log("Starting user reviews task...");
            await this.startTask();
            let filter: Object = {
                repository: {
                    name: this.entity.repository,
                    owner: this.entity.owner
                }
            };
            let numPages: number = await reviewRepo.numPages(filter, startingFrom);
            for (let page: number = 1; page <= numPages; page++) {
                let reviews: IReviewEntity[] = await reviewRepo.retrieve({ filter, page, startingFrom });
                let success: boolean = await this.processReviews(reviews);
                if (!success) return;
            }
            await this.completeTask();
        } catch (error) {
            this.emit("db:error", error);
        }
    }

    private async processReviews(reviews: IReviewEntity[]): Promise<boolean> {
        let parameters: GetUserParams = {
            username: null,
            userRepo: this._repos.user,
            userService: this._userService,
            taskId: this.entity.parentTask.document._id,
            statsHandler: this.updateStats,
            errorHandler: this.emitError,
            api: this.API
        };
        for (let i: number = 0; i < reviews.length; i++) {
            let review: IReviewEntity = reviews[i];
            try {
                parameters.username = review.document.user.login;
                await GitHubUtil.processUser(parameters);
                this.entity.lastProcessed = review.document.id;
                this.entity.currentPage = 1;
                await this.persist();
            } catch (error) {
                return false;
            }
        }
        return true;
    }

    private updateStats = async (username: string): Promise<void> => {
        let userRepo: IUserRepository = this._repos.user;
        try {
            let user: IUserEntity = await userRepo.findByLogin(username);
            user.document.reviews_count = await this.getStats(username);
            user.document.reviews_approved_count = await this.getStats(username, "APPROVED");
            user.document.reviews_commented_count = await this.getStats(username, "COMMENTED");
            user.document.reviews_changes_requested_count = await this.getStats(username, "CHANGES_REQUESTED");
            user.document.reviews_dismissed_count = await this.getStats(username, "DISMISSED");
            await userRepo.update(user);
        } catch (error) {
            this.emit("db:error", error);
            throw error;
        }
    }

    private getStats = async (username: string, state: string = null): Promise<number> => {
        let reviewRepo: IReviewRepository = this._repos.review;
        let filter: Object = { "user.login": username };
        if (state != null) filter["state"] = state;
        try {
            let reviewsCount: number = await reviewRepo.count(filter);
            return reviewsCount;
        } catch (error) {
            throw error;
        }
    }

}