import * as cheerio from "cheerio";
import * as rp from "request-promise";

/**
 * GitHub Utilities.
 * @author Mario Juez <mario@mjuez.com>
 */
export class GitHubUtil {

    /**
     * Extracts the next page number from page links string
     * obtained from GitHub API.
     * @param link  all links for navigating pages (first, last, previous, next).
     * @returns the number of the next page or null if there is no next page.
     */
    static getNextPageNumber(link: string): number {
        let regExp: RegExp = /(?:&page=)(\d+)(?:.+"next")/g;
        let results: RegExpExecArray = regExp.exec(link);
        let pageNumber: number = null;
        if (results) {
            const foundGroupNumber: number = 1;
            pageNumber = Number.parseInt(results[foundGroupNumber]);
        }
        return pageNumber;
    }

    static getPullData(pullRequestLink: string): { number: number, owner: string, repository: string } {
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

    static async checkRepository(owner: string, repository: string): Promise<boolean> {
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

}