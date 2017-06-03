import { IPersistenceService } from "../services/IPersistenceService";
import { AbstractPersistenceService } from "../services/AbstractPersistenceService";
import { IRepositoryEntity, RepositoryEntity } from "../entities/RepositoryEntity";
import { RepositoryDocument } from "../entities/documents/RepositoryDocument";
import { IRepositoryRepository } from "../data/RepositoryRepository";

/**
 * IRepositoryService interface.
 * Describes specific functionality for Repository entities.
 * @author Mario Juez <mario@mjuez.com> 
 */
export interface IRepositoryService extends IPersistenceService<IRepositoryEntity> {

    getRepository(owner: string, repository: string): Promise<IRepositoryEntity>;
    getRepositoriesPage(page: number, direction?: number): Promise<IRepositoryEntity[]>;
    getRepositoriesByNamePage(page: number, direction?: number): Promise<IRepositoryEntity[]>;
    getRepositoriesByReviewsPage(page: number, direction?: number): Promise<IRepositoryEntity[]>;
    getRepositoriesByPullRequestsPage(page: number, direction?: number): Promise<IRepositoryEntity[]>;
    getRepositoriesList(): Promise<IRepositoryEntity[]>;
    getRepositoriesStatsAverages(): Promise<any>;

}

/**
 * Repository services.
 * @author Mario Juez <mario@mjuez.com>
 */
export class RepositoryService extends AbstractPersistenceService<IRepositoryRepository, IRepositoryEntity, RepositoryDocument> implements IRepositoryService {

    /**
     * Class constructor with Repository repository and
     * pull request service dependency injection.
     * @param repository    Injected Repository repository.
     */
    constructor(repository: IRepositoryRepository) {
        super(repository);
    }

    public async getRepository(owner: string, repository: string): Promise<IRepositoryEntity> {
        const repo: IRepositoryRepository = this._repository;
        return await repo.findOne({ "owner.login": owner, "name": repository });
    }

    public async getRepositoriesPage(page: number, direction: number = 1): Promise<IRepositoryEntity[]> {
        const repo: IRepositoryRepository = this._repository;
        const sort: Object = { created_at: direction };
        const entities: IRepositoryEntity[] = await repo.retrieve({ page, sort });
        return entities;
    }

    public async getRepositoriesByNamePage(page: number, direction: number = 1): Promise<IRepositoryEntity[]> {
        const repo: IRepositoryRepository = this._repository;
        const sort: Object = { full_name: direction };
        const entities: IRepositoryEntity[] = await repo.retrieve({ page, sort });
        return entities;
    }

    public async getRepositoriesByReviewsPage(page: number, direction: number = 1): Promise<IRepositoryEntity[]> {
        const repo: IRepositoryRepository = this._repository;
        const sort: Object = { reviews_count: direction };
        const entities: IRepositoryEntity[] = await repo.retrieve({ page, sort });
        return entities;
    }

    public async getRepositoriesByPullRequestsPage(page: number, direction: number = 1): Promise<IRepositoryEntity[]> {
        const repo: IRepositoryRepository = this._repository;
        const sort: Object = { pull_requests_count: direction };
        const entities: IRepositoryEntity[] = await repo.retrieve({ page, sort });
        return entities;
    }

    public async getRepositoriesList(): Promise<IRepositoryEntity[]> {
        const repo: IRepositoryRepository = this._repository;
        const sort: Object = { full_name: 1 };
        const select: string = 'full_name -_id';
        const entities: IRepositoryEntity[] = await repo.retrieve({ sort, select });
        return entities;
    }

    public async getRepositoriesStatsAverages(): Promise<Object> {
        const repo: IRepositoryRepository = this._repository;
        const select: string = 'stargazers_count watchers_count forks_count review_comments_count reviews_count pull_requests_count -_id';
        const entities: IRepositoryEntity[] = await repo.retrieve({ select });

        let sums: any = {
            stargazers: 0,
            watchers: 0,
            forks: 0,
            review_comments: 0,
            reviews: 0,
            pull_requests: 0
        }

        entities.map((entity) => {
            sums.stargazers += entity.document.stargazers_count;
            sums.watchers += entity.document.watchers_count;
            sums.forks += entity.document.forks_count;
            sums.review_comments += entity.document.review_comments_count;
            sums.reviews += entity.document.reviews_count;
            sums.pull_requests += entity.document.pull_requests_count;
        });

        let avgs: any = {
            stargazers: sums.stargazers / entities.length,
            watchers: sums.watchers / entities.length,
            forks: sums.forks / entities.length,
            review_comments: sums.review_comments / entities.length,
            reviews: sums.reviews / entities.length,
            pull_requests: sums.pull_requests / entities.length
        };

        return avgs;
    }

    protected async findEntity(entity: IRepositoryEntity): Promise<IRepositoryEntity> {
        return await this._repository.findById(entity.id);
    }

}