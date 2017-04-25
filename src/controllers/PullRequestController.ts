import { Router, Request, Response, NextFunction } from "express";
import { IPullRequestService } from "../app/services/PullRequestService";
import { PullRequestDocument } from "../app/entities/documents/PullRequestDocument";
import { IPullRequestEntity, PullRequestEntity } from "../app/entities/PullRequestEntity";
//import * as request from 'request';
import * as mongoose from 'mongoose';
import * as GitHubAPI from 'github';
import * as Promise from 'bluebird';

/**
 * Pull Request controller interface.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IPullRequestController {

    /**
     * Retrieves a Pull Request from GitHub given an owner, a repository
     * and a pull request id.
     * It creates (if not exist) or updates the pull request in our database.
     * Then, the pull request object is returned as response.
     * @param req   API request.
     * @param res   API response.
     */
    retrieve(req: Request, res: Response): void;

    /**
     * Counts Pull Request number from GitHub given an ownerand  a repository.
     * It creates (if not exist) or updates the pull request in our database.
     * Then, the pull request object is returned as response.
     * @param req   API request.
     * @param res   API response.
     */
    count(req: Request, res: Response): void;
}

/**
 * Pull Request controller.
 * Defines Pull Request requests handling.
 * @extends GitHubController.
 * @implements IPullRequestController.
 */
export class PullRequestController implements IPullRequestController {

    /** Pull Request service. */
    private readonly _service: IPullRequestService;

    /**
     * Class constructor. Injects Pull Request service dependency.
     * @param service   Pull Request service.
     */
    constructor(service: IPullRequestService) {
        this._service = service;
    }

    /** @inheritdoc */
    public retrieve(req: Request, res: Response): void {
        let owner: string = req.params.owner;
        let repository: string = req.params.repository;
        let pullRequestId: number = req.params.pull_id;
        let service: IPullRequestService = this._service;
        service.getRemotePullRequest(owner, repository, pullRequestId).then((pull) => {
            service.createOrUpdate(pull).then((savedPull) => {
                res.json(savedPull);
            }).catch((error) => {
                res.json({ "error": error });
            });
        }).catch((error) => {
            res.json({ "error": error });
        });
    }

    /** @inheritdoc */
    public count(req: Request, res: Response): void {
        let owner: string = req.params.owner;
        let repository: string = req.params.repository;
        let service: IPullRequestService = this._service;

        let savePullRequests = (pulls) => {
            service.createOrUpdateMultiple(pulls).then((savedPulls) => {
                res.json({ "count": savedPulls.length });
            }).catch((error) => {
                res.json({ "error": error });
            });
        }

        service.getRemotePullRequests(owner, repository).then((pulls) => {
            savePullRequests(pulls);
        }).catch((rejection) => {
            let pulls = rejection["pull-requests"];
            savePullRequests(pulls);
        });
    }

}