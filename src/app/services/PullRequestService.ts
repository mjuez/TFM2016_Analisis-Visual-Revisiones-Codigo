import { IService } from "../services/IService";
import { IPullRequestEntity, PullRequestEntity } from "../entities/PullRequestEntity";
import { PullRequestDocument } from "../entities/documents/PullRequestDocument";
import { IPullRequestRepository } from "../data/PullRequestRepository";

/**
 * IPullRequestService interface.
 * Describes specific functionality for Pull Request entities.
 * @author Mario Juez <mario@mjuez.com> 
 */
export interface IPullRequestService extends IService<IPullRequestEntity> {
    /**
     * Transforms raw data to IPullRequestEntity.
     * @param data  raw data.
     */
    toEntity(data: any): IPullRequestEntity;
    
    /**
     * Transforms raw data to IPullRequestEntity array.
     * @param dataArray raw data.
     */
    toEntityArray(dataArray: any[]): IPullRequestEntity[];
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
     * @param callback  optional callback function to retrieve the created/updated
     *                  Pull Request (or an error if something goes wrong).
     */
    public createOrUpdate(entity: IPullRequestEntity, callback: (err: any, result: IPullRequestEntity) => void): void {
        let repository: IPullRequestRepository = this._repository;
        repository.findOneByPullId(entity.id, (error, result) => {
            if (!result) {
                repository.create(entity, (error, result) => {
                    callback(error, entity);
                });
            } else {
                repository.update(entity, (error, result) => {
                    callback(error, entity);
                });
            }
        });
    }

    /**
     * Saves or updates many Pull Requests into database.
     * @param entity    a Pull Request array.
     * @param callback  optional callback function to retrieve the created/updated
     *                  Pull Request array (or an error if something goes wrong).
     */
    public createOrUpdateMultiple(entities: IPullRequestEntity[], callback: (err: any, result: IPullRequestEntity[]) => void): void {

        let mapPromise: Promise<IPullRequestEntity[]> = new Promise<IPullRequestEntity[]>((resolve, reject) => {
            let entitiesResult: IPullRequestEntity[];
            entities.map((entity) => {
                this.createOrUpdate(entity, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        let lenght: number = entitiesResult.push(result);
                        if (length === entities.length) {
                            resolve(entitiesResult);
                        }
                    }
                });
            });
        });

        mapPromise.then((entitiesResult) => {
            callback(null, entitiesResult);
        });

        mapPromise.catch((error) => {
            callback(error, null);
        });
    }

    /** @inheritdoc */
    public toEntity(data: any): IPullRequestEntity {
        let jsonObject: Object = JSON.parse(data);
        let entity: IPullRequestEntity = new PullRequestEntity(<PullRequestDocument>jsonObject);
        return entity;
    }

    /** @inheritdoc */
    public toEntityArray(dataArray: any[]): IPullRequestEntity[] {
        let entityArray: IPullRequestEntity[] = dataArray.map<IPullRequestEntity>((data) => this.toEntity(data));
        return entityArray;
    }

}