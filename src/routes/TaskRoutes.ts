import * as express from "express";
import { ITaskManagerController } from "../controllers/TaskManagerController";

/**
 * Task Manager express Routes.
 * Defines our API routes.
 * @author Mario Juez <mario@mjuez.com>
 */
export class TaskRoutes {

    /** Pull Request controller. */
    private readonly _controller: ITaskManagerController;

    /** Express Router. */
    private readonly _router: express.Router;

    /**
     * Class constructor. Injects controller and router dependencies.
     * @param controller    Task Manager controller.
     * @param router        A express router.
     */
    constructor(controller: ITaskManagerController, router: express.Router) {
        this._controller = controller;
        this._router = router;
    }

    /**
     * Gets Task Manager API routes.
     * @returns  the router.
     */
    public get routes(): express.Router {
        let router: express.Router = this._router;
        let controller: ITaskManagerController = this._controller;

        router.get("/taskmanager/status", (req: express.Request, res: express.Response) => {
            controller.getStatus(req, res);
        });

        router.get("/tasks/all", (req: express.Request, res: express.Response) => {
            controller.getAllTasks(req, res);
        });

        router.get("/tasks/pending", (req: express.Request, res: express.Response) => {
            controller.getPendingTasks(req, res);
        });

        return router;
    }

}