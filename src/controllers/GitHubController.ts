import { CoreOptions, RequestResponse } from "request";
import { Response } from "express";

export interface RequestData {
    response: RequestResponse,
    body: any
}

export interface IGitHubController {
    API_URL: string,
    API_CREDENTIALS: string,
    API_OPTIONS: CoreOptions,
}

export abstract class GitHubController implements IGitHubController{

    private readonly _API_URL: string = `https://api.github.com`;
    private readonly _API_CREDENTIALS: string = `?client_id=${process.env.ANVIRECO_ID}&client_secret=${process.env.ANVIRECO_SECRET}`;
    private readonly _API_OPTIONS: CoreOptions = {
        headers: {
            "User-Agent": process.env.ANVIRECO_APPNAME
        }
    }

    constructor() { }

    get API_URL(): string {
        return this._API_URL;
    }

    get API_CREDENTIALS(): string {
        return this._API_CREDENTIALS;
    }

    get API_OPTIONS(): CoreOptions {
        return this._API_OPTIONS;
    }

    protected handleResponse(reqData: RequestData, expressResponse: Response, ok: { (): void }): void {
        let res: RequestResponse = reqData.response;
        let body: Object = JSON.parse(reqData.body);

        if (res.statusCode === 200) {
            ok();
        } else {
            let errorBody: Object = {
                "status-code": res.statusCode,
                "message": body["message"]
            };
            expressResponse.send(errorBody);
        }
    }

}