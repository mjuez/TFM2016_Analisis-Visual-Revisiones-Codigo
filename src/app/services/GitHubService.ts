import { IApiService } from "./IApiService";
import * as GitHubAPI from "github";
import * as Promise from "bluebird";

/**
 * GitHub API services.
 * @author Mario Juez <mario@mjuez.com>
 */
export abstract class GitHubService implements IApiService<GitHubAPI>{

    /** GitHub API wrapper. */
    private readonly _api: GitHubAPI;

    /** GitHub API wrapper options. */
    private readonly _API_OPTIONS: Object = {
        debug: false,
        protocol: "https",
        host: `api.github.com`,
        pathPrefix: ``,
        headers: {
            "user-agent": process.env.ANVIRECO_APPNAME
        },
        Promise: Promise,
        followRedirects: false,
        timeout: 5000
    };

    /** GitHub API authentication (using developer applications) */
    private readonly _API_AUTHENTICATION: GitHubAPI.Auth = <GitHubAPI.AuthOAuthSecret>{
        type: `oauth`,
        key: process.env.ANVIRECO_ID,
        secret: process.env.ANVIRECO_SECRET
    };

    /**
     * Creates the API wrapper and authenticates to it.
     */
    constructor() {
        this._api = new GitHubAPI(this._API_OPTIONS);
        this._api.authenticate(this._API_AUTHENTICATION);
    }

    /** Gets the GitHub API wrapper. */
    get API(): GitHubAPI {
        return this._api;
    }

}