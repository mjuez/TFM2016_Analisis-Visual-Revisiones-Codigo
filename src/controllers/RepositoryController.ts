import { Router, Request, Response, NextFunction } from "express";
import { AbstractController } from "./AbstractController";
import { IRepositoryService } from "../app/services/RepositoryService";
import { RepositoryDocument } from "../app/entities/documents/RepositoryDocument";
import { IRepositoryEntity, RepositoryEntity } from "../app/entities/RepositoryEntity";
import { IReviewService } from "../app/services/ReviewService";
import { EntityUtil } from "../app/util/EntityUtil";
import * as csvStringify from "csv-stringify";

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
        const page: number = req.params.page;
        try {
            const csvPage: any[] = await service.getRepositoryCSVPage(owner, repository, page);
            const filter: any = { "repository.owner": owner, "repository.name": repository };
            const lastPage: number = await reviewService.numPages(filter);
            csvStringify(csvPage, (error, csv) => {
                if (!error) {
                    res.setHeader('Content-disposition', 'attachment; filename=testing.csv');
                    res.set('Content-Type', 'text/csv');
                    res.send(csv);
                    //res.json({ data: csv, last_page: lastPage });
                } else {
                    throw error;
                }
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Oops, something went wrong." });
        }

    }

}