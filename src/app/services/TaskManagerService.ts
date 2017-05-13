import { IPersistenceService } from "../services/IPersistenceService";
import { ITaskEntity, TaskEntity } from "../entities/TaskEntity";
import { TaskType } from "../entities/enum/TaskType";
import { ITaskManagerEntity, TaskManagerEntity } from "../entities/TaskManagerEntity";
import { IPullRequestEntity, PullRequestEntity } from "../entities/PullRequestEntity";
import { IReviewEntity, ReviewEntity } from "../entities/ReviewEntity";
import { TaskManagerDocument, TaskManagerError } from "../entities/documents/TaskManagerDocument";
import { TaskDocument } from "../entities/documents/TaskDocument";
import { ITaskManagerRepository, TaskManagerRepository } from "../data/TaskManagerRepository";
import { ITaskRepository, TaskRepository } from "../data/TaskRepository";
import { PullRequestRepository } from "../data/PullRequestRepository";
import { IApiService } from "./IApiService";
import { GitHubService } from "./GitHubService";
import { GitHubUtil } from "../util/GitHubUtil";
import { TaskUtil } from "../util/TaskUtil";
import { IPullRequestService, PullRequestService } from "./PullRequestService";
import { IReviewService, ReviewService } from "./ReviewService";
import * as GitHubAPI from "github";

/**
 * ITaskManagerService interface.
 * Describes specific functionality for Task Manager entity.
 * @author Mario Juez <mario@mjuez.com> 
 */
export interface ITaskManagerService extends IPersistenceService<ITaskManagerEntity>, IApiService<GitHubAPI> {

    ready: boolean;
    currentTask: ITaskEntity;
    error: TaskManagerError;
    taskManager: ITaskManagerEntity;
    getPendingTasks(): Promise<ITaskEntity[]>;
    getAllTasks(): Promise<ITaskEntity[]>;
    createTask(owner: string, repository: string): Promise<boolean>;

}

/**
 * Task manager services.
 * @author Mario Juez <mario@mjuez.com>
 */
export class TaskManagerService extends GitHubService implements ITaskManagerService {

    private _ready: boolean;

    private _taskManagerEntity: ITaskManagerEntity;

    /** Task manager repository. */
    private readonly _repository: ITaskManagerRepository;

    private readonly _taskRepository: ITaskRepository;

    private readonly _pullRequestService: IPullRequestService;

    private readonly _reviewService: IReviewService;

    /**
     * Class constructor
     */
    constructor(
        repositories: {
            taskManager: ITaskManagerRepository;
            task: ITaskRepository;
        },
        services: {
            pullRequest: IPullRequestService;
            review: IReviewService;
            //userService: IUserService;
            //repositoryService: IRepositoryService;
        }) {
        super();
        this._ready = false;
        this._repository = repositories.taskManager;
        this._taskRepository = repositories.task;
        this._pullRequestService = services.pullRequest;
        this._reviewService = services.review;
        this.bindEventListeners();
        this.initialize();
    }

    private initialize = async () => {
        try {
            let entity: ITaskManagerEntity = await this._repository.find();
            if (entity) {
                this._taskManagerEntity = entity;
            } else {
                this._taskManagerEntity = this.emptyTaskManagerEntity;
                await this.persist();
            }
            this.start();
            this._ready = true;
            this.emit("taskManager:ready");
        } catch (dbError) {
            console.log(dbError);
            this.emit("taskManager:initerror", dbError);
            // retry after 5 seconds.
            setTimeout(this.initialize, 5000);
        }
    }

    get taskManager(): ITaskManagerEntity {
        return this._taskManagerEntity;
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
    }

    get error(): TaskManagerError {
        return this._taskManagerEntity.error;
    }

    set error(error: TaskManagerError) {
        this._taskManagerEntity.error = error;
    }

    private removeError(): void {
        delete this._taskManagerEntity.error;
        delete this.error;
    }

    public async createOrUpdate(entity: ITaskManagerEntity): Promise<ITaskManagerEntity> {
        let repository: ITaskManagerRepository = this._repository;
        let foundEntity: ITaskManagerEntity = await repository.find();
        if (foundEntity != null) {
            try {
                await repository.update(entity);
                return entity;
            } catch (error) {
                throw error;
            }
        } else {
            try {
                return await repository.create(entity);
            } catch (error) {
                throw error;
            }
        }
    }

    private async createOrUpdateTask(entity: ITaskEntity): Promise<ITaskEntity> {
        let repository: ITaskRepository = this._taskRepository;
        let foundEntity: ITaskEntity = await repository.findById(entity.document._id);
        if (foundEntity != null) {
            try {
                await repository.update(entity);
                return entity;
            } catch (error) {
                throw error;
            }
        } else {
            try {
                return await repository.create(entity);
            } catch (error) {
                throw error;
            }
        }
    }

    public async getPendingTasks(): Promise<ITaskEntity[]> {
        let repository: ITaskRepository = this._taskRepository;
        return repository.retrieve({ is_completed: false });
    }

    public async getAllTasks(): Promise<ITaskEntity[]> {
        let repository: ITaskRepository = this._taskRepository;
        return repository.retrieve();
    }

