import { ITask } from "./ITask";
import { AbstractUserTask } from "./AbstractUserTask";
import { IUserEntity } from "../../entities/UserEntity";
import { ITaskEntity } from "../../entities/TaskEntity";
import { IReviewEntity } from "../../entities/ReviewEntity";
import { ITaskRepository } from "../../data/TaskRepository";
import { IReviewRepository } from "../../data/ReviewRepository";
import { IUserRepository } from "../../data/UserRepository";
import { IUserService } from "../../services/UserService";
import * as GitHubAPI from "github";

interface Repositories {
    review: IReviewRepository,
    task: ITaskRepository,
    user: IUserRepository
}

export interface IUsersReviewsTask extends ITask { }

export class UsersReviewsTask extends AbstractUserTask implements IUsersReviewsTask {

    private readonly _repos: Repositories;

    constructor(repos: Repositories, userService: IUserService, api?: GitHubAPI, apiAuth?: GitHubAPI.Auth) {
        super({ task: repos.task, user: repos.user }, userService, api, apiAuth);
        this._repos = repos;
    }

    public async run(): Promise<void> {
        let reviewRepo: IReviewRepository = this._repos.review;
        let startingFrom: number = this.entity.lastProcessed;
        try {
            await this.startTask();
            let filter: Object = {
                repository: {
                    name: this.entity.repository,
                    owner: this.entity.owner
                }
            };
            let numPages: number = await reviewRepo.numPages(filter, startingFrom);
            for (let page: number = 1; page <= numPages; page++) {
                let reviews: IReviewEntity[] = await reviewRepo.retrievePartial(filter, startingFrom, page);
                let success: boolean = await this.processReviews(reviews);
                if (!success) return;
            }
            await this.completeTask();
        } catch (error) {
            this.emit("db:error", error);
        }
    }

    private async processReviews(reviews: IReviewEntity[]): Promise<boolean> {
        for (let i: number = 0; i < reviews.length; i++) {
            let review: IReviewEntity = reviews[i];
            try {
                await this.processUser(review.document.user.login);
                this.entity.lastProcessed = review.document.id;
                await this.persist();
            } catch (error) {
                return false;
            }
        }
        return true;
    }

    protected async updateStats(username: string): Promise<void> {
        let userRepo: IUserRepository = this._repos.user;
        try {
            let user: IUserEntity = await userRepo.findByLogin(username);
            user.document.reviews_count = await this.getStats(username);
            user.document.reviews_approved_count = await this.getStats("APPROVED");
            user.document.reviews_commented_count = await this.getStats("COMMENTED");
            user.document.reviews_changes_requested_count = await this.getStats("CHANGES_REQUESTED");
            user.document.reviews_dismissed_count = await this.getStats("DISMISSED");
            await userRepo.update(user);
        } catch (error) {
            this.emit("db:error", error);
            throw error;
        }
    }

    private async getStats(username: string, state: string = null): Promise<number> {
        let reviewRepo: IReviewRepository = this._repos.review;
        let filter: Object = {
            user: {
                login: username
            }
        }
        if (state != null) filter["state"] = state;
        try {
            let reviewsCount: number = await reviewRepo.count(filter);
            return reviewsCount;
        } catch (error) {
            throw error;
        }
    }

}