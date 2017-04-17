import * as express from "express";
import { IPullRequestController } from "../controllers/PullRequestController";

/**
 * Pull Request express Routes.
 * Defines our API routes.
 * @author Mario Juez <mario@mjuez.com>
 */
export class PullRequestRoutes {

    /**
     * Pull Request controller.
     */
    private readonly _controller: IPullRequestController;

    /**
     * Express Router.
     */
    private readonly _router: express.Router;

    /**
     * Class constructor. Injects controller and router dependencies.
     * @param controller    Pull Request controller.
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

        router.get("/:owner/:repository/pull/:pull_id", (req: express.Request, res: express.Response) => {
            controller.retrieve(req, res);
        });

        return router;
    }

}