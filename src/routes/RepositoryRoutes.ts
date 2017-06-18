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

        router.get("/repo/:owner/:repository", (req: express.Request, res: express.Response) => {
            controller.get(req, res);
        });

        router.get("/repos/page/:page", (req: express.Request, res: express.Response) => {
            req.params.direction = 'ASC';
            controller.getPage(req, res);
        });

        router.get("/repos/order/date/:direction/page/:page", (req: express.Request, res: express.Response) => {
            controller.getPage(req, res);
        });

        router.get("/repos/order/name/:direction/page/:page", (req: express.Request, res: express.Response) => {
            controller.getByNamePage(req, res);
        });

        router.get("/repos/order/reviews/:direction/page/:page", (req: express.Request, res: express.Response) => {
            controller.getByReviewsPage(req, res);
        });

        router.get("/repos/order/pullrequests/:direction/page/:page", (req: express.Request, res: express.Response) => {
            controller.getByPullRequestsPage(req, res);
        });

        router.get("/repos/all", (req: express.Request, res: express.Response) => {
            controller.getList(req, res);
        });

        router.get("/repos/stats/means", (req: express.Request, res: express.Response) => {
            controller.getStatsMeans(req, res);
        });

        router.get("/repo/:owner/:repository/csv", (req: express.Request, res: express.Response) => {
            controller.getCSV(req, res);
        });

        return router;
    }

}