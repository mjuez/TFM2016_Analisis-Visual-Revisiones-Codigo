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
import { IRepositories } from "../data/IRepositories";
import { IServices } from "./IServices";

/**
 * TaskManager error interface.
 * 
 * @author Mario Juez Gil <mario[at]mjuez.com
 */
interface TaskManagerError {
    
    /** Error code. */
    code: number,

    /** Error message. */
    message: Object

    /** Continue date. */
    continue_at: Date

}

/**
 * Task manager service interface.
 * Describes the task managing services.
 * Currently uses FIFO task scheduling.
 * 
 * @author Mario Juez <mario[at]mjuez.com> 
 */
export interface ITaskManagerService {

    /** Current task. */
    currentTask: ITask;

    /** Task manager error. */
    error: TaskManagerError;

    /**
     * Gets a list of pending tasks.
     * 
     * @param page  optional page number
     * @returns a list of pending tasks.
     */
    getPendingTasks(page?: number): Promise<ITaskEntity[]>;

    /**
     * Gets a list of all tasks.
     * 
     * @param page  optional page number
     * @returns a list of all tasks.
     */
    getAllTasks(page?: number): Promise<ITaskEntity[]>;

    /**
     * Creates a task.
     * A task is for retrieving all data about
     * pull requests, reviews, users, etc of a
     * specific GitHub repository.
     * 
     * @param owner         repository owner login.
     * @param repository    repository name.
     * @returns if the task was created successfully.
     */
    createTask(owner: string, repository: string): Promise<boolean>;

}

/**
 * Task manager service implementation.
 * 
 * @author Mario Juez <mario[at]mjuez.com> 
 */
export class TaskManagerService implements ITaskManagerService {

    /** Repositories list. */
    private readonly _repositories: IRepositories;

    /** Services list. */
    private readonly _services: IServices;

    /** Task factory. */
    private readonly _taskFactory: TaskFactory;

    /** The current task. */
    private _currentTask: ITask;

    /** Task manager error (if any). */
    private _error: TaskManagerError;

    /**
     * Task Manager creation.
     * 
     * @param repositories  Repository list dependency injection.
     * @param services      Services list dependency injection.
     */
    constructor(repositories: IRepositories, services: IServices) {
        this._repositories = repositories;
        this._services = services;
        this._taskFactory = new TaskFactory(repositories, services);
        this._currentTask = null;
        this.updateCurrentTask();
    }

    /**
     * Gets the current task.
     * 
     * @returns the current task.
     */
    public get currentTask(): ITask {
        return this._currentTask;
    }

    /**
     * Sets the current task.
     * 
     * @param task  new current task.
     */
    public set currentTask(task: ITask) {
        this._currentTask = task;
    }

    /**
     * Gets the task manager error (if any).
     * 
     * @returns task manager error.
     */
    public get error(): TaskManagerError {
        return this._error;
    }

    /**
     * Sets the task manager error.
     * 
     * @param error Task manager error.
     */
    public set error(error: TaskManagerError) {
        this._error = error;
    }

    /**
     * Gets a list of pending tasks.
     * 
     * @async
     * @param page  optional page number
     * @returns a list of pending tasks.
     */
    public async getPendingTasks(page: number = 1): Promise<ITaskEntity[]> {
        const repository: ITaskRepository = this._repositories.task;
        const filter: Object = { is_completed: false };
        return repository.retrieve({ filter, page });
    }

    /**
     * Gets a list of all tasks.
     * 
     * @async
     * @param page  optional page number
     * @returns a list of all tasks.
     */
    public async getAllTasks(page: number = 1): Promise<ITaskEntity[]> {
        const repository: ITaskRepository = this._repositories.task;
        return repository.retrieve({ page });
    }

