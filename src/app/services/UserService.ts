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

    public async getUser(username: string): Promise<IUserEntity> {
        const repo: IUserRepository = this._repository;
        const filter: Object = { login: username };
        return repo.findOne(filter);
    }

    public async getUsersPage(page: number, direction: number): Promise<IUserEntity[]> {
        const sort: Object = { created_at: direction };
        return this.getSortedPage(page, sort);
    }

    public async getUsersByNamePage(page: number, direction: number): Promise<IUserEntity[]> {
        const sort: Object = { login: direction };
        return this.getSortedPage(page, sort);
    }

    public async getUsersByPullRequestsPage(page: number, direction: number): Promise<IUserEntity[]> {
        const sort: Object = { pull_request_count: direction };
        return this.getSortedPage(page, sort);
    }

    public async getUsersByReviewsPage(page: number, direction: number): Promise<IUserEntity[]> {
        const sort: Object = { reviews_count: direction };
        return this.getSortedPage(page, sort);
    }

    public async getUsersByReviewsByStatePage(page: number, state: string, direction: number): Promise<IUserEntity[]> {
        let sort: Object;
        if (state.toUpperCase() === "APPROVED") {
            sort = { reviews_approved_count: direction };
        } else if (state.toUpperCase() === "COMMENTED") {
            sort = { reviews_commented_count: direction };
        } else if (state.toUpperCase() === "CHANGES_REQUESTED") {
            sort = { reviews_changes_requested_count: direction };
        } else if (state.toUpperCase() === "DISMISSED") {
            sort = { reviews_dismissed_count: direction };
        } else {
            return [];
        }
        return this.getSortedPage(page, sort);
    }

    public async getUsersByReviewCommentsPage(page: number, direction: number): Promise<IUserEntity[]> {
        const sort: Object = { review_comments_count: direction };
        return this.getSortedPage(page, sort);
    }

    protected async findEntity(entity: IUserEntity): Promise<IUserEntity> {
        return await this._repository.findById(entity.id);
    }

}