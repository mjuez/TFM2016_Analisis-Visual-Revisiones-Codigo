 import { IPersistenceService } from "../services/IPersistenceService";
import { ITaskEntity, TaskEntity } from "../entities/TaskEntity";
import { TaskType } from "../entities/enum/TaskType";
import { ITaskManagerEntity, TaskManagerEntity } from "../entities/TaskManagerEntity";
import { IPullRequestEntity, PullRequestEntity } from "../entities/PullRequestEntity";
import { TaskManagerDocument, TaskManagerError } from "../entities/documents/TaskManagerDocument";
import { TaskDocument } from "../entities/documents/TaskDocument";
import { ITaskManagerRepository, TaskManagerRepository } from "../data/TaskManagerRepository";
import { ITaskRepository, TaskRepository } from "../data/TaskRepository";
import { PullRequestRepository } from "../data/PullRequestRepository";
import { IApiService } from "./IApiService";
import { GitHubService } from "./GitHubService";
import { GitHubUtil } from "../util/GitHubUtil";
import { IPullRequestService, PullRequestService } from "./PullRequestService";
import * as GitHubAPI from "github";
import * as BluebirdPromise from "bluebird";

/**
 * ITaskManagerService interface.
 * Describes specific functionality for Task Manager entity.
 * @author Mario Juez <mario@mjuez.com> 
 */
export interface ITaskManagerService extends IPersistenceService<ITaskManagerEntity>, IApiService<GitHubAPI> {

    ready: boolean;
    currentTask: ITaskEntity;
    error: TaskManagerError;
    getPendingTasks(): BluebirdPromise<ITaskEntity[]>;
    getAllTasks(): BluebirdPromise<ITaskEntity[]>;
    createTask(owner: string, repository: string): Promise<boolean>;

}

/**
 * Task manager services. Is a singleton.
 * @author Mario Juez <mario@mjuez.com>
 */
export class TaskManagerService extends GitHubService implements ITaskManagerService {

    private _ready: boolean;

    private static _instance: ITaskManagerService = null;

    private _taskManagerEntity: ITaskManagerEntity;

    /** Task manager repository. */
    private readonly _repository: ITaskManagerRepository;

    private readonly _taskRepository: ITaskRepository;

    private readonly _pullRequestService: IPullRequestService;

    /**
     * Class constructor
     */
    private constructor() {
        super();
        this._ready = false;
        this._repository = new TaskManagerRepository();
        this._taskRepository = new TaskRepository();
        this._pullRequestService = new PullRequestService(new PullRequestRepository());
        this.bindEventListeners();
        this.initialize();
    }

    private initialize = () => {
        this._repository.find().then((taskManagerEntity) => {
            if (taskManagerEntity) {
                this._taskManagerEntity = taskManagerEntity;
            } else {
                this._taskManagerEntity = this.emptyTaskManagerEntity;
                this.persist();
            }
            this.start();
            this._ready = true;
            this.emit("taskManager:ready");
        }).catch((dbError) => {
            console.log(dbError);
            this.emit("taskManager:initerror", dbError);
            // retry after 5 seconds.
            setTimeout(this.initialize, 5000);
        });
    }

    get emptyTaskManagerEntity(): ITaskManagerEntity {
        let document: TaskManagerDocument = <TaskManagerDocument>{
            current_task: null
        }
        return new TaskManagerEntity(document);
    }

    get ready(): boolean {
        return this._ready;
    }

    get currentTask(): ITaskEntity {
        return this._taskManagerEntity.currentTask;
    }

    set currentTask(task: ITaskEntity) {
        this._taskManagerEntity.currentTask = task;
        this.persist();
    }

    get error(): TaskManagerError {
        return this._taskManagerEntity.error;
    }

    set error(error: TaskManagerError){
        this._taskManagerEntity.error = error;
    }

    private removeError(): void {
        delete this._taskManagerEntity.error;
        delete this.error;
    }

