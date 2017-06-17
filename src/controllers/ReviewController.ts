import { Request, Response } from "express";
import { IStatsService } from "../app/services/StatsService";
import { AbstractAllTimeStatsController } from "./AbstractAllTimeStatsController";

/**
 * Review controller interface.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IReviewController {

    getAllTimeStatsByUser(req: Request, res: Response): Promise<void>;
    getAllTimeStatsByRepository(req: Request, res: Response): Promise<void>;

}

/**
 * Review controller.
 * Defines Review requests handling.
 * @extends AbstractController.
 * @implements IReviewController.
 */
export class ReviewController extends AbstractAllTimeStatsController implements IReviewController {

    public async getAllTimeStatsByUser(req: Request, res: Response): Promise<void> {
        await this._getAllTimeStatsByUser(req,res,this._services.stats.getReviewsStatsByUser);
    }

    public async getAllTimeStatsByRepository(req: Request, res: Response): Promise<void> {
        await this._getAllTimeStatsByRepository(req, res, this._services.stats.getReviewsStatsByRepository);
    }

}