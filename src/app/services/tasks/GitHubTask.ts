import { ITask } from "./ITask";
import { ITaskEntity } from "../../entities/TaskEntity";
import { ITaskRepository } from "../../data/TaskRepository";
import * as GitHubAPI from "github";
import * as BluebirdPromise from "bluebird";
import * as Events from "events";

export abstract class GitHubTask extends Events.EventEmitter implements ITask {

    /** GitHub API wrapper. */
    private readonly _api: GitHubAPI;

    private _entity: ITaskEntity;

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

    /** Gets the GitHub API wrapper. */
    public get API(): GitHubAPI {
        return this._api;
    }

    public get entity(): ITaskEntity {
        return this._entity;
    }

    public async setEntity(entity: ITaskEntity): Promise<void> {
        this._entity = entity;
        try {
            await this.persist();
        } catch (error) {
            throw error;
        }
    }

    public abstract async run(): Promise<void>;

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

    protected async startTask(): Promise<void> {
        this.entity.startDate = new Date();
        try {
            await this.persist();
        } catch (error) {
            throw error;
        }
    }

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

    protected emitError = (error): void => {
        const isApiError: boolean = 'code' in error;
        if (isApiError) {
            this.emit("api:error", error);
        } else {
            this.emit("db:error", error);
        }
    }

}