    /**
     * Creates a task.
     * A task is for retrieving all data about
     * pull requests, reviews, users, etc of a
     * specific GitHub repository.
     * 
     * @async
     * @param owner         repository owner login.
     * @param repository    repository name.
     * @returns if the task was created successfully.
     */
    public async createTask(owner: string, repository: string): Promise<boolean> {
        const isPending: boolean = await this.isPending(owner, repository);
        if (isPending) return true;
        
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

    /**
     * Checks if the pair owner/repository is
     * in any pending task.
     * 
     * @async
     * @param owner         repository owner login.
     * @param repository    repository name.
     * @returns if is pending.
     */
    private async isPending(owner: string, repository: string): Promise<boolean> {
        const repo: ITaskRepository = this._repositories.task;
        const filter: Object = { owner, repository, is_completed: false };
        const pendingTasks: ITaskEntity[] = await repo.retrieve({ filter });
        return pendingTasks.length > 0;
    }

    /**
     * Saves a task and all related subtasks.
     * 
     * @async
     * @param owner         repository owner login.
     * @param repository    repository name.
     * @returns if the task and subtasks were saved correctly.
     */
    private async saveTaskAndSubTasks(owner: string, repository: string): Promise<boolean> {
        const taskEntity: ITaskEntity = TaskUtil.buildMainTaskEntity(owner, repository);
        try {
            const mainTask: ITask = await this._taskFactory.buildTask(taskEntity);
            const pullsTaskEntity: ITaskEntity = TaskUtil.buildSubTaskEntity(mainTask.entity, TaskType.PULL_REQUESTS);
            const reviewsTaskEntity: ITaskEntity = TaskUtil.buildSubTaskEntity(mainTask.entity, TaskType.REVIEWS);
            const reviewCommentsTaskEntity: ITaskEntity = TaskUtil.buildSubTaskEntity(mainTask.entity, TaskType.REVIEW_COMMENTS);
            const usersPullsTaskEntity: ITaskEntity = TaskUtil.buildSubTaskEntity(mainTask.entity, TaskType.USERS_PULLS);
            const usersReviewsTaskEntity: ITaskEntity = TaskUtil.buildSubTaskEntity(mainTask.entity, TaskType.USERS_REVIEWS);
            const usersReviewCommentsTaskEntity: ITaskEntity = TaskUtil.buildSubTaskEntity(mainTask.entity, TaskType.USERS_REVIEW_COMMENTS);
            const repositoryTaskEntity: ITaskEntity = TaskUtil.buildSubTaskEntity(mainTask.entity, TaskType.REPOSITORY);
            await this._taskFactory.buildTask(pullsTaskEntity);
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

    /**
     * Updates the current task.
     * Gets the next task (if any) and sets as current task.
     * 
     * @async
     */
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

    /**
     * Binds event listeners for
     * data base error, api error and task ending.
     */
    private bindEventListeners(): void {
        this.currentTask.on("db:error", this.handleDBError);
        this.currentTask.on("api:error", this.handleAPIError);
        this.currentTask.on("task:completed", this.updateCurrentTask);
    }

    /**
     * Handles a database error.
     * Stops the task manager and retries in one minute.
     * 
     * @param error Database error.
     */
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

    /**
     * Handles a GitHub API error.
     * If the error code is 404, the task is invalid,
     * it will be removed.
     * If the error code is 403, the API is unavailable
     * at this moment, we will retry in one minute.
     * If the error code is other (like rate limit exceed)
     * we will retry when the API tells to retry.
     * 
     * @param error API error.
     */
    private handleAPIError = (error): void => {
        console.log(error);
        if (error.code === 404) {
            this.removeWrongTask();
            this.updateCurrentTask();
        } else {
            let continue_at: Date;
            if (error.code === 403) {
                let milis: number = (<number>error.headers['x-ratelimit-reset']) * 1000;
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

    /**
     * Removes an invalid task (and subtasks)
     * from database.
     */
    private async removeWrongTask(): Promise<void> {
        let taskRepo: ITaskRepository = this._repositories.task;
        try {
            await taskRepo.remove({ _id: this.currentTask.entity.document._id });
            await taskRepo.remove({ parent: this.currentTask.entity.document._id });
        } catch (error) {
            this.handleDBError(error);
        }
    }

    /**
     * Handles any error.
     * It stops the task manager till the
     * continue date.
     */
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

    /**
     * Continues with task consumption.
     */
    private continue = (): void => {
        console.log(`[${new Date()}] - Continuing...`);
        this.removeError();
        this.updateCurrentTask();
    }

    /**
     * Removes the task manager error.
     */
    private removeError(): void {
        this.error = undefined;
    }
}