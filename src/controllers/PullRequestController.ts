import { Router, Request, Response, NextFunction } from "express";
import { IPullRequestService } from "../app/services/PullRequestService";
import { PullRequestDocument } from "../app/entities/documents/PullRequestDocument";
import { IPullRequestEntity, PullRequestEntity } from "../app/entities/PullRequestEntity";
import * as mongoose from "mongoose";
import * as GitHubAPI from "github";
import * as Promise from "bluebird";

/**
 * Pull Request controller interface.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IPullRequestController {

    /**
     * Gets a Pull Request stored locally given an owner, a repository
     * and a pull request id.
     * @param req   API request.
     * @param res   API response.
     */
    get(req: Request, res: Response);

    /**
     * Gets all Pull Requests stored locally given an owner
     * and a repository.
     * @param req   API request.
     * @param res   API response.
     */
    getAll(req: Request, res: Response);

    /**
     * Gets the number of Pull Requests stored locally given an owner
     * and a repository.
     * @param req   API request.
     * @param res   API response.
     */
    getCount(req: Request, res: Response);

    /**
     * Gets a remote Pull Request given an owner, a repository
     * and a pull request id.
     * @param req   API request.
     * @param res   API response.
     */
    getRemote(req: Request, res: Response);

    /**
     * Gets all remote Pull Requests given an owner and a repository.
     * @param req   API request.
     * @param res   API response.
     */
    getAllRemote(req: Request, res: Response);
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
    get(req: Request, res: Response) {
        let owner: string = req.params.owner;
        let repository: string = req.params.repository;
        let pullRequestId: number = req.params.pull_id;
        let service: IPullRequestService = this._service;

        service.getLocalPullRequest(owner, repository, pullRequestId).then((pull) => {
            res.json(pull);
        }).catch((error) => {
            res.json({ "error": error });
        });
    }

    /** @inheritdoc */
    getAll(req: Request, res: Response) {
        let owner: string = req.params.owner;
        let repository: string = req.params.repository;
        let service: IPullRequestService = this._service;

        service.getLocalPullRequests(owner, repository).then((pulls) => {
            res.json(pulls);
        }).catch((error) => {
            res.json({ "error": error });
        });
    }

    /** @inheritdoc */
    getCount(req: Request, res: Response) {
        let owner: string = req.params.owner;
        let repository: string = req.params.repository;
        let service: IPullRequestService = this._service;

        service.getLocalPullRequests(owner, repository).then((pulls) => {
            res.json({ "count": pulls.length });
        }).catch((error) => {
            res.json({ "error": error });
        });
    }

    /** @inheritdoc */
    getRemote(req: Request, res: Response) {
        let owner: string = req.params.owner;
        let repository: string = req.params.repository;
        let pullRequestId: number = req.params.pull_id;
        let service: IPullRequestService = this._service;

        res.json({ status: `started obtaining remote pull request at: ${new Date()}` });

        service.getRemotePullRequest(owner, repository, pullRequestId).then((pull) => {
            service.createOrUpdate(pull).then(() => {
                console.log(`finished obtaining remote pull request at: ${new Date()}`);
            });
        }).catch((error) => {
            console.log(error); // logging ? 
        });
    }

    /** @inheritdoc */
    getAllRemote(req: Request, res: Response) {
        let owner: string = req.params.owner;
        let repository: string = req.params.repository;
        let pullRequestId: number = req.params.pull_id;
        let service: IPullRequestService = this._service;

        res.json({ status: `started obtaining all remote pull requests at: ${new Date()}` });

        service.getRemotePullRequests(owner, repository).then((pulls) => {
            service.createOrUpdateMultiple(pulls).then(() => {
                console.log(`finished obtaining all remote pull requests at: ${new Date()}`);
            });
        }).catch((error) => {
            console.log(error); // logging ? 
        });
    }

}