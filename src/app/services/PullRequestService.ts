import { IPersistenceService } from "../services/IPersistenceService";
import { IPullRequestEntity, PullRequestEntity } from "../entities/PullRequestEntity";
import { PullRequestDocument } from "../entities/documents/PullRequestDocument";
import { IPullRequestRepository } from "../data/PullRequestRepository";
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

    getRemotePullRequest(owner: string, repository: string, id: number): Promise<IPullRequestEntity>;

    getRemotePullRequests(owner: string, repository: string): Promise<IPullRequestEntity[]>;

    /**
     * Transforms raw data to IPullRequestEntity.
     * @param data  raw data.
     */
    toEntity(data: any): IPullRequestEntity;

    /**
     * Transforms raw data to IPullRequestEntity array.
     * @param data  raw data.
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
     */
    constructor(repository: IPullRequestRepository) {
        super();
        this._repository = repository;
    }

    /**
     * Saves or updates a Pull Request into database.
     * @param entity    a Pull Request.
     * @param callback  optional callback function to retrieve the created/updated
     *                  Pull Request (or an error if something goes wrong).
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
     * @param callback  optional callback function to retrieve the created/updated
     *                  Pull Request array (or an error if something goes wrong).
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

            // TRY: resolve(entitiesResult)
        });

        return promise;
    }

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
        //console.log(data);
        //let jsonArray: Object[] = JSON.parse(data);
        let entityArray: IPullRequestEntity[] = [];
        if (data.length > 0) {
            data.map((jsonObject) => {
                let entity: IPullRequestEntity = this.toEntity(jsonObject);
                entityArray.push(entity);
            });
        }
        return entityArray;
    }

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