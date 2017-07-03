import { ITask } from "./ITask";
import { IReviewCommentEntity } from "../../entities/ReviewCommentEntity";
import { IReviewCommentRepository } from "../../data/ReviewCommentRepository";
import { AbstractUserTask } from "./AbstractUserTask";

/**
 * User review comments Task interface.
 * 
 * This task type is intended to obtain the authors
 * of all review comments of a repository.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IUsersReviewCommentsTask extends ITask { }

/**
 * User review comments task implementation.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class UsersReviewCommentsTask extends AbstractUserTask implements IUsersReviewCommentsTask {

    /**
     * Runs the task.
     * Obtains all review comments of a repository from database
     * and processes its users.
     * At the end of the task, users stats are updated.
     * 
     * @async
     */
    public async run(): Promise<void> {
        let reviewCommentRepo: IReviewCommentRepository = this._repos.reviewComment;
        let startingFrom: number = this.entity.lastProcessed;
        try {
            await this.startTask();
            let filter: Object = {
                repository: {
                    name: new RegExp(this.entity.repository, "i"),
                    owner: new RegExp(this.entity.owner, "i")
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

    /**
     * Processes the users of all review comments.
     * 
     * @async
     * @param reviewComments    Review Comment List.
     * @returns if successfull processing.
     */
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