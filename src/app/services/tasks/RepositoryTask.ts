import { ITask } from "./ITask";
import { GitHubTask } from "./GitHubTask";
import { ITaskRepository } from "../../data/TaskRepository";
import { IRepositoryRepository } from "../../data/RepositoryRepository";
import { IPullRequestRepository } from "../../data/PullRequestRepository";
import { IReviewRepository } from "../../data/ReviewRepository";
import { IReviewCommentRepository } from "../../data/ReviewCommentRepository";
import { RepositoryPullRequestFilter, PullRequestFilterFactory } from "../../data/filters/PullRequestFilter";
import { ITaskEntity } from "../../entities/TaskEntity";
import { IRepositoryEntity, RepositoryEntity } from "../../entities/RepositoryEntity";
import { IRepositoryService } from "../../services/RepositoryService";
import * as GitHubAPI from "github";

interface Repositories {
    task: ITaskRepository,
    repo: IRepositoryRepository,
    pull: IPullRequestRepository,
    review: IReviewRepository,
    reviewComment: IReviewCommentRepository
}

export interface IRepositoryTask extends ITask { }

export class RepositoryTask extends GitHubTask implements IRepositoryTask {

    private readonly _repositories: Repositories;

    private readonly _repoService: IRepositoryService;

    constructor(repositories: Repositories, repoService: IRepositoryService, api?: GitHubAPI, apiAuth?: GitHubAPI.Auth) {
        super(repositories.task, api, apiAuth);
        this._repoService = repoService;
        this._repositories = repositories;
    }

    public async run(): Promise<void> {
        let service: IRepositoryService = this._repoService;
        try {
            await this.startTask();
            let repositoryEntity: IRepositoryEntity = await this.makeApiCall();
            let updatedEntity: IRepositoryEntity = await this.updateStats(repositoryEntity);
            await service.createOrUpdate(updatedEntity);
            await this.completeTask();
        } catch (error) {
            this.emit("db:error", error);
        }
    }

    private async makeApiCall(): Promise<IRepositoryEntity> {
        try {
            let repoData: any = await this.API.repos.get(<GitHubAPI.ReposGetParams>{
                owner: this.entity.owner,
                repo: this.entity.repository
            });
            return RepositoryEntity.toEntity(repoData.data);
        } catch (error) {
            this.emit("api:error", error);
        }
    }

    private async updateStats(entity: IRepositoryEntity): Promise<IRepositoryEntity> {
        try {
            let pullFilter: RepositoryPullRequestFilter =
                PullRequestFilterFactory.createRepository({ owner: this.entity.owner, repository: this.entity.repository });
            entity.document.pull_requests_count = await this._repositories.pull.count(pullFilter);
            let filter: Object = {
                repository: {
                    name: this.entity.repository,
                    owner: this.entity.owner
                }
            };
            entity.document.reviews_count = await this._repositories.review.count(filter);
            entity.document.review_comments_count = await this._repositories.reviewComment.count(filter);
            return entity;
        } catch (error) {
            throw error;
        }
    }
}