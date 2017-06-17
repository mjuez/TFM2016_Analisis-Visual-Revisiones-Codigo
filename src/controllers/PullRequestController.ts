import { Request, Response } from "express";
import { IPullRequestService } from "../app/services/PullRequestService";
import { IStatsService } from "../app/services/StatsService";
import { IPullRequestEntity } from "../app/entities/PullRequestEntity";
import { EntityUtil } from "../app/util/EntityUtil";
import { RoutesUtil } from "../app/util/RoutesUtil";
import { AbstractAllTimeStatsController } from "./AbstractAllTimeStatsController";

/**
 * Pull Request controller interface.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IPullRequestController {

    get(req: Request, res: Response): Promise<void>;
    getPageBy(req: Request, res: Response, type?: string): Promise<void>;
    getPageFromRepositoryBy(req: Request, res: Response, type?: string): Promise<void>;
    getAllTimeStatsByUser(req: Request, res: Response): Promise<void>;
    getAllTimeStatsByRepository(req: Request, res: Response): Promise<void>;
    getStatsMeans(req: Request, res: Response): Promise<void>;

}

/**
 * Pull Request controller.
 * Defines Pull Request requests handling.
 * @extends GitHubController.
 * @implements IPullRequestController.
 */
export class PullRequestController extends AbstractAllTimeStatsController implements IPullRequestController {

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

    public getPageBy = async (req: Request, res: Response, type?: string): Promise<void> => {
        const handler: any = this._services.pull.getPageHandler(type);
        await this.getOrderedPage(req, res, this._services.pull, handler);
    }

    public getPageFromRepositoryBy = async (req: Request, res: Response, type?: string): Promise<void> => {
        const handler: any = this._services.pull.getFilteredPageHandler(type);
        await this.getOrderedPageFromRepository(req, res, handler);
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
        await this._getAllTimeStatsByUser(req, res, this._services.stats.getPullRequestsStatsByUser);
    }

    public async getAllTimeStatsByRepository(req: Request, res: Response): Promise<void> {
        await this._getAllTimeStatsByRepository(req, res, this._services.stats.getPullRequestsStatsByRepository);
    }

    public async getStatsMeans(req: Request, res: Response): Promise<void> {
        const service: IPullRequestService = this._services.pull;
        try {
            const means: any = await service.getPullRequestsStatsMeans();
            res.json(means);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Oops, something went wrong." });
        }
    }

}