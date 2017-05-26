import * as express from "express";
import { IPullRequestController } from "../controllers/PullRequestController";

/**
 * Pull Request express Routes.
 * Defines our API routes.
 * @author Mario Juez <mario@mjuez.com>
 */
export class PullRequestRoutes {

    /** Pull Request controller. */
    private readonly _controller: IPullRequestController;

    /** Express Router. */
    private readonly _router: express.Router;

    /**
     * Class constructor. Injects controller and router dependencies.
     * @param controller    Pull Request controller.
     * @param router        A express router.
     */
    constructor(controller: IPullRequestController, router: express.Router) {
        this._controller = controller;
        this._router = router;
    }

    /**
     * Gets Pull Request API routes.
     * @returns  the router.
     */
    public get routes(): express.Router {
        let router: express.Router = this._router;
        let controller: IPullRequestController = this._controller;

        router.get("/:owner/:repository/pulls/count", (req: express.Request, res: express.Response) => {
            controller.getCount(req, res);
        });
        
        router.get("/:owner/:repository/pulls/:pull_number", (req: express.Request, res: express.Response) => {
            controller.get(req, res);
        });

        router.get("/:owner/:repository/pulls/:pull_number/reviews", async (req: express.Request, res: express.Response) => {
            await controller.getReviews(req, res);
        });

        router.get("/:owner/:repository/pulls", (req: express.Request, res: express.Response) => {
            controller.getAll(req, res);
        });

        router.get("/:owner/:repository/pulls/stats/created/alltime", async (req: express.Request, res: express.Response) => {
            await controller.getCreatedAllTime(req, res);
        });

        /*router.get("/remote/:owner/:repository/pulls/:pull_id", (req: express.Request, res: express.Response) => {
            controller.getRemote(req, res);
        });*/

        router.get("/remote/:owner/:repository/pulls", (req: express.Request, res: express.Response) => {
            controller.getAllRemote(req, res);
        });

        return router;
    }

}