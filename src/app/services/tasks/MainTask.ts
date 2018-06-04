import { ITask } from "./ITask";
import { GitHubTask } from "./GitHubTask";
import { IPullRequestEntity, PullRequestEntity } from "../../entities/PullRequestEntity";
import { IPullRequestService } from "../../services/PullRequestService";
import { GitHubUtil } from "../../util/GitHubUtil";
import { IRepositories } from "../../data/IRepositories";
import * as GitHubAPI from "@octokit/rest";

/**
 * Main Task interface.
 *
 * This task type is the first task. It obtains
 * all pull requests of a repository through pages
 * of 100 pull requests. The pull request data obtained
 * in this task is incomplete.
 *
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IMainTask extends ITask { }

/**
 * Main task implementation.
 *
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class MainTask extends GitHubTask implements IMainTask {

    /** Repositories. */
    private readonly _repositories: IRepositories;

    /** Pull request service. */
    private readonly _pullService: IPullRequestService;

    /**
     * Creates the task instance.
     *
     * @param repositories  Repositories list.
     * @param pullService   Pull request service.
     * @param api           optional GitHub API.
     * @param apiAuth       optional GitHub API Authorization.
     */
    constructor(repositories: IRepositories, pullService: IPullRequestService, api?: GitHubAPI, apiAuth?: GitHubAPI.Auth) {
        super(repositories.task, api, apiAuth);
        this._pullService = pullService;
        this._repositories = repositories;
    }

    /**
     * Runs the main task.
     *
     * @async
     */
    public async run(): Promise<void> {
        try {
            await this.startTask();
            await this.makeApiCall();
            await this.completeTask();
        } catch (error) {
            this.emit("db:error", error);
        }
    }

    /**
     * Makes a GitHub API Call.
     * Gets all pages of summarized pull requests.
     *
     * @async
     */
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

    /**
     * Converts the page to an array of Pull Request
     * entities, then gets and process the next page.
     *
     * @async
     * @param page  GitHub page.
     */
    private async processPage(page: any): Promise<void> {
        const api: GitHubAPI = this.API;
        const pullRequests: IPullRequestEntity[] = PullRequestEntity.toPullRequestEntityArray(page.data);
        console.log(`[${new Date()}] - Getting page ${this.entity.currentPage}, remaining reqs: ${page.meta["x-ratelimit-remaining"]}`);
        try {
            await this._pullService.createOrUpdateMultiple(pullRequests);
            const links: string = page.meta.link;
            const nextPage: number = GitHubUtil.getNextPageNumber(links);
            this.entity.currentPage = nextPage;
            await this.persist();
        } catch (error) {
            this.emit("db:error", error);
            return;
        }
        if (api.hasNextPage(page)) {
            try {
                const nextPage: any = await api.getNextPage(page);
                await this.processPage(nextPage);
            } catch(error) { throw error; }
        }
    }
}