import * as express from "express";
import { IPullRequestController } from "../controllers/PullRequestController";

export class PullRequestRoutes {

    private _controller: IPullRequestController;
    private _router: express.Router;

    constructor(controller: IPullRequestController) {
        this._controller = controller;
        this._router = express.Router();
    }

    public get routes(): express.Router {
        let router: express.Router = this._router;
        let controller: IPullRequestController = this._controller;

        router.get("/:owner/:repository/pull/:pull_id", (req: express.Request, res: express.Response) => {
            controller.retrieve(req, res);
        });

        return router;
    }

}