import { IService } from "../services/IService";
import { IPullRequestEntity } from "../entities/PullRequestEntity";
import { IPullRequestRepository } from "../data/PullRequestRepository";

/**
 * IPullRequestService interface.
 * Describes specific functionality for Pull Request entities.
 * @author Mario Juez <mario@mjuez.com> 
 */
export interface IPullRequestService extends IService<IPullRequestEntity> { }

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
    constructor(repository: IPullRequestRepository){
        this._repository = repository;
    }

    /**
     * Saves or updates a Pull Request into database.
     * @param entity    a Pull Request.
     * @param callback  optional callback function to retrieve the created/updated
     *                  Pull Request (or an error if something goes wrong).
     */
    public createOrUpdate(entity: IPullRequestEntity, callback: (err: any, result: IPullRequestEntity) => void): void {
        let repository: IPullRequestRepository = this._repository;
        repository.findOneByPullId(entity.id, (error, result) => {
            if(!result){
                repository.create(entity, (error, result) => {
                    callback(error, entity);
                });
            }else{
                repository.update(entity, (error, result) => {
                    callback(error, entity);
                });
            }
        });
    }

}