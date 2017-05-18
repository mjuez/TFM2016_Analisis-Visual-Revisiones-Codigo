import { ITask } from "./ITask";
import { AbstractUserTask } from "./AbstractUserTask";
import { IUserEntity } from "../../entities/UserEntity";
import { ITaskEntity } from "../../entities/TaskEntity";
import { IPullRequestEntity } from "../../entities/PullRequestEntity";
import { ITaskRepository } from "../../data/TaskRepository";
import { IPullRequestRepository } from "../../data/PullRequestRepository";
import { IUserRepository } from "../../data/UserRepository";
import { IUserService } from "../../services/UserService";
import {
    RepositoryPullRequestFilter,
    PullRequestFilterFactory
} from "../../data/filters/PullRequestFilter";
import * as GitHubAPI from "github";

interface Repositories {
    pull: IPullRequestRepository,
    task: ITaskRepository,
    user: IUserRepository
}

export interface IUsersPullsTask extends ITask { }

export class UsersPullsTask extends AbstractUserTask implements IUsersPullsTask {

    private readonly _repos: Repositories;

    constructor(repos: Repositories, userService: IUserService, api?: GitHubAPI, apiAuth?: GitHubAPI.Auth) {
        super({ task: repos.task, user: repos.user }, userService, api, apiAuth);
        this._repos = repos;
    }

    public async run(): Promise<void> {
        let pullRepo: IPullRequestRepository = this._repos.pull;
        let filter: RepositoryPullRequestFilter =
            PullRequestFilterFactory.createRepository({ owner: this.entity.owner, repository: this.entity.repository });
        let startingFrom: number = this.entity.lastProcessed;
        try {
            await this.startTask();
            let numPages: number = await pullRepo.numPages(filter, startingFrom);
            for (let page: number = 1; page <= numPages; page++) {
                let pulls: IPullRequestEntity[] = await pullRepo.retrievePartial(filter, page, startingFrom);
                let success: boolean = await this.processPullRequests(pulls);
                if (!success) return;
            }
            await this.completeTask();
        } catch (error) {
            this.emit("db:error", error);
        }
    }

    private async processPullRequests(pulls: IPullRequestEntity[]): Promise<boolean> {
        for (let i: number = 0; i < pulls.length; i++) {
            let pull: IPullRequestEntity = pulls[i];
            try {
                await this.processUser(pull.document.user.login);
                await this.processUser(pull.document.base.user.login);
                await this.processUser(pull.document.head.user.login);
                this.entity.lastProcessed = pull.document.number;
                await this.persist();
            } catch (error) {
                return false;
            }
        }
        return true;
    }

    protected async updateStats(username: string): Promise<void> {
        let pullRepo: IPullRequestRepository = this._repos.pull;
        let userRepo: IUserRepository = this._repos.user;
        let filter: Object = {
            user: {
                login: username
            }
        }
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