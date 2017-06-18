import { GitHubTask } from "./GitHubTask";
import { IRepositories } from "../../data/IRepositories";
import { IUserService } from "../UserService";
import * as GitHubAPI from "github";
import { IUserTaskUtil } from "../../util/UserTaskUtil";

export abstract class AbstractUserTask extends GitHubTask {

    protected readonly _repos: IRepositories;

    protected readonly _userService: IUserService;

    protected readonly _userTaskUtil: IUserTaskUtil;

    constructor(repos: IRepositories, userService: IUserService, userTaskUtil: IUserTaskUtil, api?: GitHubAPI, apiAuth?: GitHubAPI.Auth) {
        super(repos.task, api, apiAuth);
        this._repos = repos;
        this._userService = userService;
        this._userTaskUtil = userTaskUtil;
    }

    protected async process(userLogin: string, lastProcessed: number): Promise<void> {
        const taskId: any = this.entity.parentTask.document._id;
        try {
            await this._userTaskUtil.processUser(userLogin, taskId, this.API, this.emitError);
            this.entity.lastProcessed = lastProcessed;
            this.entity.currentPage = 1;
            await this.persist();
        } catch (error) {
            throw error;
        }
    }

}