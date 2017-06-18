import { ITask } from "./ITask";
import { IMainTask, MainTask } from "./MainTask";
import { IPullRequestsTask, PullRequestsTask } from "./PullRequestsTask";
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
import { IServices } from "../IServices";
import { IRepositories } from "../../data/IRepositories";
import { IUserTaskUtil, UserTaskUtil } from "../../util/UserTaskUtil";

export class TaskFactory {

    private readonly _repositories: IRepositories;

    private readonly _services: IServices;

    constructor(repositories: IRepositories, services: IServices) {
        this._repositories = repositories;
        this._services = services;
    }

    public async buildTask(entity: ITaskEntity): Promise<ITask> {
        let task: ITask = null;

        if (entity.type === TaskType.ALL) {
            task = new MainTask(this._repositories, this._services.pull);
        } else if (entity.type === TaskType.PULL_REQUESTS) {
            task = new PullRequestsTask(this._repositories, this._services.pull);
        } else if (entity.type === TaskType.REPOSITORY) {
            task = new RepositoryTask(this._repositories, this._services.repo);
        } else if (entity.type === TaskType.REVIEW_COMMENTS) {
            task = new ReviewCommentsTask(this._repositories, this._services.reviewComment);
        } else if (entity.type === TaskType.REVIEWS) {
            task = new ReviewsTask(this._repositories, this._services.review);
        } else {
            const userTaskUtil: IUserTaskUtil = new UserTaskUtil(this._repositories, this._services.user);

            if (entity.type === TaskType.USERS_PULLS) {
                task = new UsersPullsTask(this._repositories, this._services.user, userTaskUtil);
            } else if (entity.type === TaskType.USERS_REVIEW_COMMENTS) {
                task = new UsersReviewCommentsTask(this._repositories, this._services.user, userTaskUtil);
            } else if (entity.type === TaskType.USERS_REVIEWS) {
                task = new UsersReviewsTask(this._repositories, this._services.user, userTaskUtil);
            }
        }

        try {
            await task.setEntity(entity);
            return task;
        } catch (error) {
            throw error;
        }
    }

}