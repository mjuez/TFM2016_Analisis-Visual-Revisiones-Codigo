import { IPullRequestController, PullRequestController } from "./controllers/PullRequestController";
import { IRepositoryController, RepositoryController } from "./controllers/RepositoryController";
import { ITaskManagerController, TaskManagerController } from "./controllers/TaskManagerController";
import { IPullRequestService, PullRequestService } from "./app/services/PullRequestService";
import { ITaskManagerService, TaskManagerService } from "./app/services/TaskManagerService";
import { IReviewService, ReviewService } from "./app/services/ReviewService";
import { IReviewCommentService, ReviewCommentService } from "./app/services/ReviewCommentService";
import { IUserService, UserService } from "./app/services/UserService";
import { IRepositoryService, RepositoryService } from "./app/services/RepositoryService";
import { IPullRequestRepository, PullRequestRepository } from "./app/data/PullRequestRepository";
import { IRepositoryRepository, RepositoryRepository } from "./app/data/RepositoryRepository";
import { IReviewCommentRepository, ReviewCommentRepository } from "./app/data/ReviewCommentRepository";
import { IReviewRepository, ReviewRepository } from "./app/data/ReviewRepository";
import { ITaskRepository, TaskRepository } from "./app/data/TaskRepository";
import { IUserRepository, UserRepository } from "./app/data/UserRepository";
import { PullRequestRoutes } from "./routes/PullRequestRoutes";
import { RepositoryRoutes } from "./routes/RepositoryRoutes";
import { TaskRoutes } from "./routes/TaskRoutes";
import * as path from "path";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as mongoose from "mongoose";
import * as BluebirdPromise from "bluebird";

interface Repositories {
  pull: IPullRequestRepository,
  review: IReviewRepository,
  reviewComment: IReviewCommentRepository,
  user: IUserRepository,
  repo: IRepositoryRepository,
  task: ITaskRepository
}

interface Services {
  pull: IPullRequestService,
  review: IReviewService,
  reviewComment: IReviewCommentService,
  user: IUserService,
  repo: IRepositoryService,
  taskManager: ITaskManagerService
}

/**
 * Application main class.
 * It sets up an express instance.
 * @author Mario Juez <mario@mjuez.com>
 */
class App {

  /** Express application. */
  private _express: express.Application;

  private _router: express.Router;

  private _repositories: Repositories = {
    pull: null,
    review: null,
    reviewComment: null,
    user: null,
    repo: null,
    task: null,
  }

  private _services: Services = {
    pull: null,
    review: null,
    reviewComment: null,
    user: null,
    repo: null,
    taskManager: null
  }

  private _controllers: {
    pull: IPullRequestController;
    repo: IRepositoryController;
    taskManager: ITaskManagerController;
  } = {
    pull: null,
    repo: null,
    taskManager: null
  }

  private _routes: {
    pull: PullRequestRoutes;
    repo: RepositoryRoutes;
    tasks: TaskRoutes;
  } = {
    pull: null,
    repo: null,
    tasks: null
  }

  /**
   * Creates an application.
   * Database connection and express instance configuration.
   */
  constructor() {
    mongoose.connect(process.env.MONGO_CONNSTRING);
    (<any>mongoose).Promise = BluebirdPromise;
    this._express = express();
    this._router = express.Router();
    this.configureMiddleware();
    this.init();
  }

  /**
   * Gets express application instance.
   * @returns a express application.
   */
  public get express(): express.Application {
    return this._express;
  }

  private async init(): Promise<void> {
    this.createRepositories();
    await this.createServices();
    this.createControllers();
    this.createRoutes();
    this.setRoutes();
  }

  private createRepositories(): void {
    this._repositories.pull = new PullRequestRepository();
    this._repositories.repo = new RepositoryRepository();
    this._repositories.reviewComment = new ReviewCommentRepository();
    this._repositories.review = new ReviewRepository();
    this._repositories.task = new TaskRepository();
    this._repositories.user = new UserRepository();
  }

  private async createServices(): Promise<void> {
    this._services.pull = new PullRequestService(this._repositories.pull);
    this._services.review = new ReviewService(this._repositories.review, this._services.pull);
    this._services.reviewComment = new ReviewCommentService(this._repositories.reviewComment);
    this._services.user = new UserService(this._repositories.user);
    this._services.repo = new RepositoryService(this._repositories.repo);
    this._services.taskManager = new TaskManagerService(this._repositories, this._services);
  }

  private createControllers(): void {
    this._controllers.pull = new PullRequestController(this._services);
    this._controllers.repo = new RepositoryController(this._services.repo);
    this._controllers.taskManager = new TaskManagerController(this._services.taskManager);
  }

  private createRoutes(): void {
    this._routes.pull = new PullRequestRoutes(this._controllers.pull, this._router);
    this._routes.repo = new RepositoryRoutes(this._controllers.repo, this._router);
    this._routes.tasks = new TaskRoutes(this._controllers.taskManager, this._router);
  }

  /**
   * Configures express middleware.
   */
  private configureMiddleware(): void {
    this._express.use(bodyParser.json());
    this._express.use(bodyParser.urlencoded({ extended: false }));
    this._express.use(express.static(__dirname + '/client'));
  }

  /**
   * Sets express routes.
   */
  private setRoutes(): void {
    let router = express.Router();
    this._express.use('/', router);
    this._express.use('/api/', this._routes.pull.routes);
    this._express.use('/api/', this._routes.repo.routes);
    this._express.use('/api/', this._routes.tasks.routes);
    this._express.get('*', (req, res) => {
      res.sendFile(__dirname + '/client/index.html');
    });
  }

}

export default new App().express;