import { ITask } from "./ITask";
import { IUserEntity } from "../../entities/UserEntity";
import { ITaskEntity } from "../../entities/TaskEntity";
import { IReviewEntity } from "../../entities/ReviewEntity";
import { ITaskRepository } from "../../data/TaskRepository";
import { IReviewRepository } from "../../data/ReviewRepository";
import { IUserRepository } from "../../data/UserRepository";
import { IUserService } from "../../services/UserService";
import { AbstractUserTask } from "./AbstractUserTask";
import { IRepositories } from "../../data/IRepositories";
import { GetUserParams, GitHubUtil } from "../../util/GitHubUtil";
import * as GitHubAPI from "github";

export interface IUsersReviewsTask extends ITask { }

export class UsersReviewsTask extends AbstractUserTask implements IUsersReviewsTask {

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
        const taskId: any = this.entity.parentTask.document._id;
        for (let i: number = 0; i < reviews.length; i++) {
            let review: IReviewEntity = reviews[i];
            try {
                await this._userTaskUtil.processUser(review.document.user.login, taskId, this.API, this.emitError);
                this.entity.lastProcessed = review.document.id;
                this.entity.currentPage = 1;
                await this.persist();
            } catch (error) {
                return false;
            }
        }
        return true;
    }

}