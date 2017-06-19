import { Request, Response } from "express";
import { AbstractController } from "./AbstractController";
import { IRepositoryService } from "../app/services/RepositoryService";
import { IRepositoryEntity } from "../app/entities/RepositoryEntity";
import { IReviewService } from "../app/services/ReviewService";
import { EntityUtil } from "../app/util/EntityUtil";
import { RoutesUtil } from "../app/util/RoutesUtil";
import * as json2csv from "json2csv";

/**
 * Repository controller interface
 * Defines the controllers of API routes related
 * with repository data.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IRepositoryController {
    
    /**
     * Sends an HTTP response with JSON data of
     * one repository.
     * 
     * @param req   Express request.
     * @param res   Express response.
     */
    get(req: Request, res: Response): Promise<void>;

    /**
     * Sends an HTTP response with JSON array of
     * a page with data of repositories.
     * 
     * @param req   Express request.
     * @param res   Express response.
     */
    getPage(req: Request, res: Response): Promise<void>;

    /**
     * Sends an HTTP response with JSON array of
     * a page with data of repositories ordered 
     * by name.
     * 
     * @param req   Express request.
     * @param res   Express response.
     */
    getByNamePage(req: Request, res: Response): Promise<void>;

    /**
     * Sends an HTTP response with JSON array of
     * a page with data of repositories ordered 
     * by number of reviews.
     * 
     * @param req   Express request.
     * @param res   Express response.
     */
    getByReviewsPage(req: Request, res: Response): Promise<void>;

    /**
     * Sends an HTTP response with JSON array of
     * a page with data of repositories ordered 
     * by number of pull requests.
     * 
     * @param req   Express request.
     * @param res   Express response.
     */
    getByPullRequestsPage(req: Request, res: Response): Promise<void>;

    /**
     * Sends an HTTP response with JSON array of
     * all repositories full names (owner/name).
     * 
     * @param req   Express request.
     * @param res   Express response.
     */
    getList(req: Request, res: Response): Promise<void>;

    /**
     * Sends an HTTP response with repositories
     * mean statistics.
     * 
     * @param req   Express request.
     * @param res   Express response.
     */
    getStatsMeans(req: Request, res: Response): Promise<void>;

    /**
     * Sends an HTTP response a CSV file
     * containing repository data like pull
     * requests or reviews.
     * 
     * @param req   Express request.
     * @param res   Express response.
     */
    getCSV(req: Request, res: Response): Promise<void>;
}

