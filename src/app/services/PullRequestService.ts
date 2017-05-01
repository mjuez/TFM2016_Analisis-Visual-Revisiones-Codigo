import { IPersistenceService } from "../services/IPersistenceService";
import { IPullRequestEntity, PullRequestEntity } from "../entities/PullRequestEntity";
import { PullRequestDocument } from "../entities/documents/PullRequestDocument";
import { IPullRequestRepository } from "../data/PullRequestRepository";
import { SinglePullRequestFilter, RepositoryPullRequestFilter, PullRequestFilterFactory } from "../data/filters/PullRequestFilter";
import { IApiService } from "./IApiService";
import { GitHubService } from "./GitHubService";
import { GitHubUtil } from "../util/GitHubUtil";
import * as GitHubAPI from "github";
import * as Promise from "bluebird";

/**
 * IPullRequestService interface.
 * Describes specific functionality for Pull Request entities.
 * @author Mario Juez <mario@mjuez.com> 
 */
export interface IPullRequestService extends IPersistenceService<IPullRequestEntity>, IApiService<GitHubAPI> {

    getLocalPullRequest(owner: string, repository: string, id: number): Promise<IPullRequestEntity>;

    getLocalPullRequests(owner: string, repository: string): Promise<IPullRequestEntity[]>;

    /**
     * Obtains a remote pull request (from GitHub).
     * @param owner         repository owner.
     * @param repository    repository name.
     * @param id            pull request id.
     * @returns a promise that returns a pull request entity if resolved.
     */
    getRemotePullRequest(owner: string, repository: string, id: number): Promise<IPullRequestEntity>;

    /**
     * Obtains all remote pull requests (from GitHub).
     * @param owner         repository owner.
     * @param repository    repository name.
     * @returns a promise that returns an array of pull request entities if resolved.
     */
    getRemotePullRequests(owner: string, repository: string): Promise<IPullRequestEntity[]>;

    /**
     * Transforms raw data to IPullRequestEntity.
     * @param data  raw data.
     * @returns a pull request entity.
     */
    toEntity(data: any): IPullRequestEntity;

    /**
     * Transforms raw data to IPullRequestEntity array.
     * @param data  raw data.
     * @returns an array of pull request entities.
     */
    toEntityArray(data: any): IPullRequestEntity[];
}

/**
 * Pull Request services.
 * @author Mario Juez <mario@mjuez.com>
 */
export class PullRequestService extends GitHubService implements IPullRequestService {

    /** Pull Request repository. */
    private readonly _repository: IPullRequestRepository;

    /**
     * Class constructor with Pull Request repository dependency
     * injection.
     * @param repository    Injected Pull Request repository.
     * @param api           optional GitHub API wrapper dependency injection.
     * @param apiAuth       optional GitHub API authorization.
     */
    constructor(repository: IPullRequestRepository, api?: GitHubAPI, apiAuth?: GitHubAPI.Auth) {
        super(api, apiAuth);
        this._repository = repository;
    }

