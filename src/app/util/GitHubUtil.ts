export class GitHubUtil {

    static getNextPageNumber(link: string): number {
        let regExp: RegExp = /(?:&page=)(\d+)(?:.+"next")/g;
        let results: RegExpExecArray = regExp.exec(link);
        let foundGroupNumber: number = 1;
        let pageNumber: number = Number.parseInt(results[foundGroupNumber]);
        console.log(pageNumber);
        return pageNumber;
    }

}