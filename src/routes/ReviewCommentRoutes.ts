import * as express from "express";
import { IReviewCommentController } from "../controllers/ReviewCommentController";

/**
 * ReviewComment express Routes.
 * Defines our API routes.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class ReviewCommentRoutes {

    /** ReviewComment controller. */
    private readonly _controller: IReviewCommentController;

    /** Express Router. */
    private readonly _router: express.Router;

    /**
     * Class constructor. Injects controller and router dependencies.
     * 
     * @param controller    ReviewComment controller.
     * @param router        A express router.
     */
    constructor(controller: IReviewCommentController, router: express.Router) {
        this._controller = controller;
        this._router = router;
    }

    /**
     * Gets ReviewComment API routes.
     * 
     * @returns  the router.
     */
    public get routes(): express.Router {
        const router: express.Router = this._router;
        const controller: IReviewCommentController = this._controller;

        router.get("/reviewcomments/filter/user/:userlogin/stats/alltime", (req: express.Request, res: express.Response) => {
            controller.getAllTimeStatsByUser(req, res);
        });

        router.get("/reviewcomments/filter/repo/:owner/:repository/stats/alltime", (req: express.Request, res: express.Response) => {
            controller.getAllTimeStatsByRepository(req, res);
        });

        return router;
    }

}