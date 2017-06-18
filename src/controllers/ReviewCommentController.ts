import { Request, Response } from "express";
import { IStatsService } from "../app/services/StatsService";
import { AbstractAllTimeStatsController } from "./AbstractAllTimeStatsController";

/**
 * ReviewComment controller interface.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IReviewCommentController {

    getAllTimeStatsByUser(req: Request, res: Response): Promise<void>;
    getAllTimeStatsByRepository(req: Request, res: Response): Promise<void>;

}

/**
 * ReviewComment controller.
 * Defines ReviewComment requests handling.
 * @extends AbstractController.
 * @implements IReviewCommentController.
 */
export class ReviewCommentController extends AbstractAllTimeStatsController implements IReviewCommentController {

    public async getAllTimeStatsByUser(req: Request, res: Response): Promise<void> {
        await this._getAllTimeStatsByUser(req, res, this._services.stats.getReviewCommentsStatsByUser);
    }

    public async getAllTimeStatsByRepository(req: Request, res: Response): Promise<void> {
        await this._getAllTimeStatsByRepository(req, res, this._services.stats.getReviewCommentsStatsByRepository);
    }

}