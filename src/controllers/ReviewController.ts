import { Router, Request, Response, NextFunction } from "express";
import { AbstractController } from "./AbstractController";
import { IStatsService } from "../app/services/StatsService";

/**
 * Review controller interface.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IReviewController {

    getAllTimeStatsByUser(req: Request, res: Response): Promise<void>;

}

/**
 * Review controller.
 * Defines Review requests handling.
 * @extends AbstractController.
 * @implements IReviewController.
 */
export class ReviewController extends AbstractController implements IReviewController {

    public async getAllTimeStatsByUser(req: Request, res: Response): Promise<void> {
        const userLogin: string = req.params.userlogin;
        const service: IStatsService = this._services.stats;

        try {
            const filter: any = { "user.login": userLogin };
            const stats: any = await service.getReviewsAllTimeStats(filter);
            res.json(stats);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Oops, something went wrong." });
        }
    }

}