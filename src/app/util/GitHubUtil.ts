import * as cheerio from "cheerio";
import * as rp from "request-promise";
import { IUserRepository } from "../data/UserRepository";
import { IUserEntity, UserEntity } from "../entities/UserEntity";
import { IUserService } from "../services/UserService";
import * as GitHubAPI from "github";

/**
 * Get user parameters interface.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface GetUserParams {
    
    /** User login. */
    username: string,

    /** User repository. */
    userRepo: IUserRepository,

    /** User Service. */
    userService: IUserService,

    /** Task id. */
    taskId: any,

    /** Function handler for stats calculation. */
    statsHandler: any,

    /** Function handler for errors. */
    errorHandler: any,

    /** GitHub API. */
    api: GitHubAPI
}

/**
 * GitHub Utilities.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class GitHubUtil {

    /**
     * Extracts the next page number from page links string
     * obtained from GitHub API.
     * 
     * @param link  all links for navigating pages (first, last, previous, next).
     * @returns the number of the next page or null if there is no next page.
     */
    public static getNextPageNumber(link: string): number {
        let regExp: RegExp = /(?:[&?]page=)(\d+)(?:.+"next")/g;
        let results: RegExpExecArray = regExp.exec(link);
        let pageNumber: number = null;
        if (results) {
            const foundGroupNumber: number = 1;
            pageNumber = Number.parseInt(results[foundGroupNumber]);
        }
        return pageNumber;
    }

    /**
     * Gets pull request data from API link.
     * Three fields are obtained:
     *  - Pull Request Number.
     *  - Repository owner.
     *  - Repository name.
     * 
     * @param pullRequestLink   link string.
     * @returns an object containing the three fields.
     */
    public static getPullData(pullRequestLink: string): { number: number, owner: string, repository: string } {
        let regExp: RegExp = /(?:\/repos\/)([a-zA-Z0-9_.-]*)(?:\/)([a-zA-Z0-9_.-]*)(?:\/pulls\/)([0-9]+)/g;
        let results: RegExpExecArray = regExp.exec(pullRequestLink);
        if (results) {
            const ownerGroup: number = 1;
            const repoGroup: number = 2;
            const numberGroup: number = 3;
            return {
                number: Number.parseInt(results[numberGroup]),
                owner: results[ownerGroup],
                repository: results[repoGroup]
            };
        }
        return null;
    }

    /**
     * Checks if a repository exists in GitHub database.
     * This method does not consume any GitHub API request.
     * It obtains the HTML response of the request to a
     * GitHub repository page.
     * If the response contains the description META TAG
     * means that the repository exists and is not a 404
     * error page.
     * 
     * @async
     * @param owner         Repository owner login.
     * @param repository    Repository name.
     * @returns if the repository exists.
     */
    public static async checkRepository(owner: string, repository: string): Promise<boolean> {
        try {
            const options = {
                uri: `https://github.com/${owner}/${repository}`,
                transform: (body: string) => {
                    return cheerio.load(body);
                }
            };
            const $ = await rp(options);
            const description = $('meta[name="description"]').attr('content');
            return description != undefined;
        } catch (error) {
            return false;
        }
    }

    /**
     * Gets an user from GitHub for save or update it.
     * If an user was retrieved before in the same task
     * it wont be retrieved again.
     * After getting an user, its stats should be updated.
     * 
     * @async
     * @param params Needed parameters for getting the user:
     *  - username
     *  - user repository
     *  - user service
     *  - task id
     *  - stats handler
     *  - error handler
     *  - api dependency
     */
    public static async processUser(params: GetUserParams): Promise<void> {
        if(params.username === undefined) return;
        try {
            const foundUser: IUserEntity = await params.userRepo.findOne({
                login: params.username,
                updated_on_task: params.taskId
            });
            if (foundUser === null) {
                let user: IUserEntity = await GitHubUtil.makeUserApiCall(params.username, params.api);
                user.document.updated_on_task = params.taskId;
                await params.userService.createOrUpdate(user);
            }
            await params.statsHandler(params.username);
        } catch (error) {
            params.errorHandler(error);
            throw error;
        }
    }

    /**
     * Makes a call to GitHub API to retrieve an user.
     * 
     * @async
     * @param username  User login.
     * @param api       GitHub API dependency.
     * @returns user entity.
     */
    private static async makeUserApiCall(username: string, api: GitHubAPI): Promise<IUserEntity> {
        try {
            let userData: any = await api.users.getForUser(<GitHubAPI.Username>{ username });
            console.log(`[${new Date()}] - Getting user @${username}, remaining reqs: ${userData.meta['x-ratelimit-remaining']}`);
            return UserEntity.toEntity(userData.data);
        } catch (error) {
            throw error;
        }
    }

}