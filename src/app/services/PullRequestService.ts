import { IService } from "../services/IService";
import { IPullRequestEntity } from "../entities/PullRequestEntity";
import { IPullRequestRepository } from "../data/PullRequestRepository";

export interface IPullRequestService extends IService<IPullRequestEntity> { }

export class PullRequestService implements IPullRequestService {

    private readonly _repository: IPullRequestRepository;

    constructor(repository: IPullRequestRepository){
        this._repository = repository;
    }

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