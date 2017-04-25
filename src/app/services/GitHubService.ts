import { IApiService } from './IApiService';
import * as GitHubAPI from 'github';
import * as Promise from 'bluebird';

export abstract class GitHubService implements IApiService<GitHubAPI>{

    private readonly _api: GitHubAPI;

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

    private readonly _API_AUTHENTICATION: GitHubAPI.Auth = <GitHubAPI.AuthOAuthSecret>{
        type: `oauth`,
        key: process.env.ANVIRECO_ID,
        secret: process.env.ANVIRECO_SECRET
    };

    constructor() {
        this._api = new GitHubAPI(this._API_OPTIONS);
        this._api.authenticate(this._API_AUTHENTICATION);
    }

    get API(): GitHubAPI {
        return this._api;
    }

}