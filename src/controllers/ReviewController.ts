import { Router, Request, Response, NextFunction } from "express";
import { AbstractController } from "./AbstractController";
import { IReviewService } from "../app/services/ReviewService";

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
        const service: IReviewService = this._services.review;

        try {
            const firstAndLastReviews: any = await service.getFirstAndLast();
            let dates: any = {
                start: firstAndLastReviews.first.document.submitted_at,
                end: firstAndLastReviews.last.document.submitted_at
            }
            const stats: any = await service.getAllTimeStatsByUser(userLogin, dates);
            res.json(stats);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Oops, something went wrong." });
        }
    }

}