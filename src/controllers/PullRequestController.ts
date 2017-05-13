import { Router, Request, Response, NextFunction } from "express";
import { IPullRequestService } from "../app/services/PullRequestService";
import { IReviewService } from "../app/services/ReviewService";
import { ITaskManagerService, TaskManagerService } from "../app/services/TaskManagerService";
import { PullRequestDocument } from "../app/entities/documents/PullRequestDocument";
import { IPullRequestEntity, PullRequestEntity } from "../app/entities/PullRequestEntity";
import * as mongoose from "mongoose";
import * as GitHubAPI from "github";
import * as BluebirdPromise from "bluebird";

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

    getReviews(req: Request, res: Response);

    /**
     * Gets a remote Pull Request given an owner, a repository
     * and a pull request id.
     * @param req   API request.
     * @param res   API response.
     */
    //getRemote(req: Request, res: Response);

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

    /** Task Manager service. */
    private readonly _taskManagerService: ITaskManagerService;

    /** Task Manager service. */
    private readonly _reviewService: IReviewService;

    /**
     * Class constructor. Injects Pull Request service dependency.
     * @param service   Pull Request service.
     */
    constructor(service: IPullRequestService, taskManagerService: ITaskManagerService, reviewService: IReviewService) {
        this._service = service;
        this._taskManagerService = taskManagerService;
        this._reviewService = reviewService;
    }

    /** @inheritdoc */
    get(req: Request, res: Response) {
        let owner: string = req.params.owner;
        let repository: string = req.params.repository;
        let pullRequestId: number = req.params.pull_number;
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
    public async getReviews(req: Request, res: Response) {
        let owner: string = req.params.owner;
        let repository: string = req.params.repository;
        let pullNumber: number = req.params.pull_number;
        let service: IReviewService = this._reviewService;

        try {
            let reviews: any = await service.getPullRequestLocalReviews(owner, repository, pullNumber);
            res.json(reviews);
        } catch (error) {
            res.json({ "error": error });
        }
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

    /** @inheritdoc 
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
    }*/

    /** @inheritdoc */
    public async getAllRemote(req: Request, res: Response) {
        let owner: string = req.params.owner;
        let repository: string = req.params.repository;
        let service: ITaskManagerService = this._taskManagerService;

        let created: boolean = await service.createTask(owner, repository);
        if (created) {
            res.json({ message: "task created successfully." });
        } else {
            res.json({ error: "error creating task, try again later." });
        }
    }

}