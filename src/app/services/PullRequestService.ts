import { IPersistenceService } from "../services/IPersistenceService";
import { IPullRequestEntity, PullRequestEntity } from "../entities/PullRequestEntity";
import { PullRequestDocument } from "../entities/documents/PullRequestDocument";
import { IPullRequestRepository } from "../data/PullRequestRepository";
import { SinglePullRequestFilter, RepositoryPullRequestFilter, PullRequestFilterFactory } from "../data/filters/PullRequestFilter";
import { IApiService } from "./IApiService";
import { GitHubService } from "./GitHubService";
import { GitHubUtil } from "../util/GitHubUtil";
import * as GitHubAPI from "github";

/**
 * IPullRequestService interface.
 * Describes specific functionality for Pull Request entities.
 * @author Mario Juez <mario@mjuez.com> 
 */
export interface IPullRequestService extends IPersistenceService<IPullRequestEntity> {

    /**
     * Saves or updates many entities into database.
     * @param entities  an array of entities.
     * @returns a promise that retrns an array of entities if resolved.
     */
    createOrUpdateMultiple(entities: IPullRequestEntity[]): Promise<IPullRequestEntity[]>;
    getLocalPullRequest(owner: string, repository: string, id: number): Promise<IPullRequestEntity>;
    getLocalPullRequests(owner: string, repository: string, startingFrom?: number): Promise<IPullRequestEntity[]>;

}

/**
 * Pull Request services.
 * @author Mario Juez <mario@mjuez.com>
 */
export class PullRequestService implements IPullRequestService {

    /** Pull Request repository. */
    private readonly _repository: IPullRequestRepository;

    /**
     * Class constructor with Pull Request repository dependency
     * injection.
     * @param repository    Injected Pull Request repository.
     */
    constructor(repository: IPullRequestRepository) {
        this._repository = repository;
    }

    /**
     * Saves or updates a Pull Request into database.
     * @param entity    a Pull Request.
     * @returns a promise that returns a pull request entity if resolved.
     */
    public async createOrUpdate(entity: IPullRequestEntity): Promise<IPullRequestEntity> {
        let repository: IPullRequestRepository = this._repository;
        let foundEntity: IPullRequestEntity = await repository.findOneByPullId(entity.id);
        if (foundEntity != null) {
            try {
                await repository.update(entity);
                return entity;
            } catch (error) {
                throw error;
            }
        } else {
            try {
                return await repository.create(entity);
            } catch (error) {
                throw error;
            }
        }
    }

    /**
     * Saves or updates many Pull Requests into database.
     * @param entity    a Pull Request array.
     * @returns a promise that returns an array of pull request entities if resolved.
     */
    public async createOrUpdateMultiple(entities: IPullRequestEntity[]): Promise<IPullRequestEntity[]> {
        let entitiesResult: IPullRequestEntity[] = [];
        entities.map(async (entity) => {
            try {
                let persisted: IPullRequestEntity = await this.createOrUpdate(entity);
                entitiesResult.push(persisted);
            } catch (error) {
                throw error;
            }
        });
        return entitiesResult;
    }

    /** @inheritdoc */
    public getLocalPullRequest(owner: string, repo: string, id: number): Promise<IPullRequestEntity> {
        let repository: IPullRequestRepository = this._repository;
        let filter: SinglePullRequestFilter = PullRequestFilterFactory.createSingle({ owner, repository: repo, number: id });
        return repository.findOne(filter);
    }

    /** @inheritdoc */
    public getLocalPullRequests(owner: string, repo: string, startingFrom: number = 0): Promise<IPullRequestEntity[]> {
        let repository: IPullRequestRepository = this._repository;
        let filter: RepositoryPullRequestFilter = PullRequestFilterFactory.createRepository({ owner, repository: repo });
        return repository.findSublist(filter, startingFrom);
    }

}