    /**
     * Saves or updates a Pull Request into database.
     * @param entity    a Pull Request.
     * @returns a promise that returns a pull request entity if resolved.
     */
    public createOrUpdate(entity: IPullRequestEntity): Promise<IPullRequestEntity> {
        let repository: IPullRequestRepository = this._repository;

        let promise: Promise<IPullRequestEntity> = new Promise<IPullRequestEntity>((resolve, reject) => {
            repository.findOneByPullId(entity.id).then((foundEntity) => {
                if (foundEntity) {
                    repository.update(entity).then((rowsAffected) => {
                        resolve(entity);
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    repository.create(entity).then((result) => {
                        resolve(result);
                    }).catch((error) => {
                        reject(error);
                    });
                }
            }).catch((error) => {
                reject(error);
            });
        });

        return promise;
    }

    /**
     * Saves or updates many Pull Requests into database.
     * @param entity    a Pull Request array.
     * @returns a promise that returns an array of pull request entities if resolved.
     */
    public createOrUpdateMultiple(entities: IPullRequestEntity[]): Promise<IPullRequestEntity[]> {
        let promise: Promise<IPullRequestEntity[]> = new Promise<IPullRequestEntity[]>((resolve, reject) => {
            let entitiesResult: IPullRequestEntity[] = [];
            entities.map((entity) => {
                this.createOrUpdate(entity).then((entity) => {
                    let length: number = entitiesResult.push(entity);
                    if (length === entities.length) {
                        resolve(entitiesResult);
                    }
                }).catch((reason) => {
                    reject(reason);
                });
            });

            // TRY: resolve(entitiesResult) instead comparing lengths ?
        });

        return promise;
    }

    /** @inheritdoc */
    public getLocalPullRequest(owner: string, repo: string, id: number): Promise<IPullRequestEntity> {
        let repository: IPullRequestRepository = this._repository;
        let filter: SinglePullRequestFilter = PullRequestFilterFactory.createSingle({ owner, repository: repo, number: id });
        return repository.findOne(filter);
    }

    /** @inheritdoc */
    public getLocalPullRequests(owner: string, repo: string): Promise<IPullRequestEntity[]> {
        let repository: IPullRequestRepository = this._repository;
        let filter: RepositoryPullRequestFilter = PullRequestFilterFactory.createRepository({ owner, repository: repo});
        return repository.retrieve(filter);
    }

    /** @inheritdoc */
    public getRemotePullRequest(owner: string, repository: string, id: number): Promise<IPullRequestEntity> {
        let api: GitHubAPI = this.API;

        let promise: Promise<IPullRequestEntity> = new Promise<IPullRequestEntity>((resolve, reject) => {
            api.pullRequests.get(<GitHubAPI.PullRequestsGetParams>{
                owner: owner,
                repo: repository,
                number: id
            }).then((result) => {
                let entity: IPullRequestEntity = this.toEntity(result.data);
                resolve(entity);
            }).catch((reason) => {
                reject(reason);
            });
        });

        return promise;
    }

    /** @inheritdoc */
    public getRemotePullRequests(owner: string, repository: string): Promise<IPullRequestEntity[]> {
        let api: GitHubAPI = this.API;

        let promise: Promise<IPullRequestEntity[]> = new Promise<IPullRequestEntity[]>((resolve, reject) => {
            api.pullRequests.getAll(<GitHubAPI.PullRequestsGetAllParams>{
                owner: owner,
                repo: repository,
                state: `all`,
                per_page: 100,
                direction: `asc`
            }).then((result) => {
                this.getAllPaginatedPullRequests(result).then((entities) => {
                    resolve(entities);
                }).catch((reason) => {
                    reject(reason);
                });
            }).catch((reason) => {
                reject(reason);
            });
        });

        return promise;
    }

    /** @inheritdoc */
    public toEntity(data: Object): IPullRequestEntity {
        let entity: IPullRequestEntity = new PullRequestEntity(<PullRequestDocument>data);
        return entity;
    }

    /** @inheritdoc */
    public toEntityArray(data: Object[]): IPullRequestEntity[] {
        let entityArray: IPullRequestEntity[] = [];
        if (data.length > 0) {
            data.map((jsonObject) => {
                let entity: IPullRequestEntity = this.toEntity(jsonObject);
                entityArray.push(entity);
            });
        }
        return entityArray;
    }

    /**
     * Obtains all pull requests from GitHub, even if they are paginated.
     * @param pageResult    a response that contains a page or results 
     *                      from a GitHub API call.
     * @returns a promise that returns an array of pull request entities if resolved,
     *          or if rejected, returns an object with an array of a part of remote
     *          pull requests and the last page that was processed to continue from
     *          that point in the future. *Note: This can be useful when we run out of
     *          api calls.
     */
    private getAllPaginatedPullRequests(pageResult): Promise<IPullRequestEntity[]> {
        let api: GitHubAPI = this.API;

        let promise: Promise<IPullRequestEntity[]> = new Promise<IPullRequestEntity[]>((resolve, reject) => {
            let pullRequests: IPullRequestEntity[] = this.toEntityArray(pageResult.data);
            if (api.hasNextPage(pageResult)) {
                api.getNextPage(pageResult).then((nextPageResult) => {
                    this.getAllPaginatedPullRequests(nextPageResult).then((followingPullRequests) => {
                        pullRequests = pullRequests.concat(followingPullRequests);
                        resolve(pullRequests);
                    }).catch((reason) => {
                        let partialPullRequests: IPullRequestEntity[] = reason["pull-requests"];
                        pullRequests = pullRequests.concat(partialPullRequests);
                        reason["pull-requests"] = pullRequests;
                        reject(reason);
                    });
                }).catch((reason) => {
                    let links: string = pageResult.meta.link;
                    let nextPage: number = GitHubUtil.getNextPageNumber(links);
                    let rejection: Object = {
                        "pull-requests": pullRequests,
                        "next-page": nextPage
                    }
                    reject(rejection);
                });
            } else {
                resolve(pullRequests);
            }
        });

        return promise;
    }

}