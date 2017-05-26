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
    getRepositories(page: number): Promise<Object[]>;
    numPages(): Promise<number>;
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
        let repo: IRepositoryRepository = this._repository;
        return await repo.findOne({"owner.login": owner, "name": repository});
    }
    
    public async getRepositories(page: number): Promise<Object[]>{
        let repo: IRepositoryRepository = this._repository;
        let entities: IRepositoryEntity[] = await repo.retrievePartial({}, page);
        return this.toJSONArray(entities);
    }

    public async numPages(): Promise<number> {
        let repo: IRepositoryRepository = this._repository;
        return await repo.numPages();
    }

    protected async findEntity(entity: IRepositoryEntity): Promise<IRepositoryEntity> {
        return await this._repository.findById(entity.id);
    }

}