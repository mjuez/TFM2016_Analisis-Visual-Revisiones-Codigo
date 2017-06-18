import { ITask } from "./ITask";
import { IReviewCommentEntity } from "../../entities/ReviewCommentEntity";
import { IReviewCommentRepository } from "../../data/ReviewCommentRepository";
import { AbstractUserTask } from "./AbstractUserTask";

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
        for (let i: number = 0; i < reviewComments.length; i++) {
            const reviewComment: IReviewCommentEntity = reviewComments[i];
            try {
                await this.process(reviewComment.document.user.login, reviewComment.id);
            } catch (error) {
                return false;
            }
        }
        return true;
    }
}