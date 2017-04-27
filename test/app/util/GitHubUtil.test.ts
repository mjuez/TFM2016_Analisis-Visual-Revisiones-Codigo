import * as mocha from "mocha";
import * as chai from "chai";
import { GitHubUtil } from "../../../src/app/util/GitHubUtil";

const expect: Chai.ExpectStatic = chai.expect;

describe("Checking GitHub utilities", () => {

    it("Next page should be 3", () => {
        let links: string = '<https://api.github.com/repositories/69180490/pulls?state=all&direction=asc&per_page=1&client_id=d58e96437dfb78656f9d&client_secret=9e5143a55d5995ee0e0f69f8c44927a500fa6602&page=3>; rel="next", <https://api.github.com/repositories/69180490/pulls?state=all&direction=asc&per_page=1&client_id=d58e96437dfb78656f9d&client_secret=9e5143a55d5995ee0e0f69f8c44927a500fa6602&page=3>; rel="last", <https://api.github.com/repositories/69180490/pulls?state=all&direction=asc&per_page=1&client_id=d58e96437dfb78656f9d&client_secret=9e5143a55d5995ee0e0f69f8c44927a500fa6602&page=1>; rel="first", <https://api.github.com/repositories/69180490/pulls?state=all&direction=asc&per_page=1&client_id=d58e96437dfb78656f9d&client_secret=9e5143a55d5995ee0e0f69f8c44927a500fa6602&page=1>; rel="prev"';
        let nextPage: number = GitHubUtil.getNextPageNumber(links);
        expect(nextPage).to.be.equal(3);
    });

    it("No next page should be found", () => {
        let links: string = '<https://api.github.com/repositories/69180490/pulls?state=all&direction=asc&per_page=1&client_id=d58e96437dfb78656f9d&client_secret=9e5143a55d5995ee0e0f69f8c44927a500fa6602&page=1>; rel="first", <https://api.github.com/repositories/69180490/pulls?state=all&direction=asc&per_page=1&client_id=d58e96437dfb78656f9d&client_secret=9e5143a55d5995ee0e0f69f8c44927a500fa6602&page=2>; rel="prev"';
        let nextPage: number = GitHubUtil.getNextPageNumber(links);
        expect(nextPage).to.be.null;
    });

})