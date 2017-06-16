import { GitHubTask } from "./GitHubTask";
import { IPullRequestService } from "../PullRequestService";
import { IRepositories } from "../../data/IRepositories";
import { IPullRequestRepository } from "../../data/PullRequestRepository";
import { RepositoryPullRequestFilter, PullRequestFilterFactory } from "../../data/filters/PullRequestFilter";
import { IPullRequestEntity } from "../../entities/PullRequestEntity";
import * as GitHubAPI from "github";

/**
 * Abstract Task which implements shared functionality
 * for those tasks that loops over the pull request list
 * for obtaining data linked to a specific pull request.
 * 
 * @author Mario Juez <mario@mjuez.com>
 */
export abstract class AbstractPullRequestTask extends GitHubTask {

    /** Pull Request Service. */
    protected readonly _pullRequestService: IPullRequestService;

    /** Repositories instances list. */
    private readonly _repositories: IRepositories;

    /**
     * Creates the task instance.
     * @param repos                 Repositories list.
     * @param pullRequestService    Pull Request service.
     * @param api                   optional GitHub API.
     * @param apiAuth               optional GitHub API Authorization.
     */
    constructor(repos: IRepositories, pullRequestService: IPullRequestService, api?: GitHubAPI, apiAuth?: GitHubAPI.Auth) {
        super(repos.task, api, apiAuth);
        this._repositories = repos;
        this._pullRequestService = pullRequestService;
    }

    /**
     * Runs the task.
     * Loops over all pull requests from a repository and processes
     * each one to obtain some kind of entities or data related with
     * the pull requests.
     */
    public async run(): Promise<void> {
        const pullRepo: IPullRequestRepository = this._repositories.pull;
        const filter: RepositoryPullRequestFilter =
            PullRequestFilterFactory.createRepository({ owner: this.entity.owner, repository: this.entity.repository });
        const startingFrom: number = this.entity.lastProcessed;
        try {
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

    /**
     * Pull Requests processing for obtaining some kind
     * of entities or data related with each pull request.
     * @param pulls Pull Request entities list.
     */
    protected abstract processPullRequests(pulls: IPullRequestEntity[]): Promise<boolean>;

}