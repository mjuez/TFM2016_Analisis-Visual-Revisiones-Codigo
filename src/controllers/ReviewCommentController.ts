import { Router, Request, Response, NextFunction } from "express";
import { AbstractController } from "./AbstractController";
import { IStatsService } from "../app/services/StatsService";

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
export class ReviewCommentController extends AbstractController implements IReviewCommentController {

    public async getAllTimeStatsByUser(req: Request, res: Response): Promise<void> {
        const userLogin: string = req.params.userlogin;
        const service: IStatsService = this._services.stats;

        try {
            const stats: any = await service.getReviewCommentsStatsByUser(userLogin);
            res.json(stats);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Oops, something went wrong." });
        }
    }

    public async getAllTimeStatsByRepository(req: Request, res: Response): Promise<void> {
        const owner: string = req.params.owner;
        const repository: string = req.params.repository;
        const service: IStatsService = this._services.stats;

        try {
            const stats: any = await service.getReviewCommentsStatsByRepository(owner, repository);
            res.json(stats);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Oops, something went wrong." });
        }
    }

}