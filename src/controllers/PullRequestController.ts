import { Router, Request, Response, NextFunction } from 'express';
import { AbstractController } from './AbstractController';
import { PullRequestDocument } from "../models/documents/PullRequestDocument";
import { PullRequestEntity } from "../models/PullRequestEntity";
import { PullRequestRepository } from "../data/PullRequestRepository";
import * as request from 'request';
import * as mongoose from 'mongoose';

export class PullRequestController extends AbstractController {

    private readonly _repository: PullRequestRepository;

    constructor(repository) {
        super();
        this._repository = repository;
        this.init();
    }

    protected init(): void {
        this.router.get('/owner/:owner/repo/:repository/pull/:pullId',
            (req: Request, res: Response, callback: NextFunction) => {
                this.handlePullRequestRequest(req, res, callback);
            });
    }

    private handlePullRequestRequest(req: Request, res: Response, callback: NextFunction) {

        let pullRequestId: string = req.params.pullId;
        let owner: string = req.params.owner;
        let repository: string = req.params.repository;

        let uri: string = `${this.API_URL}/repos/${owner}/${repository}/pulls/${pullRequestId}?${this.API_CREDENTIALS}`;

        let requestOptions: request.CoreOptions = {
            headers: this.API_HEADERS
        }

        request(uri, requestOptions, (error: any, response: request.RequestResponse, body: any) => {
            if (error) {
                callback(error);
            } else {
                if (response.statusCode === 200) {
                    let bodyObject = JSON.parse(body);
                    let pullRequest = new PullRequestEntity(<PullRequestDocument>bodyObject);
                    this._repository.create(pullRequest, (error, response) => {
                        callback(body);
                    });
                }
            }
        });
    }
}