    public async createTask(owner: string, repository: string): Promise<boolean> {
        let taskEntity: ITaskEntity = TaskUtil.buildMainTask(owner, repository);
        let persisted: ITaskEntity = await this.persistTask(taskEntity);
        if (persisted) {
            // MUST TAKE CARE WITH SUBTASK CORRECT CREATION!
            this.createSubTask(persisted, TaskType.REVIEWS);
            //this.createSubTask(persisted, TaskType.REVIEW_COMMENTS);
            //this.createSubTask(persisted, TaskType.USERS);
            //this.createSubTask(persisted, TaskType.REPOSITORY);
            this.emit("task:created");
            return true;
        }

        return false;
    }

    private async createSubTask(parent: ITaskEntity, type: TaskType): Promise<boolean> {
        let subTask: ITaskEntity = TaskUtil.buildSubTask(parent, type);
        let persisted: ITaskEntity = await this.persistTask(subTask);
        if (persisted) return true;
        return false;
    }

    private handleError() {
        if (this.hasError()) {
            console.log(`[${new Date()}] - error: ${this.error.code}`);
            let date: Date = new Date();
            let continueDate: Date = new Date(this.error.continue_at * 1000);
            console.log(continueDate);
            let difference: number = continueDate.getTime() - date.getTime();
            console.log(difference);
            if (difference > 0) {
                console.log(`Going to retry on: ${continueDate}`);
                setTimeout(this.continue, difference);
            }
        }
    }

    private start(): void {
        if (this.currentTask) {
            this.runCurrentTask();
        } else if (this.hasError()) {
            this.handleError();
        } else {
            this.updateCurrentTask();
        }
    }

    private continue = () => {
        console.log(`[${new Date()}] - Continuing...`);
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

    private onTaskFinished = async () => {
        this.currentTask = null;
        await this.persist();
        this.updateCurrentTask();
    }

    private onTaskStopped = () => {
        this.handleError();
    }

    private onTaskCreated = () => {
        if (this.isWaitingForTasks()) {
            this.updateCurrentTask();
        }
    }

    private onTaskUpdated = async () => {
        await this.persist();
        this.runCurrentTask();
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
        if (currentTask.type === TaskType.ALL) {
            this.makeAllApiCall();
        } else if (currentTask.type === TaskType.REVIEWS) {
            this.runReviewsTask();
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
        page.reviews = 0; //pff
        let pullRequests: IPullRequestEntity[] = PullRequestEntity.toEntityArray(page.data);
        console.log(`[${new Date()}] - Getting page ${this.currentTask.currentPage}, remaining reqs: ${page.meta['x-ratelimit-remaining']}`);
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

    private async runReviewsTask(): Promise<void> {
        console.log("running review task");
        let service: IPullRequestService = this._pullRequestService;
        let pullRequests: IPullRequestEntity[] = await service.getLocalPullRequests(
            this.currentTask.owner, this.currentTask.repository, this.currentTask.lastProcessed);
        for (let i: number = 0; i < pullRequests.length; i++) {
            try {
                let pullRequest: IPullRequestEntity = pullRequests[i];
                await this.makeReviewsApiCall(pullRequest);
                this.currentTask.currentPage = 1;
                this.currentTask.lastProcessed = pullRequest.document.number;
                await this.persistTask(this.currentTask);
            } catch (error) {
                return;
            }
        }
        this.completeCurrentTask();
    }

    private async makeReviewsApiCall(pullRequest: IPullRequestEntity): Promise<void> {
        let api: GitHubAPI = this.API;
        let currentTask: ITaskEntity = this.currentTask;
        try {
            let page: any = await api.pullRequests.getReviews(<GitHubAPI.PullRequestsGetReviewsParams>{
                owner: currentTask.owner,
                repo: currentTask.repository,
                number: pullRequest.document.number,
                per_page: 100,
                direction: `asc`,
                page: currentTask.currentPage
            });
            this.processReviewsPage(page, pullRequest);
        } catch (error) {
            this.handleApiError(error);
        }
    }

    private async processReviewsPage(page: any, pullRequest: IPullRequestEntity): Promise<void> {
        let api: GitHubAPI = this.API;
        let reviews: IReviewEntity[] = ReviewEntity.toEntityArray(page.data, pullRequest.id);
        console.log(`[${new Date()}] - Getting page ${this.currentTask.currentPage}, remaining reqs: ${page.meta['x-ratelimit-remaining']}`);
        try {
            await this._reviewService.createOrUpdateMultiple(reviews);
            if (api.hasNextPage(page)) {
                let links: string = page.meta.link;
                let nextPage: number = GitHubUtil.getNextPageNumber(links);
                this.currentTask.currentPage = nextPage;
                let persisted: ITaskEntity = await this.persistTask(this.currentTask);
                if (persisted) {
                    try {
                        let nextPage: any = await api.getNextPage(page);
                        this.processReviewsPage(nextPage, pullRequest);
                    } catch (error) {
                        this.handleApiError(error);
                        throw error;
                    }
                } else {
                    this.emit("task:stopped");
                    throw new Error();
                }
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
        console.log("completing task...");
        this.currentTask.isCompleted = true;
        this.currentTask.endDate = new Date();
        await this.persistTask(this.currentTask);
        this.emit("task:finished");
    }

    private async updateCurrentTask(): Promise<void> {
        console.log("updating task...");
        try {
            let nextTask: ITaskEntity = await this._taskRepository.findNext();
            if (nextTask) {
                this.currentTask = nextTask;
                this.emit("task:updated");
            } else {
                console.log("no task...");
            }
        } catch (error) {
            this.emit("taskManager:dberror", error);
        }
    }

    private async persist(): Promise<boolean> {
        try {
            this._taskManagerEntity = await this.createOrUpdate(this._taskManagerEntity);
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

}