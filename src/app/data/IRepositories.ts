import { IPullRequestRepository } from "./PullRequestRepository";
import { IReviewRepository } from "./ReviewRepository";
import { IReviewCommentRepository } from "./ReviewCommentRepository";
import { IUserRepository } from "./UserRepository";
import { IRepositoryRepository } from "./RepositoryRepository";
import { ITaskRepository } from "./TaskRepository";

/**
 * Interface with different repositories list.
 * Useful for dependency injection.
 * 
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IRepositories {

    /** Pull Request Repository. */
    pull: IPullRequestRepository,

    /** Review Repository. */
    review: IReviewRepository,

    /** Review Comment Repository. */
    reviewComment: IReviewCommentRepository,

    /** User Repository. */
    user: IUserRepository,

    /** GitHub Repository Repository. */
    repo: IRepositoryRepository,

    /** Task Repository. */
    task: ITaskRepository

}