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
        const router: express.Router = this._router;
        const controller: IRepositoryController = this._controller;
        
        router.get("/repos", (req: express.Request, res: express.Response) => {
            req.params.page = 1;
            req.params.direction = 'ASC';
            controller.getPage(req, res);
        });

        router.get("/repos/single/:owner/:repository", (req: express.Request, res: express.Response) => {
            controller.get(req, res);
        });

        router.get("/repos/page/:page", (req: express.Request, res: express.Response) => {
            req.params.direction = 'ASC';
            controller.getPage(req, res);
        });

        router.get("/repos/page/:page/order/date/:direction", (req: express.Request, res: express.Response) => {
            controller.getPage(req, res);
        });

        router.get("/repos/page/:page/order/name/:direction", (req: express.Request, res: express.Response) => {
            controller.getByNamePage(req, res);
        });

        router.get("/repos/page/:page/order/reviews/:direction", (req: express.Request, res: express.Response) => {
            controller.getByReviewsPage(req, res);
        });

        router.get("/repos/page/:page/order/pullrequests/:direction", (req: express.Request, res: express.Response) => {
            controller.getByPullRequestsPage(req, res);
        });

        return router;
    }

}