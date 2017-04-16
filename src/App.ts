import * as path from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import { IPullRequestController, PullRequestController } from './controllers/PullRequestController';
import { IPullRequestService, PullRequestService } from "./app/services/PullRequestService";
import { IPullRequestRepository, PullRequestRepository } from "./app/data/PullRequestRepository";
import { PullRequestRoutes } from "./routes/PullRequestRoutes";

class App {

  public express: express.Application;

  private _pullRequestRoutes: PullRequestRoutes;

  constructor() {
    this.express = express();
    mongoose.connect(process.env.MONGO_CONNSTRING);
    this.wirePullRequestRoutes();
    this.configureMiddleware();
    this.setRoutes();
  }

  // maybe use a factory?
  private wirePullRequestRoutes() {
    let pullRequestRepository: IPullRequestRepository = new PullRequestRepository();
    let pullRequestService: IPullRequestService = new PullRequestService(pullRequestRepository);
    let pullRequestController: IPullRequestController = new PullRequestController(pullRequestService);
    this._pullRequestRoutes = new PullRequestRoutes(pullRequestController);
  }

  private configureMiddleware(): void {
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
  }

  private setRoutes(): void {
    let router = express.Router();
    router.get('/', (req, res, next) => {
      res.json({
        message: 'Welcome to ANVIRECO public API.'
      });
    });
    this.express.use('/', router);
    this.express.use('/', this._pullRequestRoutes.routes);
  }

}

export default new App().express;