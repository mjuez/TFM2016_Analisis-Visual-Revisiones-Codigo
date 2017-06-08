import * as express from "express";
import { IReviewController } from "../controllers/ReviewController";

/**
 * Review express Routes.
 * Defines our API routes.
 * @author Mario Juez <mario@mjuez.com>
 */
export class ReviewRoutes {

    /** Review controller. */
    private readonly _controller: IReviewController;

    /** Express Router. */
    private readonly _router: express.Router;

    /**
     * Class constructor. Injects controller and router dependencies.
     * @param controller    Review controller.
     * @param router        A express router.
     */
    constructor(controller: IReviewController, router: express.Router) {
        this._controller = controller;
        this._router = router;
    }

    /**
     * Gets Review API routes.
     * @returns  the router.
     */
    public get routes(): express.Router {
        const router: express.Router = this._router;
        const controller: IReviewController = this._controller;

        router.get("/reviews/filter/user/:userlogin/stats/alltime", (req: express.Request, res: express.Response) => {
            controller.getAllTimeStatsByUser(req, res);
        });

        router.get("/reviews/filter/repo/:owner/:repository/stats/alltime", (req: express.Request, res: express.Response) => {
            controller.getAllTimeStatsByRepository(req, res);
        });

        return router;
    }

}