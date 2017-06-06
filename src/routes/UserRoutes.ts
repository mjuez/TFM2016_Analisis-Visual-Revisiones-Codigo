import * as express from "express";
import { IUserController } from "../controllers/UserController";

/**
 * User express Routes.
 * Defines our API routes.
 * @author Mario Juez <mario@mjuez.com>
 */
export class UserRoutes {

    /** User controller. */
    private readonly _controller: IUserController;

    /** Express Router. */
    private readonly _router: express.Router;

    /**
     * Class constructor. Injects controller and router dependencies.
     * @param controller    User controller.
     * @param router        A express router.
     */
    constructor(controller: IUserController, router: express.Router) {
        this._controller = controller;
        this._router = router;
    }

    /**
     * Gets Pull Request API routes.
     * @returns  the router.
     */
    public get routes(): express.Router {
        let router: express.Router = this._router;
        let controller: IUserController = this._controller;

        router.get("/user/:username", (req: express.Request, res: express.Response) => {
            controller.get(req, res);
        });

        router.get("/users", (req: express.Request, res: express.Response) => {
            req.params.page = 1;
            req.params.direction = 'ASC';
            controller.getPage(req, res);
        });

        router.get("/users/page/:page", (req: express.Request, res: express.Response) => {
            req.params.direction = 'ASC';
            controller.getPage(req, res);
        });

        router.get("/users/order/date/:direction/page/:page", (req: express.Request, res: express.Response) => {
            controller.getPage(req, res);
        });

        router.get("/users/order/name/:direction/page/:page", (req: express.Request, res: express.Response) => {
            controller.getByNamePage(req, res);
        });

        router.get("/users/order/pullrequests/:direction/page/:page", (req: express.Request, res: express.Response) => {
            controller.getByPullRequestsPage(req, res);
        });

        router.get("/users/order/reviews/:direction/page/:page", (req: express.Request, res: express.Response) => {
            controller.getByReviewsPage(req, res);
        });

        router.get("/users/order/reviews/:state/:direction/page/:page", (req: express.Request, res: express.Response) => {
            controller.getByReviewsByStatePage(req, res);
        });

        router.get("/users/order/reviewcomments/:direction/page/:page", (req: express.Request, res: express.Response) => {
            controller.getByReviewCommentsPage(req, res);
        });

        router.get("/users/stats/means", (req: express.Request, res: express.Response) => {
            controller.getStatsMeans(req, res);
        });

        return router;
    }

}