import * as path from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import { IController } from './controllers/AbstractController';
import { PullRequestController } from './controllers/PullRequestController';
import { PullRequestRepository } from "./data/PullRequestRepository";

class App {

  public express: express.Application;

  private pullRequestController: IController;

  constructor() {
    this.express = express();
    mongoose.connect(process.env.MONGO_CONNSTRING);
    this.configurePullRequestController();
    this.configureMiddleware();
    this.setRoutes();
  }

  // Maybe use a factory?
  private configurePullRequestController() {
    let pullRequestRepository:PullRequestRepository = new PullRequestRepository();
    this.pullRequestController = new PullRequestController(pullRequestRepository);
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
    this.express.use('/api', this.pullRequestController.router);
  }

}

export default new App().express;