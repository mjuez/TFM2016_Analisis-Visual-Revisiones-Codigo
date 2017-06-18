import { ITask } from "./ITask";
import { IUserEntity } from "../../entities/UserEntity";
import { ITaskEntity } from "../../entities/TaskEntity";
import { IPullRequestEntity } from "../../entities/PullRequestEntity";
import { ITaskRepository } from "../../data/TaskRepository";
import { IPullRequestRepository } from "../../data/PullRequestRepository";
import { IUserRepository } from "../../data/UserRepository";
import { IUserService } from "../../services/UserService";
import { AbstractPullRequestTask } from "./AbstractPullRequestTask";
import { IRepositories } from "../../data/IRepositories";
import * as GitHubAPI from "github";
import { IUserTaskUtil } from "../../util/UserTaskUtil";

export interface IUsersPullsTask extends ITask { }

export class UsersPullsTask extends AbstractPullRequestTask implements IUsersPullsTask {

    private readonly _userService: IUserService;

    private readonly _userTaskUtil: IUserTaskUtil;

    constructor(repos: IRepositories, userService: IUserService, userTaskUtil: IUserTaskUtil, api?: GitHubAPI, apiAuth?: GitHubAPI.Auth) {
        super(repos, api, apiAuth);
        this._userService = userService;
        this._userTaskUtil = userTaskUtil;
    }

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