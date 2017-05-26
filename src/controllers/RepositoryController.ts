import { Router, Request, Response, NextFunction } from "express";
import { IRepositoryService } from "../app/services/RepositoryService";
import { RepositoryDocument } from "../app/entities/documents/RepositoryDocument";
import { IRepositoryEntity, RepositoryEntity } from "../app/entities/RepositoryEntity";

/**
 * Repository controller interface.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IRepositoryController {
    getFirstPage(req: Request, res: Response): Promise<void>;
    getPage(req: Request, res: Response): Promise<void>;
    getPageOrderedBy(req: Request, res: Response): Promise<void>;
    getNumberOfPages(req: Request, res: Response): Promise<void>;
}

/**
 * Repository controller.
 * Defines Repository requests handling.
 * @extends GitHubController.
 * @implements IPullRequestController.
 */
export class RepositoryController implements IRepositoryController {

    /** Repository service. */
    private readonly _service: IRepositoryService;

    /**
     * Class constructor. Injects Repository service dependency.
     * @param service   Repository service.
     */
    constructor(service: IRepositoryService) {
        this._service = service;
    }

    public async getFirstPage(req: Request, res: Response): Promise<void> {
        let service: IRepositoryService = this._service;
        await this._getPage(res, 1);
    }

    public async getPage(req: Request, res: Response): Promise<void> {
        let page: number = req.params.page;
        await this._getPage(res, page);
    }

    private async _getPage(res: Response, page: number): Promise<void> {
        let service: IRepositoryService = this._service;
        try {
            let repositories: Object[] = await service.getRepositories(page);
            let lastPage: number = await service.numPages();
            res.json({ data: repositories, last_page: lastPage });
        } catch (error) {
            res.status(500).json({ message: "Oops, something went wrong." });
        }
    }

    public async getNumberOfPages(req: Request, res: Response): Promise<void> {
        let service: IRepositoryService = this._service;
        try {
            let pages = await service.numPages();
            res.json({ num: pages });
        } catch (error) {
            res.status(500).json({ message: "Oops, something went wrong." });
        }
    }

    public async getPageOrderedBy(req: Request, res: Response): Promise<void> {

    }

}