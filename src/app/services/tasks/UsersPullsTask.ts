import { ITask } from "./ITask";
import { IPullRequestEntity } from "../../entities/PullRequestEntity";
import { IUserService } from "../../services/UserService";
import { AbstractPullRequestTask } from "./AbstractPullRequestTask";
import { IRepositories } from "../../data/IRepositories";
import { IUserTaskUtil } from "../../util/UserTaskUtil";
import * as GitHubAPI from "@octokit/rest";

/**
 * User pulls Task interface.
 *
 * This task type is intended to obtain the three
 * possible users of a pull request:
 *  - who creates it.
 *  - base user.
 *  - head user.
 *
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IUsersPullsTask extends ITask { }

/**
 * User pulls task implementation.
 *
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class UsersPullsTask extends AbstractPullRequestTask implements IUsersPullsTask {

    /** User service. */
    private readonly _userService: IUserService;

    /** User task util. */
    private readonly _userTaskUtil: IUserTaskUtil;

    /**
     * Creates the task instance.
     *
     * @param repos         Repositories list.
     * @param userService   User service.
     * @param userTaskUtil  User task util.
     * @param api           optional GitHub API.
     * @param apiAuth       optional GitHub API Authorization.
     */
    constructor(repos: IRepositories, userService: IUserService, userTaskUtil: IUserTaskUtil, api?: GitHubAPI, apiAuth?: GitHubAPI.Auth) {
        super(repos, api, apiAuth);
        this._userService = userService;
        this._userTaskUtil = userTaskUtil;
    }

    /**
     * Processes the users of all pull requests.
     *
     * @async
     * @param pulls Pull Request List.
     * @returns if successfull processing.
     */
    protected async processPullRequests(pulls: IPullRequestEntity[]): Promise<boolean> {
        const taskId: any = this.entity.parentTask.document._id;
        for (let i: number = 0; i < pulls.length; i++) {
            const pull: IPullRequestEntity = pulls[i];
            try {
                await this._userTaskUtil.processUser(pull.document.user.login, taskId, this.API, this.emitError);
                await this._userTaskUtil.processUser(pull.document.base.user.login, taskId, this.API, this.emitError);
                await this._userTaskUtil.processUser(pull.document.head.user.login, taskId, this.API, this.emitError);
                this.entity.lastProcessed = pull.document.number;
                this.entity.currentPage = 1;
                await this.persist();
            } catch (error) {
                return false;
            }
        }
        return true;
    }

}