import { Request, Response } from "express";
import { AbstractAllTimeStatsController } from "./AbstractAllTimeStatsController";

/**
 * Review comment controller interface
 * Defines the controllers of API routes related
 * with review comment data.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IReviewCommentController {

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

}

/**
 * Review comment controller implementation.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class ReviewCommentController extends AbstractAllTimeStatsController implements IReviewCommentController {

    /**
     * Sends an HTTP response with all time 
     * statistics of an user.
     * 
     * @async
     * @param req   Express request.
     * @param res   Express response.
     */
    public async getAllTimeStatsByUser(req: Request, res: Response): Promise<void> {
        await this._getAllTimeStatsByUser(req, res, this._services.stats.getReviewCommentsStatsByUser);
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
        await this._getAllTimeStatsByRepository(req, res, this._services.stats.getReviewCommentsStatsByRepository);
    }

}