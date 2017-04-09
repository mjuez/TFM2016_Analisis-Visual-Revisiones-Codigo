import { Router, Request, Response, NextFunction } from 'express';
import { AbstractController } from './AbstractController';
import { IPullRequestDocument, IPullRequestSchema } from '../model/IPullRequestModel';
export { IPullRequestDocument, IPullRequestSchema };
import * as request from 'request';
import * as mongoose from 'mongoose';

export class PullRequestController extends AbstractController {

    PullRequestModel: mongoose.Model<IPullRequestDocument>;

    constructor(PullRequestModel) {
        super();
        this.PullRequestModel = PullRequestModel;
        this.init();
    }

    public save(pullRequest: Object) {
        const pullRequestModel = new this.PullRequestModel(pullRequest);
        pullRequestModel.save((error) => {
            if (error) {
                console.log(error);
            }
        });
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
            headers: {
                "User-Agent": `anvireco`, //hardcoded string
            }
        }

        request(uri, requestOptions, (error: any, response: request.RequestResponse, body: any) => {
            if (error) {
                callback(error);
            } else {
                if (response.statusCode === 200) {
                    this.save(JSON.parse(body));
                }
                callback();
            }
        });
    }
}