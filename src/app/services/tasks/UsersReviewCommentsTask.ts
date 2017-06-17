import { ITask } from "./ITask";
import { IUserEntity } from "../../entities/UserEntity";
import { ITaskEntity } from "../../entities/TaskEntity";
import { IReviewCommentEntity } from "../../entities/ReviewCommentEntity";
import { ITaskRepository } from "../../data/TaskRepository";
import { IReviewCommentRepository } from "../../data/ReviewCommentRepository";
import { IUserRepository } from "../../data/UserRepository";
import { IUserService } from "../../services/UserService";
import { IRepositories } from "../../data/IRepositories";
import { AbstractUserTask } from "./AbstractUserTask";
import { GetUserParams, GitHubUtil } from "../../util/GitHubUtil";
import * as GitHubAPI from "github";

export interface IUsersReviewCommentsTask extends ITask { }

export class UsersReviewCommentsTask extends AbstractUserTask implements IUsersReviewCommentsTask {

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
            await this._userTaskUtil.updateStats(this.entity.parentTask.document._id, this.emitError);
            await this.completeTask();
        } catch (error) {
            this.emit("db:error", error);
        }
    }

    private async processReviewComments(reviewComments: IReviewCommentEntity[]): Promise<boolean> {
        const taskId: any = this.entity.parentTask.document._id;
        for (let i: number = 0; i < reviewComments.length; i++) {
            let reviewComment: IReviewCommentEntity = reviewComments[i];
            try {
                await this._userTaskUtil.processUser(reviewComment.document.user.login, taskId, this.API, this.emitError);
                this.entity.lastProcessed = reviewComment.document.id;
                this.entity.currentPage = 1;
                await this.persist();
            } catch (error) {
                return false;
            }
        }
        return true;
    }
}