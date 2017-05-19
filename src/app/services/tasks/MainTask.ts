import { ITask } from "./ITask";
import { GitHubTask } from "./GitHubTask";
import { ITaskRepository } from "../../data/TaskRepository";
import { IPullRequestRepository } from "../../data/PullRequestRepository";
import { ITaskEntity } from "../../entities/TaskEntity";
import { IPullRequestEntity, PullRequestEntity } from "../../entities/PullRequestEntity";
import { IPullRequestService } from "../../services/PullRequestService";
import { GitHubUtil } from "../../util/GitHubUtil";
import * as GitHubAPI from "github";

interface Repositories {
    task: ITaskRepository,
    pull: IPullRequestRepository
}

export interface IMainTask extends ITask { }

export class MainTask extends GitHubTask implements IMainTask {

    private readonly _repositories: Repositories;

    private readonly _pullService: IPullRequestService;

    constructor(repositories: Repositories, pullService: IPullRequestService, api?: GitHubAPI, apiAuth?: GitHubAPI.Auth) {
        super(repositories.task, api, apiAuth);
        this._pullService = pullService;
        this._repositories = repositories;
    }

    public async run(): Promise<void> {
        try {
            await this.startTask();
            await this.makeApiCall();
            await this.completeTask();
        } catch (error) {
            this.emit("db:error", error);
        }
    }

    private async makeApiCall(): Promise<void> {
        try {
            let page: any = await this.API.pullRequests.getAll(<GitHubAPI.PullRequestsGetAllParams>{
                owner: this.entity.owner,
                repo: this.entity.repository,
                state: `all`,
                per_page: 100,
                direction: `asc`,
                page: this.entity.currentPage
            });
            await this.processPage(page);
        } catch (error) {
            this.emit("api:error", error);
        }
    }

    private async processPage(page: any): Promise<void> {
        let api: GitHubAPI = this.API;
        let pullRequests: IPullRequestEntity[] = PullRequestEntity.toEntityArray(page.data);
        console.log(`[${new Date()}] - Getting page ${this.entity.currentPage}, remaining reqs: ${page.meta['x-ratelimit-remaining']}`);
        try {
            await this._pullService.createOrUpdateMultiple(pullRequests);
            let links: string = page.meta.link;
            let nextPage: number = GitHubUtil.getNextPageNumber(links);
            this.entity.currentPage = nextPage;
            await this.persist();
        } catch (error) {
            this.emit("db:error", error);
            return;
        }
        if (api.hasNextPage(page)) {
            try {
                let nextPage: any = await api.getNextPage(page);
                await this.processPage(nextPage);
            }catch(error){
                throw error;
            }
        }
    }
}