    public createOrUpdate(entity: ITaskManagerEntity): BluebirdPromise<ITaskManagerEntity> {
        let repository: ITaskManagerRepository = this._repository;

        let promise: BluebirdPromise<ITaskManagerEntity> = new BluebirdPromise<ITaskManagerEntity>((resolve, reject) => {
            repository.find().then((foundEntity) => {
                if (foundEntity) {
                    repository.update(entity).then((rowsAffected) => {
                        resolve(entity);
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    repository.create(entity).then((result) => {
                        resolve(result);
                    }).catch((error) => {
                        reject(error);
                    });
                }
            }).catch((error) => {
                reject(error);
            });
        });

        return promise;
    }

    private createOrUpdateTask(entity: ITaskEntity): BluebirdPromise<ITaskEntity> {
        let repository: ITaskRepository = this._taskRepository;

        let promise: BluebirdPromise<ITaskEntity> = new BluebirdPromise<ITaskEntity>((resolve, reject) => {
            repository.findById(entity.document._id).then((foundEntity) => {
                if (foundEntity) {
                    repository.update(entity).then((rowsAffected) => {
                        resolve(entity);
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    repository.create(entity).then((result) => {
                        resolve(result);
                    }).catch((error) => {
                        reject(error);
                    });
                }
            }).catch((error) => {
                reject(error);
            });
        });

        return promise;
    }

    public getPendingTasks(): BluebirdPromise<ITaskEntity[]> {
        let repository: ITaskRepository = this._taskRepository;
        return repository.retrieve({ is_completed: false });
    }

    public getAllTasks(): BluebirdPromise<ITaskEntity[]> {
        let repository: ITaskRepository = this._taskRepository;
        return repository.retrieve();
    }

    public async createTask(owner: string, repository: string): Promise<boolean> {
        let document: TaskDocument = <TaskDocument>{
            type: TaskType.ALL,
            is_completed: false,
            creation_date: new Date(),
            start_date: null,
            end_date: null,
            owner: owner,
            repository: repository,
            current_page: 1
        };
        let taskEntity: ITaskEntity = new TaskEntity(document);
        let persisted: ITaskEntity = await this.persistTask(taskEntity);
        if (persisted) {
            this.emit("task:created", persisted);
            return true;
        }

        return false;
    }

    private handleError() {
        if (this.hasError()) {
            let date: Date = new Date();
            let continueDate: Date = new Date(this.error.continue_at);
            let difference: number = continueDate.getTime() - date.getTime();
            if (difference > 0) {
                setTimeout(this.continue, difference);
            }
        }
    }

    private start(): void {
        console.log("starting");
        if (this.currentTask) {
            this.runCurrentTask();
        } else if (this.hasError()) {
            this.handleError();
        } else {
            this.updateCurrentTask();
        }
    }

    private continue = () => {
        this.removeError();
        this.persist();
        if (this.currentTask) {
            this.runCurrentTask();
        }
    }

    private bindEventListeners(): void {
        this.on("task:finished", this.onTaskFinished);
        this.on("task:stopped", this.onTaskStopped);
        this.on("task:created", this.onTaskCreated);
        this.on("task:updated", this.onTaskUpdated);
        this.on("taskManager:dberror", this.onDbError);
    }

    private onTaskFinished = () => {
        this.currentTask = null;
        this.persist();
        this.updateCurrentTask();
    }

    private onTaskStopped = () => {
        this.handleError();
    }

    private onTaskCreated = (taskEntity: ITaskEntity) => {
        if (this.isWaitingForTasks()) {
            this.currentTask = taskEntity;
            this.runCurrentTask();
            this.persist();
        }
    }

    private onTaskUpdated = () => {
        this.persist();
    }

    private onDbError = (dbError) => {
        console.log(dbError);
        let date: Date = new Date();
        date.setMinutes(date.getMinutes() + 1);
        this.error = {
            code: 503,
            message: dbError,
            continue_at: date.getTime()
        }
        this.handleError();
    }

    private isWaitingForTasks(): boolean {
        return !this.currentTask && !this.hasError();
    }

    private hasError(): boolean {
        return this._taskManagerEntity.error != undefined;
    }

    private async runCurrentTask(): Promise<void> {
        let currentTask: ITaskEntity = this.currentTask;
        if (!currentTask.startDate) {
            currentTask.startDate = new Date();
            let persisted: ITaskEntity = await this.persistTask(currentTask);
            if (!persisted) return;
        }
        console.log(currentTask);
        if (currentTask.type === TaskType.ALL) {
            this.makeAllApiCall();
        }
    }

    private makeAllApiCall(): void {
        let api: GitHubAPI = this.API;
        let currentTask: ITaskEntity = this.currentTask;
        api.pullRequests.getAll(<GitHubAPI.PullRequestsGetAllParams>{
            owner: currentTask.owner,
            repo: currentTask.repository,
            state: `all`,
            per_page: 100,
            direction: `asc`,
            page: currentTask.currentPage
        }).then((page) => {
            this.processPullRequestPage(page);
        }).catch((apiError) => {
            this.handleApiError(apiError);
        });
    }

    private async processPullRequestPage(page: any): Promise<void> {
        let api: GitHubAPI = this.API;
        let pullRequests: IPullRequestEntity[] = PullRequestEntity.toEntityArray(page.data);
        try {
            await this._pullRequestService.createOrUpdateMultiple(pullRequests);
            if (api.hasNextPage(page)) {
                let links: string = page.meta.link;
                let nextPage: number = GitHubUtil.getNextPageNumber(links);
                this.currentTask.currentPage = nextPage;
                let persisted: ITaskEntity = await this.persistTask(this.currentTask);
                if (persisted) {
                    api.getNextPage(page).then((nextPage) => {
                        this.processPullRequestPage(nextPage);
                    }).catch((apiError) => {
                        this.handleApiError(apiError);
                    });
                } else {
                    this.emit("task:stopped");
                }
            } else {
                this.completeCurrentTask();
            }
        } catch (dbError) {
            this.emit("taskManager:dberror", dbError);
            this.emit("task:stopped");
        }
    }

    private handleApiError(apiError: any): void {
        this.error = {
            code: apiError.code,
            message: apiError.message,
            continue_at: null
        }
        if (apiError.code === 403) {
            this.error.continue_at = apiError.headers['x-ratelimit-reset'];
        } else {
            let date: Date = new Date();
            date.setMinutes(date.getMinutes() + 1);
            this.error.continue_at = date.getTime();
        }
        this.persist();
        this.emit("task:stopped");
    }

    private async completeCurrentTask(): Promise<void> {
        this.currentTask.isCompleted = true;
        this.currentTask.endDate = new Date();
        await this.persistTask(this.currentTask);
        this.emit("task:finished");
    }

    private async updateCurrentTask(): Promise<void> {
        try {
            let nextTask: ITaskEntity = await this._taskRepository.findNext();
            if (nextTask) {
                this.currentTask = nextTask;
                await this.persist();
                this.emit("task:updated");
            }
        } catch (error) {
            this.emit("taskManager:dberror", error);
        }
    }

    private async persist(): Promise<boolean> {
        try {
            await this.createOrUpdate(this._taskManagerEntity);
            return true;
        } catch (error) {
            this.emit("taskManager:dberror", error);
        }
        return false;
    }

    private async persistTask(taskEntity: ITaskEntity): Promise<ITaskEntity> {
        try {
            return await this.createOrUpdateTask(taskEntity);
        } catch (error) {
            this.emit("taskManager:dberror", error);
        }
        return null;
    }

    public static getInstance(): ITaskManagerService {
        if (this._instance === null) {
            this._instance = new TaskManagerService();
        }
        return this._instance;
    }


}