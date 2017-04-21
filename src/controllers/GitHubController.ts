import { CoreOptions, RequestResponse } from "request";
import { Response } from "express";

/**
 * IGitHubController interface.
 * Every GitHub controller instance will need the github API URL,
 * the API credentials to get up to 5000 requests per hour, and
 * each call to the API must especify an user or application name
 * in the request headers.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IGitHubController {

    /** Gets GitHub API URL. */
    API_URL: string,

    /** Gets GitHub API credentials. */
    API_CREDENTIALS: string,

    /** Gets GitHub API options (request header).  */
    API_OPTIONS: CoreOptions,
}

/**
 * Abstract GitHub controller class.
 * Defines shared functionality for all descendant GitHub controllers.
 * @author Mario Juez <mario@mjuez.com>
 */
export abstract class GitHubController implements IGitHubController {

    /** GitHub API URL. */
    private readonly _API_URL: string = `https://api.github.com`;

    /** GitHub API credentials. */
    private readonly _API_CREDENTIALS: string = `?client_id=${process.env.ANVIRECO_ID}&client_secret=${process.env.ANVIRECO_SECRET}`;
    
    /** GitHub API credentials. */
    private readonly _API_OPTIONS: CoreOptions = {
        headers: {
            "User-Agent": process.env.ANVIRECO_APPNAME
        }
    }

    /** @inheritdoc */
    get API_URL(): string {
        return this._API_URL;
    }

    /** @inheritdoc */
    get API_CREDENTIALS(): string {
        return this._API_CREDENTIALS;
    }

    /** @inheritdoc */
    get API_OPTIONS(): CoreOptions {
        return this._API_OPTIONS;
    }

    /**
     * Handles the response of a call to GitHub API.
     * If we get a correct response (status = 200), then we
     * let the descendant handle the result with ok template
     * method.
     * If the response is bad (status != 200), for example if
     * we've run out of requests to the API, the response body
     * will contain an error message which will be returned by
     * our API.
     * @param res               GitHub API call response. 
     * @param expressResponse   Our API response (expressjs).
     * @param ok                Template method for handling
     *                          good responses.
     */
    protected handleResponse(res: RequestResponse, expressResponse: Response, ok: { (): void }): void {
        let body: Object = JSON.parse(res.body);

        if (res.statusCode === 200) {
            ok();
        } else {
            let errorBody: Object = {
                "status-code": res.statusCode,
                "message": body["message"]
            };
            expressResponse.json(errorBody);
        }
    }

}