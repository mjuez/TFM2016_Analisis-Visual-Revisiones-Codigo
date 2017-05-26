import { Router, Request, Response, NextFunction } from "express";
import { AbstractController } from "./AbstractController";
import { IPullRequestService } from "../app/services/PullRequestService";
import { IRepositoryService } from "../app/services/RepositoryService";
import { IReviewService } from "../app/services/ReviewService";
import { ITaskManagerService } from "../app/services/TaskManagerService";
import { PullRequestDocument } from "../app/entities/documents/PullRequestDocument";
import { IPullRequestEntity, PullRequestEntity } from "../app/entities/PullRequestEntity";
import { IRepositoryEntity } from "../app/entities/RepositoryEntity";
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

    getCreatedAllTime(req: Request, res: Response);

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
export class PullRequestController extends AbstractController implements IPullRequestController {

    /** @inheritdoc */
    get(req: Request, res: Response) {
        let owner: string = req.params.owner;
        let repository: string = req.params.repository;
        let pullRequestId: number = req.params.pull_number;
        let service: IPullRequestService = this._services.pull;

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
        let service: IPullRequestService = this._services.pull;

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
        let service: IReviewService = this._services.review;

        try {
            let reviews: any = await service.getPullRequestLocalReviews(owner, repository, pullNumber);
            res.json(reviews);
        } catch (error) {
            res.status(500).json({ message: "Oops, something went wrong." });
        }
    }

    /** @inheritdoc */
    public async getCreatedAllTime(req: Request, res: Response) {
        let owner: string = req.params.owner;
        let repository: string = req.params.repository;
        let pullService: IPullRequestService = this._services.pull;
        let repoService: IRepositoryService = this._services.repo;

        try {
            let repo: IRepositoryEntity = await repoService.getRepository(owner, repository);
            let dates: any = {
                start: repo.document.created_at,
                end: repo.document.pushed_at
            }
            let counts: number[] = await pullService.getCreatedAllTimeStats(owner, repository, dates);
            res.json(counts);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Oops, something went wrong." });
        }
    }

    /** @inheritdoc */
    getCount(req: Request, res: Response) {
        let owner: string = req.params.owner;
        let repository: string = req.params.repository;
        let service: IPullRequestService = this._services.pull;

        service.getLocalPullRequests(owner, repository).then((pulls) => {
            res.json({ "count": pulls.length });
        }).catch((error) => {
            res.json({ "error": error });
        });
    }

    /** @inheritdoc */
    public async getAllRemote(req: Request, res: Response) {
        let owner: string = req.params.owner;
        let repository: string = req.params.repository;
        let service: ITaskManagerService = this._services.taskManager;

        let created: boolean = await service.createTask(owner, repository);
        if (created) {
            res.json({ message: "task created successfully." });
        } else {
            res.status(500).json({ message: "Oops, something went wrong." });
        }
    }

}