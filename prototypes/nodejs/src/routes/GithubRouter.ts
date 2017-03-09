import { Router, Request, Response, NextFunction } from 'express';
import * as request from 'request';

interface PullsIdsCallback {
    (ids: number[]): void
}

export class GithubRouter {

    router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    public getNumReviews(req: Request, res: Response, next: NextFunction) {
        let owner = req.params.owner;
        let repo = req.params.repo;
        let promises = new Array<Promise<void>>();
        let numReviews = 0;

        GithubRouter.getPullRequestsIds(owner, repo, (ids) => {
            ids.forEach((id) => {
                let promise = new Promise<void>((resolve, reject) => {
                    let options = {
                        url: `https://api.github.com/repos/${owner}/${repo}/pulls/${id}/reviews`,
                        headers: {
                            "User-Agent": `mjuez`,
                            "Accept": `application/vnd.github.black-cat-preview+json`
                        }
                    };

                    request(options, (error, response, body) => {
                        if (response.statusCode === 200) {
                            let reviews = JSON.parse(body);
                            numReviews += Array.from(reviews).length;
                            resolve();
                        }
                    });
                });
                promises.push(promise);
            });
        });
        Promise.all(promises).then(() => {
            let jsonResponse = {
                numReviews: numReviews
            }
            res.status(200).json(jsonResponse);
        });
    }

    private static getPullRequestsIds(owner: string, repo: string, callback: PullsIdsCallback) {
        let options = {
            url: `https://api.github.com/repos/${owner}/${repo}/pulls`,
            headers: {
                "User-Agent": `mjuez`,
            }
        };

        request(options, (error, response, body) => {
            if (!error) {
                let json = JSON.parse(body);
                let ids = new Array<number>();
                Array.from(json).forEach((pull) => {
                    ids.push(pull["id"]);
                });
                callback(ids);
            }
        });
    }

    private init() {
        this.router.get('/owner/:owner/repo/:repo/numreviews', this.getNumReviews);
    }

}

export default new GithubRouter().router;