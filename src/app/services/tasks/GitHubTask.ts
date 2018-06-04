import { ITask } from "./ITask";
import { ITaskEntity } from "../../entities/TaskEntity";
import { ITaskRepository } from "../../data/TaskRepository";
import * as GitHubAPI from "@octokit/rest";
import * as BluebirdPromise from "bluebird";
import * as Events from "events";

/**
 * Abstract Task which implements shared functionality
 * for those tasks that obtains data from GitHub API.
 *
 * @author Mario Juez <mario[at]mjuez.com>
 */
export abstract class GitHubTask extends Events.EventEmitter implements ITask {

    /** GitHub API wrapper. */
    private readonly _api: GitHubAPI;

    /** Task entity. */
    private _entity: ITaskEntity;

    /** Task repository. */
    private readonly _repository: ITaskRepository;

    /** GitHub API wrapper options. */
    private static readonly _API_OPTIONS: Object = {
        debug: false,
        protocol: "https",
        host: `api.github.com`,
        pathPrefix: ``,
        headers: {
            "user-agent": process.env.ANVIRECO_APPNAME
        },
        Promise: BluebirdPromise,
        followRedirects: false,
        timeout: 5000
    };

    /** GitHub API authentication (using developer applications) */
    private static readonly _API_AUTHENTICATION: GitHubAPI.Auth = <GitHubAPI.AuthOAuthSecret>{
        type: `oauth`,
        key: process.env.ANVIRECO_ID,
        secret: process.env.ANVIRECO_SECRET
    };

    /**
     * Creates the API wrapper and authenticates to it.
     *
     * @param api       optional GitHub API wrapper dependency injection.
     * @param apiAuth   optional GitHub API authorization.
     */
    constructor(repository: ITaskRepository,
        api: GitHubAPI = new GitHubAPI(GitHubTask._API_OPTIONS),
        apiAuth: GitHubAPI.Auth = GitHubTask._API_AUTHENTICATION) {
        super();
        this._repository = repository;
        this._api = api;
        this._api.authenticate(apiAuth);
    }

    /**
     * Gets the GitHub API wrapper.
     *
     * @returns GitHub API wrapper.
     */
    public get API(): GitHubAPI {
        return this._api;
    }

    /**
     * Gets the task entity.
     *
     * @returns task entity.
     */
    public get entity(): ITaskEntity {
        return this._entity;
    }

    /**
     * Sets the task entity.
     * Setting the entity implies persisting it.
     *
     * @async
     * @param entity    task entity.
     */
    public async setEntity(entity: ITaskEntity): Promise<void> {
        this._entity = entity;
        try {
            await this.persist();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Persists the task.
     *
     * @async
     */
    public async persist(): Promise<void> {
        try {
            let foundEntity: ITaskEntity = await this._repository.findById(this._entity.document._id);
            if (foundEntity != null) {
                await this._repository.update(this._entity);
            } else {
                this._entity = await this._repository.create(this._entity);
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * Updates the current page of the task.
     *
     * @async
     * @param pageNumber    new current page.
     */
    public updateCurrentPage = async (pageNumber: number) => {
        this.entity.currentPage = pageNumber;
        await this.persist();
    }

    /**
     * Starting a task is setting the start date to now.
     *
     * @async
     */
    protected async startTask(): Promise<void> {
        console.log(`Starting task of type ${this.entity.type}...`);
        if (this.entity.startDate === null) {
            this.entity.startDate = new Date();
            try {
                await this.persist();
            } catch (error) {
                throw error;
            }
        }
    }

    /**
     * Completes the task.
     * Sets the ending date and isCompleted to true.
     * Also emits a task:completed event.
     *
     * @async
     */
    protected async completeTask(): Promise<void> {
        this.entity.endDate = new Date();
        this.entity.isCompleted = true;
        try {
            await this.persist();
            this.emit("task:completed");
        } catch (error) {
            throw error;
        }
    }

    /**
     * Emits an error event.
     * It emits two types of error: API error,
     * and database error.
     *
     * @param error the error object.
     */
    protected emitError = (error: any): void => {
        const isApiError: boolean = "code" in error;
        if (isApiError) {
            this.emit("api:error", error);
        } else {
            this.emit("db:error", error);
        }
    }

    /**
     * Runs the task.
     *
     * @async
     */
    public abstract async run(): Promise<void>;

}