import { Router, Request, Response, NextFunction } from "express";
import { IGitHubController, GitHubController, RequestData } from "./GitHubController";
import { IPullRequestService } from "../app/services/PullRequestService";
import { PullRequestDocument } from "../app/entities/documents/PullRequestDocument";
import { IPullRequestEntity, PullRequestEntity } from "../app/entities/PullRequestEntity";
import * as request from 'request';
import * as mongoose from 'mongoose';

export interface IPullRequestController extends IGitHubController {
    retrieve(req: Request, res: Response): void;
}

export class PullRequestController extends GitHubController implements IPullRequestController {

    private readonly _service: IPullRequestService;

    constructor(service: IPullRequestService) {
        super();
        this._service = service;
    }

    public retrieve(req: Request, res: Response): void {
        let owner: string = req.params.owner;
        let repository: string = req.params.repository;
        let pullRequestId: string = req.params.pull_id;
        let uri: string = `${this.API_URL}/repos/${owner}/${repository}/pulls/${pullRequestId}?${this.API_CREDENTIALS}`;

        request(uri, this.API_OPTIONS, (error: any, response: request.RequestResponse, body: any) => {
            if (error) {
                res.send({ "error": error });
            } else {
                let reqData: RequestData = {
                    response: response,
                    body: body
                }
                this.handleResponse(reqData, res, () => {
                    let bodyObject: Object = JSON.parse(body);
                    let pullRequest: IPullRequestEntity = new PullRequestEntity(<PullRequestDocument>bodyObject);
                    this._service.createOrUpdate(pullRequest, (err: any, result: IPullRequestEntity) => {
                        if (!err) {
                            res.send(result.document);
                        } else {
                            res.send({ "error": err });
                        }
                    });
                });
            }
        });
    }

}