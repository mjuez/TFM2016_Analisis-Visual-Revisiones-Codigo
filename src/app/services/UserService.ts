import { IPersistenceService } from "../services/IPersistenceService";
import { AbstractPersistenceService } from "../services/AbstractPersistenceService";
import { IUserEntity } from "../entities/UserEntity";
import { UserDocument } from "../entities/documents/UserDocument";
import { IUserRepository } from "../data/UserRepository";
import * as math from "mathjs";

/**
 * User service interface.
 * Describes services for getting users in many ways.
 * It also defines services for obtaining user related 
 * data like stats.
 * 
 * @author Mario Juez <mario[at]mjuez.com> 
 */
export interface IUserService extends IPersistenceService<IUserEntity> {

    /**
     * Gets a single user.
     * 
     * @param username  GitHub user login.
     * @returns an user entity.
     */
    getUser(username: string): Promise<IUserEntity>;

    /**
     * Gets an users page.
     * It retrieves a page from ALL users
     * stored in the database without filtering or
     * sorting.
     * 
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of users.
     */
    getUsersPage(page: number, direction?: number): Promise<IUserEntity[]>;

    /**
     * Gets an users page.
     * It retrieves a page from ALL users
     * stored in the database ordered by name (login).
     * 
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of users.
     */
    getUsersByNamePage(page: number, direction?: number): Promise<IUserEntity[]>;

    /**
     * Gets an users page.
     * It retrieves a page from ALL users
     * stored in the database ordered by 
     * number of pull requests created.
     * 
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of users.
     */
    getUsersByPullRequestsPage(page: number, direction?: number): Promise<IUserEntity[]>;

    /**
     * Gets an users page.
     * It retrieves a page from ALL users
     * stored in the database ordered by 
     * number of reviews created.
     * 
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of users.
     */
    getUsersByReviewsPage(page: number, direction?: number): Promise<IUserEntity[]>;

    /**
     * Gets an users page.
     * It retrieves a page from ALL users
     * stored in the database ordered by 
     * number of reviews of specific state created.
     * 
     * @param page      page number.
     * @param state     review state (approved, commented...).
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of users.
     */
    getUsersByReviewsByStatePage(page: number, state: string, direction?: number): Promise<IUserEntity[]>;

    /**
     * Gets an users page.
     * It retrieves a page from ALL users
     * stored in the database ordered by 
     * number of review comments created.
     * 
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of users.
     */
    getUsersByReviewCommentsPage(page: number, direction?: number): Promise<IUserEntity[]>;

    /**
     * Calculates all users statistics means for:
     *  - pull requests.
     *  - reviews.
     *  - review comments.
     * 
     * @returns a JSON object with all statistics.
     */
    getUsersStatsMeans(): Promise<Object>;

    /**
     * Gets a page obtaining handler.
     * 
     * @param type  optional parameter. Can take
     *              values "NAME", "PULLREQUESTS",
     *              "REVIEWS", "REVIEWSSTATE", "REVIEWCOMMENTS".
     * @returns a page obtaining handler.
     */
    getUserPageHandler(type: string): any;

}

/**
 * User service implementation.
 * Describes services for getting users in many ways.
 * It also defines services for obtaining user related 
 * data like stats.
 * 
 * @author Mario Juez <mario[at]mjuez.com> 
 */
export class UserService extends AbstractPersistenceService<IUserRepository, IUserEntity> implements IUserService {

    /**
     * Class constructor with User repository and
     * pull request service dependency injection.
     * 
     * @param repository    Injected User repository.
     */
    constructor(repository: IUserRepository) {
        super(repository);
    }

    /**
     * Gets a single user.
     * 
     * @async
     * @param username  GitHub user login.
     * @returns an user entity.
     */
    public getUser = async (username: string): Promise<IUserEntity> => {
        const repo: IUserRepository = this._repository;
        const filter: Object = { login: username };
        return await repo.findOne(filter);
    }

    /**
     * Gets an users page.
     * It retrieves a page from ALL users
     * stored in the database without filtering or
     * sorting.
     * 
     * @async
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of users.
     */
    public getUsersPage = async (page: number, direction: number): Promise<IUserEntity[]> => {
        return await this.getSortedPage(page, { created_at: direction });
    }

    /**
     * Gets an users page.
     * It retrieves a page from ALL users
     * stored in the database ordered by name (login).
     * 
     * @async
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of users.
     */
    public getUsersByNamePage = async (page: number, direction: number): Promise<IUserEntity[]> => {
        return await this.getSortedPage(page, { login: direction });
    }

