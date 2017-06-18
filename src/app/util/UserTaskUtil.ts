import { IRepositories } from "../data/IRepositories";
import { IUserService } from "../services/UserService";
import { IUserEntity, UserEntity } from "../entities/UserEntity";
import * as GitHubAPI from "github";

export interface IUserTaskUtil {
    
    /**
     * Gets an user from GitHub for save or update it.
     * If an user was retrieved before in the same task
     * it wont be retrieved again.
     * After getting an user, its stats should be updated.
     * 
     * @async
     * @param params 
     */
    processUser(username: string, taskId: any, api: GitHubAPI, errorHandler: any): Promise<void>;

    updateStats(taskId: any, errorHandler: any): Promise<void>;
}

export class UserTaskUtil {

    private readonly _repos: IRepositories;

    private readonly _service: IUserService;

    constructor(repos: IRepositories, service: IUserService) {
        this._repos = repos;
        this._service = service;
    }

    /**
     * Gets an user from GitHub for save or update it.
     * If an user was retrieved before in the same task
     * it wont be retrieved again.
     * After getting an user, its stats should be updated.
     * 
     * @async
     * @param params 
     */
    public async processUser(username: string, taskId: any, api: GitHubAPI, errorHandler: any): Promise<void> {
        if (username === undefined) return;
        try {
            const foundUser: IUserEntity = await this._repos.user.findOne({
                login: username,
                updated_on_task: taskId
            });
            if (foundUser === null) {
                let user: IUserEntity = await this.makeApiCall(username, api);
                user.document.updated_on_task = taskId;
                await this._service.createOrUpdate(user);
            }
        } catch (error) {
            errorHandler(error);
            throw error;
        }
    }

    public async updateStats(taskId: any, errorHandler: any): Promise<void> {
        const filter: any = {
            updated_on_task: taskId
        };
        try {
            const numPages: number = await this._repos.user.numPages(filter);
            for (let page = 1; page <= numPages; page++) {
                const users: IUserEntity[] = await this._repos.user.retrieve({ filter, page });
                users.map((user) => { this.updateUserStats(user) });
            }
        } catch (error) {
            errorHandler(error);
            throw error;
        }
    }

    private async updateUserStats(user: IUserEntity): Promise<void> {
        const filter: Object = { "user.login": user.login };
        try {
            const pullRequestCount: number = await this._repos.pull.count(filter);
            const reviewCommentsCount: number = await this._repos.reviewComment.count(filter);
            user.document.pull_request_count = pullRequestCount;
            user.document.reviews_count = await this.getReviewStats(filter);
            user.document.reviews_approved_count = await this.getReviewStats(filter, "APPROVED");
            user.document.reviews_commented_count = await this.getReviewStats(filter, "COMMENTED");
            user.document.reviews_changes_requested_count = await this.getReviewStats(filter, "CHANGES_REQUESTED");
            user.document.reviews_dismissed_count = await this.getReviewStats(filter, "DISMISSED");
            user.document.review_comments_count = reviewCommentsCount;
            await this._repos.user.update(user);
        } catch (error) {
            throw error;
        }
    }

    private async getReviewStats(filter: any, state: string = null): Promise<number> {
        if (state != null) filter["state"] = state;
        try {
            let reviewsCount: number = await this._repos.review.count(filter);
            return reviewsCount;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Makes a call to GitHub API to retrieve an user.
     * 
     * @async
     * @param username  User login.
     * @param api       GitHub API dependency.
     * @returns user entity.
     */
    private async makeApiCall(username: string, api: GitHubAPI): Promise<IUserEntity> {
        try {
            let userData: any = await api.users.getForUser(<GitHubAPI.Username>{ username });
            console.log(`[${new Date()}] - Getting user @${username}, remaining reqs: ${userData.meta['x-ratelimit-remaining']}`);
            return UserEntity.toEntity(userData.data);
        } catch (error) {
            throw error;
        }
    }

}