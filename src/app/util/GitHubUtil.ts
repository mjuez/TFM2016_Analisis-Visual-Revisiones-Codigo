import * as cheerio from "cheerio";
import * as rp from "request-promise";
import * as GitHubAPI from "@octokit/rest";
import { IEntity } from "../entities/IEntity";
import { IMultiplePersistenceService } from "../services/IPersistenceService";

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
            const options: Object = {
                uri: `https://github.com/${owner}/${repository}`,
                transform: (body: string) => {
                    return cheerio.load(body);
                }
            };
            const $: any = await rp(options);
            const description: any = $("meta[name=\"description\"]").attr("content");
            return description !== undefined;
        } catch (error) {
            return false;
        }
    }

    /**
     * Processes a GitHub page obtained from the API.
     * Builds the entities with obtained data and stores
     * them into database. It processes next pages if
     * there are more.
     *
     * @param page                  A page obtained from
     *                              GitHub API.
     * @param api                   GitHub API wrapper.
     * @param entityArrayHandler    Entity array creator
     *                              handler.
     * @param service               Entity related service.
     * @param updatePageHandler     Handler for updating the
     *                              task current page.
     */
    public static async processPage(page: any, api: GitHubAPI, entityArrayHandler: any,
        service: IMultiplePersistenceService<any>, updatePageHandler: any): Promise<void> {

        const entities: IEntity<any>[] = entityArrayHandler(page.data);
        try {
            await service.createOrUpdateMultiple(entities);
            if (api.hasNextPage(page)) {
                let links: string = page.meta.link;
                let nextPageNumber: number = GitHubUtil.getNextPageNumber(links);
                updatePageHandler(nextPageNumber);
                let nextPage: any = await api.getNextPage(page);
                await GitHubUtil.processPage(nextPage, api, entityArrayHandler, service, updatePageHandler);
            }
        } catch (error) {
            throw error;
        }
    }
}