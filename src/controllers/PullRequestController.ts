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

    /**
     * Retrieves a Pull Request from GitHub given an owner, a repository
     * and a pull request id.
     * It creates (if not exist) or updates the pull request in our database.
     * Then, the pull request object is returned as response.
     * @param req   API request.
     * @param res   API response.
     */
    //retrieve(req: Request, res: Response): void;

    /**
     * Counts Pull Request number from GitHub given an owner and a repository.
     * It creates (if not exist) or updates the pull request in our database.
     * Then, the pull request object is returned as response.
     * @param req   API request.
     * @param res   API response.
     */
    //count(req: Request, res: Response): void;
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
        throw new Error('Method not implemented.');
    }

    /** @inheritdoc */
    getRemote(req: Request, res: Response) {
        throw new Error('Method not implemented.');
    }

    /** @inheritdoc */
    getAllRemote(req: Request, res: Response) {
        throw new Error('Method not implemented.');
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