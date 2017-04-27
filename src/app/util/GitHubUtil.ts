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
            let foundGroupNumber: number = 1;
            pageNumber = Number.parseInt(results[foundGroupNumber]);
        }
        return pageNumber;
    }

}