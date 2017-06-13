import { Router, Request, Response, NextFunction } from "express";
import { AbstractController } from "./AbstractController";
import { IRepositoryService } from "../app/services/RepositoryService";
import { RepositoryDocument } from "../app/entities/documents/RepositoryDocument";
import { IRepositoryEntity, RepositoryEntity } from "../app/entities/RepositoryEntity";
import { IReviewService } from "../app/services/ReviewService";
import { EntityUtil } from "../app/util/EntityUtil";
import * as json2csv from "json2csv";

/**
 * Repository controller interface.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IRepositoryController {
    get(req: Request, res: Response): Promise<void>;
    getPage(req: Request, res: Response): Promise<void>;
    getByNamePage(req: Request, res: Response): Promise<void>;
    getByReviewsPage(req: Request, res: Response): Promise<void>;
    getByPullRequestsPage(req: Request, res: Response): Promise<void>;
    getList(req: Request, res: Response): Promise<void>;
    getStatsMeans(req: Request, res: Response): Promise<void>;
    getCSV(req: Request, res: Response): Promise<void>;
}

/**
 * Repository controller.
 * Defines Repository requests handling.
 * @implements IRepositoryController.
 */
export class RepositoryController extends AbstractController implements IRepositoryController {

    public async get(req: Request, res: Response): Promise<void> {
        const service: IRepositoryService = this._services.repo;
        const owner: string = req.params.owner;
        const repository: string = req.params.repository;
        try {
            const entity: IRepositoryEntity = await service.getRepository(owner, repository);
            const json: Object = EntityUtil.toJSON(entity);
            res.json(json);
        } catch (error) {
            res.status(500).json({ message: "Oops, something went wrong." });
        }
    }

    public async getPage(req: Request, res: Response): Promise<void> {
        const service: IRepositoryService = this._services.repo;
        await this.getOrderedPage(req, res, service, handler);

        async function handler(page: number, direction: number): Promise<IRepositoryEntity[]> {
            return service.getRepositoriesPage(page, direction);
        }
    }

    public async getByNamePage(req: Request, res: Response): Promise<void> {
        const service: IRepositoryService = this._services.repo;
        await this.getOrderedPage(req, res, service, handler);

        async function handler(page: number, direction: number): Promise<IRepositoryEntity[]> {
            return service.getRepositoriesByNamePage(page, direction);
        }
    }

    public async getByReviewsPage(req: Request, res: Response): Promise<void> {
        const service: IRepositoryService = this._services.repo;
        await this.getOrderedPage(req, res, service, handler);

        async function handler(page: number, direction: number): Promise<IRepositoryEntity[]> {
            return service.getRepositoriesByReviewsPage(page, direction);
        }
    }

    public async getByPullRequestsPage(req: Request, res: Response): Promise<void> {
        const service: IRepositoryService = this._services.repo;
        await this.getOrderedPage(req, res, service, handler);

        async function handler(page: number, direction: number): Promise<IRepositoryEntity[]> {
            return service.getRepositoriesByPullRequestsPage(page, direction);
        }
    }

    public async getList(req: Request, res: Response): Promise<void> {
        const service: IRepositoryService = this._services.repo;
        try {
            const entities: IRepositoryEntity[] = await service.getRepositoriesList();
            const json: any[] = EntityUtil.toJSONArray(entities);
            let list: string[] = json.map((jsonobj) => { return jsonobj.full_name });
            res.json(list);
        } catch (error) {
            res.status(500).json({ message: "Oops, something went wrong." });
        }
    }

    public async getStatsMeans(req: Request, res: Response): Promise<void> {
        const service: IRepositoryService = this._services.repo;
        try {
            const means: any = await service.getRepositoriesStatsMeans();
            res.json(means);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Oops, something went wrong." });
        }
    }

    public async getCSV(req: Request, res: Response): Promise<void> {
        const service: IRepositoryService = this._services.repo;
        const reviewService: IReviewService = this._services.review;
        const owner: string = req.params.owner;
        const repository: string = req.params.repository;
        try {
            const filter: any = { "repository.owner": owner, "repository.name": repository };
            const lastPage: number = await reviewService.numPages(filter);
            const fields: string[] = ["review_id", "repository_id", "repository_owner", "repository_name",
                "language", "repository_creation_date", "repository_update_date", "pull_request_id",
                "pull_request_title", "pull_request_body", "review_status", "review_body", "reviewer_login"];
            res.setHeader('Content-disposition', `attachment; filename=reviews_${owner}_${repository}.csv`);
            res.set('Content-Type', 'text/csv');
            for (let i = 1; i <= lastPage; i++) {
                const csvPage: any[] = await service.getRepositoryCSVPage(owner, repository, i);
                const csv = json2csv({ data: csvPage, fields });
                if (i < lastPage) res.write(csv);
                else res.end(csv);
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Oops, something went wrong." });
        }

    }

}