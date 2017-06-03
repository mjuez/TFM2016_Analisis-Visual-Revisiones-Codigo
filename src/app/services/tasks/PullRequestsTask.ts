import { ITask } from "./ITask";
import { GitHubTask } from "./GitHubTask";
import { IPullRequestEntity, PullRequestEntity } from "../../entities/PullRequestEntity";
import { ITaskEntity } from "../../entities/TaskEntity";
import { ITaskRepository } from "../../data/TaskRepository";
import { IPullRequestRepository } from "../../data/PullRequestRepository";
import { IPullRequestService } from "../../services/PullRequestService";
import {
    RepositoryPullRequestFilter,
    PullRequestFilterFactory
} from "../../data/filters/PullRequestFilter";
import { GitHubUtil } from "../../util/GitHubUtil";
import * as GitHubAPI from "github";

interface Repositories {
    pull: IPullRequestRepository,
    task: ITaskRepository
}

export interface IPullRequestsTask extends ITask { }

export class PullRequestsTask extends GitHubTask implements IPullRequestsTask {

    private readonly _repositories: Repositories;

    private readonly _pullRequestService: IPullRequestService;

    constructor(repos: Repositories, pullRequestService: IPullRequestService, api?: GitHubAPI, apiAuth?: GitHubAPI.Auth) {
        super(repos.task, api, apiAuth);
        this._repositories = repos;
        this._pullRequestService = pullRequestService;
    }

    public async run(): Promise<void> {
        const pullRepo: IPullRequestRepository = this._repositories.pull;
        const filter: RepositoryPullRequestFilter =
            PullRequestFilterFactory.createRepository({ owner: this.entity.owner, repository: this.entity.repository });
        const startingFrom: number = this.entity.lastProcessed;
        try {
            console.log('Starting pull requests task...');
            await this.startTask();
            const numPages: number = await pullRepo.numPages(filter, startingFrom);
            for (let page: number = 1; page <= numPages; page++) {
                const pulls: IPullRequestEntity[] = await pullRepo.retrieve({ filter, page, startingFrom });
                const success: boolean = await this.processPullRequests(pulls);
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
                const remotePull: IPullRequestEntity = await this.makeApiCall(pull.document.number);
                this._pullRequestService.createOrUpdate(remotePull);
                this.entity.lastProcessed = pull.document.number;
                this.entity.currentPage = 1;
                await this.persist();
            } catch (error) {
                this.emitError(error);
                return false;
            }
        }
        return true;
    }

    private async makeApiCall(pullNumber: number): Promise<IPullRequestEntity> {
        try {
            const pullData: any = await this.API.pullRequests.get(<GitHubAPI.PullRequestsGetParams>{
                owner: this.entity.owner,
                repo: this.entity.repository,
                number: pullNumber
            });
            console.log(`[${new Date()}] - Getting pull #${pullNumber}, remaining reqs: ${pullData.meta['x-ratelimit-remaining']}`);
            return PullRequestEntity.toEntity(pullData.data);
        } catch (error) {
            throw error;
        }
    }
}