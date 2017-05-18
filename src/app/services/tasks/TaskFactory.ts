import { ITask } from "./ITask";
import { IMainTask, MainTask } from "./MainTask";
import { IReviewsTask, ReviewsTask } from "./ReviewsTask";
import { IReviewCommentsTask, ReviewCommentsTask } from "./ReviewCommentsTask";
import { IUsersPullsTask, UsersPullsTask } from "./UsersPullsTask";
import { IUsersReviewCommentsTask, UsersReviewCommentsTask } from "./UsersReviewCommentsTask";
import { IUsersReviewsTask, UsersReviewsTask } from "./UsersReviewsTask";
import { IRepositoryTask, RepositoryTask } from "./RepositoryTask";
import { ITaskEntity } from "../../entities/TaskEntity";
import { TaskType } from "../../entities/enum/TaskType";
import { IPullRequestRepository } from "../../data/PullRequestRepository";
import { IReviewRepository } from "../../data/ReviewRepository";
import { IReviewCommentRepository } from "../../data/ReviewCommentRepository";
import { IUserRepository } from "../../data/UserRepository";
import { IRepositoryRepository } from "../../data/RepositoryRepository";
import { ITaskRepository } from "../../data/TaskRepository";
import { IPullRequestService } from "../../services/PullRequestService";
import { IReviewService } from "../../services/ReviewService";
import { IReviewCommentService } from "../../services/ReviewCommentService";
import { IUserService } from "../../services/UserService";
import { IRepositoryService } from "../../services/RepositoryService";

interface Repositories {
    pull: IPullRequestRepository,
    review: IReviewRepository,
    reviewComment: IReviewCommentRepository,
    user: IUserRepository,
    repo: IRepositoryRepository,
    task: ITaskRepository
}

interface Services {
    pull: IPullRequestService,
    review: IReviewService,
    reviewComment: IReviewCommentService,
    user: IUserService,
    repo: IRepositoryService
}

export class TaskFactory {

    private readonly _repositories: Repositories;

    private readonly _services: Services;
    
    constructor(repositories: Repositories, services: Services){
        this._repositories = repositories;
        this._services = services;
    }

    public buildTask(entity: ITaskEntity): ITask {
        let task: ITask = null;

        if(entity.type === TaskType.ALL){
            task = new MainTask(entity, this._repositories, this._services.pull);
        }else if(entity.type === TaskType.REPOSITORY){
            task = new RepositoryTask(entity, this._repositories, this._services.repo);
        }else if(entity.type === TaskType.REVIEW_COMMENTS){
            task = new ReviewCommentsTask(entity, this._repositories, this._services.reviewComment);
        }else if(entity.type === TaskType.REVIEWS){
            task = new ReviewsTask(entity, this._repositories, this._services.review);
        }else if(entity.type === TaskType.USERS_PULLS){
            task = new UsersPullsTask(entity, this._repositories, this._services.user);
        }else if(entity.type === TaskType.USERS_REVIEW_COMMENTS){
            task = new UsersReviewCommentsTask(entity, this._repositories, this._services.user);
        }else if(entity.type === TaskType.USERS_REVIEWS){
            task = new UsersReviewsTask(entity, this._repositories, this._services.user);
        }

        return task;
    }

}