    /**
     * Gets an users page.
     * It retrieves a page from ALL users
     * stored in the database ordered by 
     * number of pull requests created.
     * 
     * @async
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of users.
     */
    public getUsersByPullRequestsPage = async (page: number, direction: number): Promise<IUserEntity[]> => {
        return await this.getSortedPage(page, { pull_request_count: direction });
    }

    /**
     * Gets an users page.
     * It retrieves a page from ALL users
     * stored in the database ordered by 
     * number of reviews created.
     * 
     * @async
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of users.
     */
    public getUsersByReviewsPage = async (page: number, direction: number): Promise<IUserEntity[]> => {
        return await this.getSortedPage(page, { reviews_count: direction });
    }

    /**
     * Gets an users page.
     * It retrieves a page from ALL users
     * stored in the database ordered by 
     * number of reviews of specific state created.
     * 
     * @async
     * @param page      page number.
     * @param state     review state (approved, commented...).
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of users.
     */
    public getUsersByReviewsByStatePage = async (page: number, state: string, direction: number): Promise<IUserEntity[]> => {
        let sort: Object;
        const upperCaseState: string = state.toUpperCase();
        switch (upperCaseState) {
            case "APPROVED":
                sort = { reviews_approved_count: direction };
                break;
            case "COMMENTED":
                sort = { reviews_commented_count: direction };
                break;
            case "CHANGES_REQUESTED":
                sort = { reviews_changes_requested_count: direction };
                break;
            case "DISMISSED":
                sort = { reviews_dismissed_count: direction };
                break;
            default:
                return [];
        };
        return await this.getSortedPage(page, sort);
    }

    /**
     * Gets an users page.
     * It retrieves a page from ALL users
     * stored in the database ordered by 
     * number of review comments created.
     * 
     * @async
     * @param page      page number.
     * @param direction optional direction 1 (asc), -1 (desc).
     * @returns a list of users.
     */
    public getUsersByReviewCommentsPage = async (page: number, direction: number): Promise<IUserEntity[]> => {
        return await this.getSortedPage(page, { review_comments_count: direction });
    }

    /**
     * Calculates all users statistics means for:
     *  - pull requests.
     *  - reviews.
     *  - review comments.
     * 
     * @async
     * @returns a JSON object with all statistics.
     */
    public getUsersStatsMeans = async (): Promise<Object> => {
        const repo: IUserRepository = this._repository;
        const select: string = 'pull_request_count reviews_count review_comments_count -_id';
        const entities: IUserEntity[] = await repo.retrieve({ select });
        const pullRequestCounts: number[] = this.getUsersStatsArray(entities, "pull_request_count");
        const reviewCounts: number[] = this.getUsersStatsArray(entities, "reviews_count");
        const reviewCommentCounts: number[] = this.getUsersStatsArray(entities, "review_comments_count");

        const means: Object = {
            pull_request_count: math.ceil(math.mean(pullRequestCounts)),
            reviews_count: math.ceil(math.mean(reviewCounts)),
            review_comments_count: math.ceil(math.mean(reviewCommentCounts))
        };

        return means;
    }

    /**
     * Gets a page obtaining handler.
     * 
     * @param type  optional parameter. Can take
     *              values "NAME", "PULLREQUESTS",
     *              "REVIEWS", "REVIEWSSTATE", "REVIEWCOMMENTS".
     * @returns a page obtaining handler.
     */
    public getUserPageHandler = (type: string = "NONE"): any => {
        switch (type) {
            case "NONE":
                return this.getUsersPage;
            case "NAME":
                return this.getUsersByNamePage;
            case "PULLREQUESTS":
                return this.getUsersByPullRequestsPage;
            case "REVIEWS":
                return this.getUsersByReviewsPage;
            case "REVIEWSSTATE":
                return this.getUsersByReviewsByStatePage;
            case "REVIEWCOMMENTS":
                return this.getUsersByReviewCommentsPage;
        }
    }

    /**
     * Gets a specific field stats from a list
     * of users.
     * 
     * @param users         list of users.
     * @param statsField    field name.
     * @returns an array of stats.
     */
    private getUsersStatsArray(users: IUserEntity[], statsField: string): number[] {
        let array: number[] = users.map((user): number => {
            return user.document[statsField];
        });

        return array;
    }

    /**
     * Finds a persisted user by its id.
     *
     * @async 
     * @param entity    A in-memory user.
     * @returns the persisted user.
     */
    protected async findEntity(entity: IUserEntity): Promise<IUserEntity> {
        return await this._repository.findById(entity.id);
    }

}