import { IPersistenceService } from "../services/IPersistenceService";
import { AbstractPersistenceService } from "../services/AbstractPersistenceService";
import { IUserEntity, UserEntity } from "../entities/UserEntity";
import { UserDocument } from "../entities/documents/UserDocument";
import { IUserRepository } from "../data/UserRepository";

/**
 * IUserService interface.
 * Describes specific functionality for User entities.
 * @author Mario Juez <mario@mjuez.com> 
 */
export interface IUserService extends IPersistenceService<IUserEntity> {

    getUser(username: string): Promise<IUserEntity>;
    getUsersPage(page: number, direction: number): Promise<IUserEntity[]>;
    getUsersByNamePage(page: number, direction: number): Promise<IUserEntity[]>;
    getUsersByPullRequestsPage(page: number, direction: number): Promise<IUserEntity[]>;
    getUsersByReviewsPage(page: number, direction: number): Promise<IUserEntity[]>;
    getUsersByReviewsByStatePage(page: number, state: string, direction: number): Promise<IUserEntity[]>;
    getUsersByReviewCommentsPage(page: number, direction: number): Promise<IUserEntity[]>;

}

/**
 * User services.
 * @author Mario Juez <mario@mjuez.com>
 */
export class UserService extends AbstractPersistenceService<IUserRepository, IUserEntity, UserDocument> implements IUserService {

    /**
     * Class constructor with User repository and
     * pull request service dependency injection.
     * @param repository    Injected User repository.
     */
    constructor(repository: IUserRepository) {
        super(repository);
    }

    protected async findEntity(entity: IUserEntity): Promise<IUserEntity> {
        return await this._repository.findById(entity.id);
    }

}