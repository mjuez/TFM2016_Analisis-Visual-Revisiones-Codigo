import * as express from "express";
import { IRepositoryController } from "../controllers/RepositoryController";

/**
 * Repository express Routes.
 * Defines our API routes.
 * @author Mario Juez <mario@mjuez.com>
 */
export class RepositoryRoutes {

    /** Repository controller. */
    private readonly _controller: IRepositoryController;

    /** Express Router. */
    private readonly _router: express.Router;

    /**
     * Class constructor. Injects controller and router dependencies.
     * @param controller    Repository controller.
     * @param router        A express router.
     */
    constructor(controller: IRepositoryController, router: express.Router) {
        this._controller = controller;
        this._router = router;
    }

    /**
     * Gets Repository API routes.
     * @returns  the router.
     */
    public get routes(): express.Router {
        let router: express.Router = this._router;
        let controller: IRepositoryController = this._controller;

        router.get("/repos/all", (req: express.Request, res: express.Response) => {
            controller.getFirstPage(req, res);
        });

        router.get("/repos/all/page/:page", (req: express.Request, res: express.Response) => {
            controller.getPage(req, res);
        });

        return router;
    }

}