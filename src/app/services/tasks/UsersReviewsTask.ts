import { ITask } from "./ITask";
import { IReviewEntity } from "../../entities/ReviewEntity";
import { IReviewRepository } from "../../data/ReviewRepository";
import { AbstractUserTask } from "./AbstractUserTask";

/**
 * User reviews Task interface.
 *
 * This task type is intended to obtain the authors
 * of all reviews of a repository.
 *
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IUsersReviewsTask extends ITask { }

/**
 * User reviews task implementation.
 *
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class UsersReviewsTask extends AbstractUserTask implements IUsersReviewsTask {

    /**
     * Runs the task.
     * Obtains all reviews of a repository from database
     * and processes its users.
     *
     * @async
     */
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
                let reviews: IReviewEntity[] = await reviewRepo.retrieve({ filter, page, startingFrom });
                let success: boolean = await this.processReviews(reviews);
                if (!success) { return; }
            }
            await this.completeTask();
        } catch (error) {
            this.emit("db:error", error);
        }
    }

    /**
     * Processes the users of all reviews.
     *
     * @async
     * @param reviews   Review List.
     * @returns if successfull processing.
     */
    private async processReviews(reviews: IReviewEntity[]): Promise<boolean> {
        for (let i: number = 0; i < reviews.length; i++) {
            const review: IReviewEntity = reviews[i];
            try {
                await this.process(review.document.user.login, review.id);
            } catch (error) {
                return false;
            }
        }
        return true;
    }

}