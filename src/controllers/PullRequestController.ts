import { Router, Request, Response, NextFunction } from "express";
import { AbstractController } from "./AbstractController";
import { IPullRequestService } from "../app/services/PullRequestService";
import { IRepositoryService } from "../app/services/RepositoryService";
import { IReviewService } from "../app/services/ReviewService";
import { ITaskManagerService } from "../app/services/TaskManagerService";
import { IStatsService } from "../app/services/StatsService";
import { PullRequestDocument } from "../app/entities/documents/PullRequestDocument";
import { IPullRequestEntity, PullRequestEntity } from "../app/entities/PullRequestEntity";
import { IRepositoryEntity } from "../app/entities/RepositoryEntity";
import { EntityUtil } from "../app/util/EntityUtil";
import { RoutesUtil } from "../app/util/RoutesUtil";
import * as mongoose from "mongoose";
import * as GitHubAPI from "github";
import * as BluebirdPromise from "bluebird";

/**
 * Pull Request controller interface.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IPullRequestController {

    get(req: Request, res: Response): Promise<void>;
    getPage(req: Request, res: Response): Promise<void>;
    getByNamePage(req: Request, res: Response): Promise<void>;
    getByReviewsPage(req: Request, res: Response): Promise<void>;
    getPageFromRepository(req: Request, res: Response): Promise<void>;
    getByNamePageFromRepository(req: Request, res: Response): Promise<void>;
    getByReviewsPageFromRepository(req: Request, res: Response): Promise<void>;
    getAllTimeStatsByUser(req: Request, res: Response): Promise<void>;
    getAllTimeStatsByRepository(req: Request, res: Response): Promise<void>;

}

/**
 * Pull Request controller.
 * Defines Pull Request requests handling.
 * @extends GitHubController.
 * @implements IPullRequestController.
 */
export class PullRequestController extends AbstractController implements IPullRequestController {

    public async get(req: Request, res: Response): Promise<void> {
        const service: IPullRequestService = this._services.pull;
        const owner: string = req.params.owner;
        const repository: string = req.params.repository;
        const number: number = req.params.number;

        try {
            const pull: IPullRequestEntity = await service.getPullRequest(owner, repository, number);
            const json: Object = EntityUtil.toJSON(pull);
            res.json(json);
        } catch (error) {
            res.status(500).json({ message: "Oops, something went wrong." });
        }
    }

    public async getPage(req: Request, res: Response): Promise<void> {
        const service: IPullRequestService = this._services.pull;
        await this.getOrderedPage(req, res, service, handler);

        async function handler(page: number, direction: number): Promise<IPullRequestEntity[]>{
            return service.getPullRequestsPage(page, direction);
        }
    }

    public async getByNamePage(req: Request, res: Response): Promise<void> {
        const service: IPullRequestService = this._services.pull;
        await this.getOrderedPage(req, res, service, handler);

        async function handler(page: number, direction: number): Promise<IPullRequestEntity[]>{
            return service.getPullRequestsByNamePage(page, direction);
        }
    }

    public async getByReviewsPage(req: Request, res: Response): Promise<void> {
        const service: IPullRequestService = this._services.pull;
        await this.getOrderedPage(req, res, service, handler);

        async function handler(page: number, direction: number): Promise<IPullRequestEntity[]>{
            return service.getPullRequestsByReviewsPage(page, direction);
        }
    }

    public async getPageFromRepository(req: Request, res: Response): Promise<void> {
        const service: IPullRequestService = this._services.pull;
        await this.getOrderedPageFromRepository(req, res, handler);

        async function handler(owner: string, repository: string, page: number, direction: number): Promise<IPullRequestEntity[]>{
            return service.getRepositoryPullRequestsPage(owner, repository, page, direction);
        }
    }

    public async getByNamePageFromRepository(req: Request, res: Response): Promise<void> {
        const service: IPullRequestService = this._services.pull;
        await this.getOrderedPageFromRepository(req, res, handler);

        async function handler(owner: string, repository: string, page: number, direction: number): Promise<IPullRequestEntity[]>{
            return service.getRepositoryPullRequestsByNamePage(owner, repository, page, direction);
        }
    }

    public async getByReviewsPageFromRepository(req: Request, res: Response): Promise<void> {
        const service: IPullRequestService = this._services.pull;
        await this.getOrderedPageFromRepository(req, res, handler);

        async function handler(owner: string, repository: string, page: number, direction: number): Promise<IPullRequestEntity[]>{
            return service.getRepositoryPullRequestsByReviewsPage(owner, repository, page, direction);
        }
    }

    private async getOrderedPageFromRepository(req: Request, res: Response, handler: any): Promise<void> {
        const service: IPullRequestService = this._services.pull;
        const page: number = req.params.page;
        const owner: string = req.params.owner;
        const repository: string = req.params.repository;
        const direction: number = RoutesUtil.directionNameToNumber(req.params.direction);
        if (direction === 0) {
            res.status(404).json({ message: "Page not found." });
        } else {
            try {
                const pulls: IPullRequestEntity[] = await handler(owner, repository, page, direction);
                const jsonRepos: Object[] = EntityUtil.toJSONArray(pulls);
                const lastPage: number = await service.numPagesForRepository(owner, repository);
                res.json({ data: jsonRepos, last_page: lastPage });
            } catch (error) {
                res.status(500).json({ message: "Oops, something went wrong." });
            }
        }
    }

    public async getAllTimeStatsByUser(req: Request, res: Response): Promise<void> {
        const userLogin: string = req.params.userlogin;
        const service: IStatsService = this._services.stats;

        try {
            const stats: any = await service.getPullRequestsStatsByUser(userLogin);
            res.json(stats);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Oops, something went wrong." });
        }
    }

    public async getAllTimeStatsByRepository(req: Request, res: Response): Promise<void> {
        const owner: string = req.params.owner;
        const repository: string = req.params.repository;
        const service: IStatsService = this._services.stats;

        try {
            const stats: any = await service.getPullRequestsStatsByRepository(owner, repository);
            res.json(stats);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Oops, something went wrong." });
        }
    }

}