import { ITask } from "./ITask";
import { IPullRequestEntity, PullRequestEntity } from "../../entities/PullRequestEntity";
import { AbstractPullRequestTask } from "./AbstractPullRequestTask";
import { IPullRequestService } from "../PullRequestService";
import { IRepositories } from "../../data/IRepositories";
import * as GitHubAPI from "github";

/**
 * Pull Requests Task interface.
 * 
 * This task type is intended to obtain all data of every
 * pull request of a repository. Is necessary because when
 * getting all pull requests paginated from GitHub API, some
 * pull request data is not provided.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IPullRequestsTask extends ITask { }

/**
 * Pull Requests task implementation.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class PullRequestsTask extends AbstractPullRequestTask implements IPullRequestsTask {

    /** Pull Request Service. */
    protected readonly _pullRequestService: IPullRequestService;

    /**
     * Creates the task instance.
     * 
     * @param repos                 Repositories list.
     * @param pullRequestService    Pull Request service.
     * @param api                   optional GitHub API.
     * @param apiAuth               optional GitHub API Authorization.
     */
    constructor(repos: IRepositories, pullRequestService: IPullRequestService, api?: GitHubAPI, apiAuth?: GitHubAPI.Auth) {
        super(repos, api, apiAuth);
        this._pullRequestService = pullRequestService;
    }

    /**
     * Processes a pull request entity list.
     * Each pull request fires a GitHub API call for obtaining
     * all data of that pull request.
     * 
     * @async
     * @param pulls List of pull request entities.
     * @returns if successfull processing.
     */
    protected async processPullRequests(pulls: IPullRequestEntity[]): Promise<boolean> {
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

    /**
     * Makes a GitHub API call for obtaining all pull request
     * data given its number.
     * 
     * @async
     * @param pullNumber Pull Request number.
     * @returns obtained pull request entity.
     */
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