/**
 * Repository controller implementation.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class RepositoryController extends AbstractController implements IRepositoryController {

    /**
     * Sends an HTTP response with JSON data of
     * one repository.
     * 
     * @async
     * @param req   Express request.
     * @param res   Express response.
     */
    public async get(req: Request, res: Response): Promise<void> {
        const service: IRepositoryService = this._services.repo;
        const owner: string = req.params.owner;
        const repository: string = req.params.repository;
        try {
            const entity: IRepositoryEntity = await service.getRepository(owner, repository);
            const json: Object = EntityUtil.toJSON(entity);
            res.json(json);
        } catch (error) {
            RoutesUtil.errorResponse(res);
        }
    }

    /**
     * Sends an HTTP response with JSON array of
     * a page with data of repositories.
     * 
     * @async
     * @param req   Express request.
     * @param res   Express response.
     */
    public async getPage(req: Request, res: Response): Promise<void> {
        const service: IRepositoryService = this._services.repo;
        await this.getOrderedPage(req, res, service, handler);

        async function handler(page: number, direction: number): Promise<IRepositoryEntity[]> {
            return service.getRepositoriesPage(page, direction);
        }
    }

    /**
     * Sends an HTTP response with JSON array of
     * a page with data of repositories ordered 
     * by name.
     * 
     * @async
     * @param req   Express request.
     * @param res   Express response.
     */
    public async getByNamePage(req: Request, res: Response): Promise<void> {
        const service: IRepositoryService = this._services.repo;
        await this.getOrderedPage(req, res, service, handler);

        async function handler(page: number, direction: number): Promise<IRepositoryEntity[]> {
            return service.getRepositoriesByNamePage(page, direction);
        }
    }

    /**
     * Sends an HTTP response with JSON array of
     * a page with data of repositories ordered 
     * by number of reviews.
     * 
     * @async
     * @param req   Express request.
     * @param res   Express response.
     */
    public async getByReviewsPage(req: Request, res: Response): Promise<void> {
        const service: IRepositoryService = this._services.repo;
        await this.getOrderedPage(req, res, service, handler);

        async function handler(page: number, direction: number): Promise<IRepositoryEntity[]> {
            return service.getRepositoriesByReviewsPage(page, direction);
        }
    }

    /**
     * Sends an HTTP response with JSON array of
     * a page with data of repositories ordered 
     * by number of pull requests.
     * 
     * @async
     * @param req   Express request.
     * @param res   Express response.
     */
    public async getByPullRequestsPage(req: Request, res: Response): Promise<void> {
        const service: IRepositoryService = this._services.repo;
        await this.getOrderedPage(req, res, service, handler);

        async function handler(page: number, direction: number): Promise<IRepositoryEntity[]> {
            return service.getRepositoriesByPullRequestsPage(page, direction);
        }
    }

    /**
     * Sends an HTTP response with JSON array of
     * all repositories full names (owner/name).
     * 
     * @async
     * @param req   Express request.
     * @param res   Express response.
     */
    public async getList(req: Request, res: Response): Promise<void> {
        const service: IRepositoryService = this._services.repo;
        try {
            const entities: IRepositoryEntity[] = await service.getRepositoriesList();
            const json: any[] = EntityUtil.toJSONArray(entities);
            let list: string[] = json.map((jsonobj) => { return jsonobj.full_name });
            res.json(list);
        } catch (error) {
            RoutesUtil.errorResponse(res);
        }
    }

    /**
     * Sends an HTTP response with repositories
     * mean statistics.
     * 
     * @async
     * @param req   Express request.
     * @param res   Express response.
     */
    public async getStatsMeans(req: Request, res: Response): Promise<void> {
        const service: IRepositoryService = this._services.repo;
        try {
            const means: any = await service.getRepositoriesStatsMeans();
            res.json(means);
        } catch (error) {
            console.log(error);
            RoutesUtil.errorResponse(res);
        }
    }

    /**
     * Sends an HTTP response a CSV file
     * containing repository data like pull
     * requests or reviews.
     * 
     * @async
     * @param req   Express request.
     * @param res   Express response.
     */
    public async getCSV(req: Request, res: Response): Promise<void> {
        const service: IRepositoryService = this._services.repo;
        const reviewService: IReviewService = this._services.review;
        const owner: string = req.params.owner;
        const repository: string = req.params.repository;
        try {
            const filter: any = { "repository.owner": owner, "repository.name": repository };
            const lastPage: number = await reviewService.numPages(filter);
            const fields: string[][] = [["review_id", "repository_id", "repository_owner", "repository_name",
                "language", "repository_creation_date", "repository_update_date", "pull_request_id",
                "pull_request_title", "pull_request_body", "pull_request_state", "pull_request_locked",
                "pull_request_creation_date", "pull_request_update_date", "pull_request_close_date",
                "pull_request_merged", "pull_request_mergeable", "pull_request_comments", "pull_request_reviews", 
                "pull_request_review_comments", "pull_request_commits", "pull_request_additions", "pull_request_deletions", 
                "pull_request_changed_files", "review_state", "review_body", "reviewer_login"]];
            res.setHeader('Content-disposition', `attachment; filename=reviews_${owner}_${repository}.csv`);
            res.set('Content-Type', 'text/csv');
            const title: string = json2csv({ data: fields, hasCSVColumnTitle: false });
            res.write(`${title}\n`);
            for (let i = 1; i <= lastPage; i++) {
                const csvPage: any[] = await service.getRepositoryCSVPage(owner, repository, i);
                const csv: string = json2csv({ data: csvPage, hasCSVColumnTitle: false });
                if (i < lastPage) res.write(`${csv}\n`);
                else res.end(csv);
            }
        } catch (error) {
            console.log(error);
            RoutesUtil.errorResponse(res);
        }

    }

}