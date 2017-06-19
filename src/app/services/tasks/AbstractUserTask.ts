import { GitHubTask } from "./GitHubTask";
import { IRepositories } from "../../data/IRepositories";
import { IUserService } from "../UserService";
import { IUserTaskUtil } from "../../util/UserTaskUtil";
import * as GitHubAPI from "github";

/**
 * Abstract Task which implements shared functionality
 * for those tasks that obtains users from GitHub API.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export abstract class AbstractUserTask extends GitHubTask {

    /** Repositories. */
    protected readonly _repos: IRepositories;

    /** User Service. */
    protected readonly _userService: IUserService;

    /** User task util. */
    protected readonly _userTaskUtil: IUserTaskUtil;

    /**
     * Creates the task with the injected dependencies.
     * 
     * @param repos         Repositories.
     * @param userService   User service.
     * @param userTaskUtil  User task utils.
     * @param api           optional GitHub API wrapper dependency injection.
     * @param apiAuth       optional GitHub API authorization.
     */
    constructor(repos: IRepositories, userService: IUserService, userTaskUtil: IUserTaskUtil, api?: GitHubAPI, apiAuth?: GitHubAPI.Auth) {
        super(repos.task, api, apiAuth);
        this._repos = repos;
        this._userService = userService;
        this._userTaskUtil = userTaskUtil;
    }

    /**
     * User processing by its login.
     * If the user was not retrieved in this task
     * it will be obtained, then the task is updated
     * to process the next one.
     * 
     * @async
     * @param userLogin     user login.
     * @param lastProcessed id of last user processed.
     */
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