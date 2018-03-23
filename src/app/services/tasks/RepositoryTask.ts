import { ITask } from "./ITask";
import { GitHubTask } from "./GitHubTask";
import { RepositoryPullRequestFilter, PullRequestFilterFactory } from "../../data/filters/PullRequestFilter";
import { IRepositoryEntity, RepositoryEntity } from "../../entities/RepositoryEntity";
import { IRepositoryService } from "../../services/RepositoryService";
import { IRepositories } from "../../data/IRepositories";
import * as GitHubAPI from "@octokit/rest";

/**
 * Repository Task interface.
 *
 * This task type is intended to obtain a repository
 * data from GitHub.
 *
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IRepositoryTask extends ITask { }

/**
 * Repository task implementation.
 *
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class RepositoryTask extends GitHubTask implements IRepositoryTask {

    /** Repositories list. */
    private readonly _repositories: IRepositories;

    /** Repository service. */
    private readonly _repoService: IRepositoryService;

    /**
     * Creates the task instance.
     *
     * @param repositories  Repositories list.
     * @param repoService   Repository service.
     * @param api           optional GitHub API.
     * @param apiAuth       optional GitHub API Authorization.
     */
    constructor(repositories: IRepositories, repoService: IRepositoryService, api?: GitHubAPI, apiAuth?: GitHubAPI.Auth) {
        super(repositories.task, api, apiAuth);
        this._repoService = repoService;
        this._repositories = repositories;
    }

    /**
     * Runs the repository task.
     * Retrieves the repository data from GitHub
     * and then updates its stats.
     *
     * @async
     */
    public async run(): Promise<void> {
        const service: IRepositoryService = this._repoService;
        try {
            await this.startTask();
            const repositoryEntity: IRepositoryEntity = await this.makeApiCall();
            const updatedEntity: IRepositoryEntity = await this.updateStats(repositoryEntity);
            await service.createOrUpdate(updatedEntity);
            await this.completeTask();
        } catch (error) {
            this.emit("db:error", error);
        }
    }

    /**
     * Makes a GitHub API call.
     * Obtains repository data.
     *
     * @async
     */
    private async makeApiCall(): Promise<IRepositoryEntity> {
        try {
            let repoData: any = await this.API.repos.get(<GitHubAPI.ReposGetParams>{
                owner: this.entity.owner,
                repo: this.entity.repository
            });
            console.log(`[${new Date()}] - Getting repository #${this.entity.owner}/${this.entity.repository},
                 remaining reqs: ${repoData.meta["x-ratelimit-remaining"]}`);
            return RepositoryEntity.toEntity(repoData.data);
        } catch (error) {
            this.emit("api:error", error);
        }
    }

    /**
     * Updates the pull requests count, reviews count
     * and review comments count of the repository.
     *
     * @param entity    Repository entity.
     * @returns updated repository entity.
     */
    private async updateStats(entity: IRepositoryEntity): Promise<IRepositoryEntity> {
        try {
            let pullFilter: RepositoryPullRequestFilter =
                PullRequestFilterFactory.createRepository({ owner: this.entity.owner, repository: this.entity.repository });
            entity.document.pull_requests_count = await this._repositories.pull.count(pullFilter);
            let filter: Object = {
                "repository.name": new RegExp(this.entity.repository, "i"),
                "repository.owner": new RegExp(this.entity.owner, "i"),
            };
            entity.document.reviews_count = await this._repositories.review.count(filter);
            entity.document.review_comments_count = await this._repositories.reviewComment.count(filter);
            return entity;
        } catch (error) {
            throw error;
        }
    }
}