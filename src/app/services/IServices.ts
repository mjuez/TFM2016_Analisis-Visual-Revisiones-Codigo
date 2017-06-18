import { IPullRequestService } from "./PullRequestService";
import { IReviewService } from "./ReviewService";
import { IReviewCommentService } from "./ReviewCommentService";
import { IUserService } from "./UserService";
import { IRepositoryService } from "./RepositoryService";
import { ITaskManagerService } from "./TaskManagerService";
import { IStatsService } from "./StatsService";

/**
 * Interface with different services list.
 * Useful for dependency injection.
 * 
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IServices {

    /** Pull Request Service. */
    pull: IPullRequestService,

    /** Review Service. */
    review: IReviewService,

    /** Review Comment Service. */
    reviewComment: IReviewCommentService,

    /** User Service. */
    user: IUserService,

    /** GitHub Repository Service. */
    repo: IRepositoryService,

    /** Task Manager Service. */
    taskManager: ITaskManagerService,

    /** Stats Service. */
    stats: IStatsService
    
}