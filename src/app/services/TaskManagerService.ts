import { ITaskEntity, TaskEntity } from "../entities/TaskEntity";
import { TaskType } from "../entities/enum/TaskType";
import { TaskDocument } from "../entities/documents/TaskDocument";
import { IPullRequestRepository } from "../data/PullRequestRepository";
import { IReviewRepository } from "../data/ReviewRepository";
import { IReviewCommentRepository } from "../data/ReviewCommentRepository";
import { IUserRepository } from "../data/UserRepository";
import { IRepositoryRepository } from "../data/RepositoryRepository";
import { ITaskRepository } from "../data/TaskRepository";
import { IPullRequestService } from "./PullRequestService";
import { IReviewService } from "./ReviewService";
import { IReviewCommentService } from "./ReviewCommentService";
import { IUserService } from "./UserService";
import { IRepositoryService } from "./RepositoryService";
import { ITask } from "./tasks/ITask";
import { TaskFactory } from "./tasks/TaskFactory";
import { TaskUtil } from "../util/TaskUtil";
import { GitHubUtil } from "../util/GitHubUtil";

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

interface TaskManagerError {
    code: number,
    message: Object
    continue_at: Date
}

/**
 * ITaskManagerService interface.
 * Describes specific functionality for Task Manager entity.
 * @author Mario Juez <mario@mjuez.com> 
 */
export interface ITaskManagerService {

    currentTask: ITask;
    error: TaskManagerError;
    getPendingTasks(page?: number): Promise<ITaskEntity[]>;
    getAllTasks(page?: number): Promise<ITaskEntity[]>;
    createTask(owner: string, repository: string): Promise<boolean>;

}

/**
 * Task manager services.
 * @author Mario Juez <mario@mjuez.com>
 */
export class TaskManagerService implements ITaskManagerService {

    private readonly _repositories: Repositories;

    private readonly _services: Services;

    private readonly _taskFactory: TaskFactory;

    private _currentTask: ITask;

    private _error: TaskManagerError;

    /**
     * Class constructor
     */
    constructor(repositories: Repositories, services: Services) {
        this._repositories = repositories;
        this._services = services;
        this._taskFactory = new TaskFactory(repositories, services);
        this._currentTask = null;
        this.updateCurrentTask();
    }

    public get currentTask(): ITask {
        return this._currentTask;
    }

    public set currentTask(task: ITask) {
        this._currentTask = task;
    }

    public get error(): TaskManagerError {
        return this._error;
    }

    public set error(error: TaskManagerError) {
        this._error = error;
    }

    public async getPendingTasks(page: number = 1): Promise<ITaskEntity[]> {
        let repository: ITaskRepository = this._repositories.task;
        return repository.retrievePartial({ is_completed: false }, page);
    }

    public async getAllTasks(page: number = 1): Promise<ITaskEntity[]> {
        let repository: ITaskRepository = this._repositories.task;
        return repository.retrievePartial({}, page);
    }

    public async createTask(owner: string, repository: string): Promise<boolean> {
        const exists: boolean = await GitHubUtil.checkRepository(owner, repository);
        if (exists) {
            const success: boolean = await this.saveTaskAndSubTasks(owner, repository);
            if (success && this.currentTask === null) {
                this.updateCurrentTask();
            }
            return success;
        }
        return false;
    }

    private async saveTaskAndSubTasks(owner: string, repository: string): Promise<boolean> {
        let taskEntity: ITaskEntity = TaskUtil.buildMainTaskEntity(owner, repository);
        try {
            let mainTask: ITask = await this._taskFactory.buildTask(taskEntity);
            let reviewsTaskEntity: ITaskEntity = TaskUtil.buildSubTaskEntity(mainTask.entity, TaskType.REVIEWS);
            let reviewCommentsTaskEntity: ITaskEntity = TaskUtil.buildSubTaskEntity(mainTask.entity, TaskType.REVIEW_COMMENTS);
            let usersPullsTaskEntity: ITaskEntity = TaskUtil.buildSubTaskEntity(mainTask.entity, TaskType.USERS_PULLS);
            let usersReviewsTaskEntity: ITaskEntity = TaskUtil.buildSubTaskEntity(mainTask.entity, TaskType.USERS_REVIEWS);
            let usersReviewCommentsTaskEntity: ITaskEntity = TaskUtil.buildSubTaskEntity(mainTask.entity, TaskType.USERS_REVIEW_COMMENTS);
            let repositoryTaskEntity: ITaskEntity = TaskUtil.buildSubTaskEntity(mainTask.entity, TaskType.REPOSITORY);
            await this._taskFactory.buildTask(reviewsTaskEntity);
            await this._taskFactory.buildTask(reviewCommentsTaskEntity);
            await this._taskFactory.buildTask(usersPullsTaskEntity);
            await this._taskFactory.buildTask(usersReviewsTaskEntity);
            await this._taskFactory.buildTask(usersReviewCommentsTaskEntity);
            await this._taskFactory.buildTask(repositoryTaskEntity);
            return true;
        } catch (error) {
            return false;
        }
    }

    private updateCurrentTask = async (): Promise<void> => {
        if (this.error === undefined) {
            console.log("updating task...");
            try {
                let nextTask: ITaskEntity = await this._repositories.task.findNext();
                if (nextTask) {
                    this.currentTask = await this._taskFactory.buildTask(nextTask);
                    this.bindEventListeners();
                    this.currentTask.run();
                } else {
                    this.currentTask = null;
                }
            } catch (error) {
                this.handleDBError(error);
            }
        }
    }

    private bindEventListeners(): void {
        this.currentTask.on("db:error", this.handleDBError);
        this.currentTask.on("api:error", this.handleAPIError);
        this.currentTask.on("task:completed", this.updateCurrentTask);
    }

    private handleDBError = (error): void => {
        console.log(error);
        let date: Date = new Date();
        date.setMinutes(date.getMinutes() + 1);
        this.error = {
            code: 503,
            message: error,
            continue_at: date
        }
        this.handleError();
    }

    private handleAPIError = (error): void => {
        console.log(error);
        if (error.code === 404) {
            this.removeWrongTask();
            this.updateCurrentTask();
        } else {
            let continue_at: Date;
            if (error.code === 403) {
                let milis: number = (<number>error.headers['x-ratelimit-reset'])*1000;
                continue_at = new Date(milis);
            } else {
                let date: Date = new Date();
                date.setMinutes(date.getMinutes() + 1);
                continue_at = date;
            }
            this.error = {
                code: error.code,
                message: error.message,
                continue_at: continue_at
            }
            this.handleError();
        }
    }

    private async removeWrongTask(): Promise<void> {
        let taskRepo: ITaskRepository = this._repositories.task;
        try {
            await taskRepo.remove({ _id: this.currentTask.entity.document._id });
            await taskRepo.remove({ parent: this.currentTask.entity.document._id });
        } catch (error) {
            this.handleDBError(error);
        }
    }

    private handleError(): void {
        this.currentTask = null;
        let currentDate: Date = new Date();
        let continueDate: Date = this.error.continue_at;
        let difference: number = continueDate.getTime() - currentDate.getTime() + 10;
        if (difference > 0) {
            console.log(`Going to retry on: ${continueDate}`);
            setTimeout(this.continue, difference);
        } else {
            this.continue();
        }
    }

    private continue = (): void => {
        console.log(`[${new Date()}] - Continuing...`);
        this.removeError();
        this.updateCurrentTask();
    }

    private removeError(): void {
        this.error = undefined;
    }
}