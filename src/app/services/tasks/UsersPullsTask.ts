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
import { GetUserParams, GitHubUtil } from "../../util/GitHubUtil";

export interface IUsersPullsTask extends ITask { }

export class UsersPullsTask extends AbstractPullRequestTask implements IUsersPullsTask {

    private readonly _userService: IUserService;

    constructor(repos: IRepositories, userService: IUserService, api?: GitHubAPI, apiAuth?: GitHubAPI.Auth) {
        super(repos, api, apiAuth);
        this._userService = userService;
    }

    protected async processPullRequests(pulls: IPullRequestEntity[]): Promise<boolean> {
        let parameters: GetUserParams = {
            username: null,
            userRepo: this._repositories.user,
            userService: this._userService,
            taskId: this.entity.parentTask.document._id,
            statsHandler: this.updateStats,
            errorHandler: this.emitError,
            api: this.API
        }
        for (let i: number = 0; i < pulls.length; i++) {
            let pull: IPullRequestEntity = pulls[i];
            try {
                parameters.username = pull.document.user.login;
                await GitHubUtil.processUser(parameters);
                parameters.username = pull.document.base.user.login;
                await GitHubUtil.processUser(parameters);
                parameters.username = pull.document.head.user.login;
                await GitHubUtil.processUser(parameters);
                this.entity.lastProcessed = pull.document.number;
                this.entity.currentPage = 1;
                await this.persist();
            } catch (error) {
                return false;
            }
        }
        return true;
    }

    private updateStats = async (username: string): Promise<void> => {
        let pullRepo: IPullRequestRepository = this._repositories.pull;
        let userRepo: IUserRepository = this._repositories.user;
        let filter: Object = { "user.login": username };
        try {
            let user: IUserEntity = await userRepo.findByLogin(username);
            let pullRequestCount: number = await pullRepo.count(filter);
            user.document.pull_request_count = pullRequestCount;
            await userRepo.update(user);
        } catch (error) {
            this.emit("db:error", error);
            throw error;
        }
    }

}