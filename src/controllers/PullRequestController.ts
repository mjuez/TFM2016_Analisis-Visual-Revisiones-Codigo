import { Request, Response } from "express";
import { IPullRequestService } from "../app/services/PullRequestService";
import { IPullRequestEntity } from "../app/entities/PullRequestEntity";
import { EntityUtil } from "../app/util/EntityUtil";
import { RoutesUtil } from "../app/util/RoutesUtil";
import { AbstractAllTimeStatsController } from "./AbstractAllTimeStatsController";

/**
 * Pull request controller interface
 * Defines the controllers of API routes related
 * with pull request data.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IPullRequestController {

    /**
     * Sends an HTTP response with JSON data of
     * one pull request.
     * 
     * @param req   Express request.
     * @param res   Express response.
     */
    get(req: Request, res: Response): Promise<void>;

    /**
     * Sends an HTTP response with JSON array of
     * a page with data of pull requests.
     * 
     * @param req   Express request.
     * @param res   Express response.
     * @param type  Optional page type.
     */
    getPageBy(req: Request, res: Response, type?: string): Promise<void>;

    /**
     * Sends an HTTP response with JSON array of
     * a page with data of pull requests filtered
     * by repository.
     * 
     * @param req   Express request.
     * @param res   Express response.
     * @param type  Optional page type.
     */
    getPageFromRepositoryBy(req: Request, res: Response, type?: string): Promise<void>;

    /**
     * Sends an HTTP response with all time 
     * statistics of an user.
     * 
     * @param req   Express request.
     * @param res   Express response.
     */
    getAllTimeStatsByUser(req: Request, res: Response): Promise<void>;

    /**
     * Sends an HTTP response with all time 
     * statistics of a repository.
     * 
     * @param req   Express request.
     * @param res   Express response.
     */
    getAllTimeStatsByRepository(req: Request, res: Response): Promise<void>;

    /**
     * Sends an HTTP response with pull requests 
     * mean statistics.
     * 
     * @param req   Express request.
     * @param res   Express response.
     */
    getStatsMeans(req: Request, res: Response): Promise<void>;

}

/**
 * Pull request controller interface implementation.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class PullRequestController extends AbstractAllTimeStatsController implements IPullRequestController {

    /**
     * Sends an HTTP response with JSON data of
     * one pull request.
     * 
     * @async
     * @param req   Express request.
     * @param res   Express response.
     */
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
            RoutesUtil.errorResponse(res);
        }
    }

    /**
     * Sends an HTTP response with JSON array of
     * a page with data of pull requests.
     * 
     * @async
     * @param req   Express request.
     * @param res   Express response.
     * @param type  Optional page type.
     */
    public getPageBy = async (req: Request, res: Response, type?: string): Promise<void> => {
        const handler: any = this._services.pull.getPageHandler(type);
        await this.getOrderedPage(req, res, this._services.pull, handler);
    }

    /**
     * Sends an HTTP response with JSON array of
     * a page with data of pull requests filtered
     * by repository.
     * 
     * @async
     * @param req   Express request.
     * @param res   Express response.
     * @param type  Optional page type.
     */
    public getPageFromRepositoryBy = async (req: Request, res: Response, type?: string): Promise<void> => {
        const handler: any = this._services.pull.getFilteredPageHandler(type);
        await this.getOrderedPageFromRepository(req, res, handler);
    }

    /**
     * Sends an HTTP response with all time 
     * statistics of an user.
     * 
     * @async
     * @param req   Express request.
     * @param res   Express response.
     */
    public async getAllTimeStatsByUser(req: Request, res: Response): Promise<void> {
        await this._getAllTimeStatsByUser(req, res, this._services.stats.getPullRequestsStatsByUser);
    }

    /**
     * Sends an HTTP response with all time 
     * statistics of a repository.
     * 
     * @async
     * @param req   Express request.
     * @param res   Express response.
     */
    public async getAllTimeStatsByRepository(req: Request, res: Response): Promise<void> {
        await this._getAllTimeStatsByRepository(req, res, this._services.stats.getPullRequestsStatsByRepository);
    }

    /**
     * Sends an HTTP response with pull requests 
     * mean statistics.
     * 
     * @async
     * @param req   Express request.
     * @param res   Express response.
     */
    public async getStatsMeans(req: Request, res: Response): Promise<void> {
        const service: IPullRequestService = this._services.pull;
        try {
            const means: any = await service.getPullRequestsStatsMeans();
            res.json(means);
        } catch (error) {
            console.log(error);
            RoutesUtil.errorResponse(res);
        }
    }

    /**
     * Sends an HTTP response with an ordered page of
     * pull requests from a specific repository.
     * If the page is empty it sends a 404 response.
     * 
     * @param req       Express request.
     * @param res       Express response.
     * @param handler   A handler for getting entities list.
     */
    private async getOrderedPageFromRepository(req: Request, res: Response, handler: any): Promise<void> {
        const service: IPullRequestService = this._services.pull;
        const page: number = req.params.page;
        const owner: string = req.params.owner;
        const repository: string = req.params.repository;
        const direction: number = RoutesUtil.directionNameToNumber(req.params.direction);
        if (direction === 0) {
            RoutesUtil.notFoundResponse(res);
        } else {
            try {
                const pulls: IPullRequestEntity[] = await handler(owner, repository, page, direction);
                const jsonRepos: Object[] = EntityUtil.toJSONArray(pulls);
                const lastPage: number = await service.numPagesForRepository(owner, repository);
                res.json({ data: jsonRepos, last_page: lastPage });
            } catch (error) {
                console.log(error);
                RoutesUtil.errorResponse(res);
            }
        }
    }

}