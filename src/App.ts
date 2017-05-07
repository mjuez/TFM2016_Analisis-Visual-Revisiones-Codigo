import * as path from "path";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as mongoose from "mongoose";
import * as BluebirdPromise from "bluebird";
import { IPullRequestController, PullRequestController } from "./controllers/PullRequestController";
import { ITaskManagerController, TaskManagerController } from "./controllers/TaskManagerController";
import { IPullRequestService, PullRequestService } from "./app/services/PullRequestService";
import { TaskManagerService } from "./app/services/TaskManagerService";
import { IPullRequestRepository, PullRequestRepository } from "./app/data/PullRequestRepository";
import { PullRequestRoutes } from "./routes/PullRequestRoutes";
import { TasksRoutes } from "./routes/TasksRoutes";

/**
 * Application main class.
 * It sets up an express instance.
 * @author Mario Juez <mario@mjuez.com>
 */
class App {

  /** Express application. */
  private _express: express.Application;

  /** GitHub Pull Requests routes. */
  private _pullRequestRoutes: PullRequestRoutes;

  /** Tasks routes. */
  private _tasksRoutes: TasksRoutes;

  /**
   * Creates an application.
   * Database connection and express instance configuration.
   */
  constructor() {
    mongoose.connect(process.env.MONGO_CONNSTRING);
    (<any>mongoose).Promise = BluebirdPromise;
    TaskManagerService.getInstance();
    this._express = express();
    this.wirePullRequestRoutes();
    this.wireTasksRoutes();
    this.configureMiddleware();
    this.setRoutes();
  }

  /**
   * Gets express application instance.
   * @returns a express application.
   */
  public get express(): express.Application {
    return this._express;
  }

  /**
   * Creates a Pull Request routes class by injecting its dependencies.
   */
  private wirePullRequestRoutes(): void {
    let pullRequestRepository: IPullRequestRepository = new PullRequestRepository();
    let pullRequestService: IPullRequestService = new PullRequestService(pullRequestRepository);
    let pullRequestController: IPullRequestController = new PullRequestController(pullRequestService);
    let router: express.Router = express.Router();
    this._pullRequestRoutes = new PullRequestRoutes(pullRequestController, router);
  }

  /**
   * Creates a Tasks routes class by injecting its dependencies.
   */
  private wireTasksRoutes(): void {
    let taskManagerController: ITaskManagerController = new TaskManagerController();
    let router: express.Router = express.Router();
    this._tasksRoutes = new TasksRoutes(taskManagerController, router);
  }

  /**
   * Configures express middleware.
   */
  private configureMiddleware(): void {
    this._express.use(bodyParser.json());
    this._express.use(bodyParser.urlencoded({ extended: false }));
  }

  /**
   * Sets express routes.
   */
  private setRoutes(): void {
    let router = express.Router();
    router.get('/', (req, res, next) => {
      res.json({
        message: 'Welcome to ANVIRECO public API.'
      });
    });
    this._express.use('/', router);
    this._express.use('/api/', this._pullRequestRoutes.routes);
    this._express.use('/api/', this._tasksRoutes.routes);
  }

}

export default new App().express;