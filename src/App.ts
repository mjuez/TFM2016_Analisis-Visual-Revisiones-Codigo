import * as path from "path";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as mongoose from "mongoose";
import * as BluebirdPromise from "bluebird";
import { IPullRequestController, PullRequestController } from "./controllers/PullRequestController";
import { ITaskManagerController, TaskManagerController } from "./controllers/TaskManagerController";
import { IPullRequestService, PullRequestService } from "./app/services/PullRequestService";
import { ITaskManagerService, TaskManagerService } from "./app/services/TaskManagerService";
import { IReviewService, ReviewService } from "./app/services/ReviewService";
import { IPullRequestRepository, PullRequestRepository } from "./app/data/PullRequestRepository";
import { IRepositoryRepository, RepositoryRepository } from "./app/data/RepositoryRepository";
import { IReviewCommentRepository, ReviewCommentRepository } from "./app/data/ReviewCommentRepository";
import { IReviewRepository, ReviewRepository } from "./app/data/ReviewRepository";
import { ITaskRepository, TaskRepository } from "./app/data/TaskRepository";
import { ITaskManagerRepository, TaskManagerRepository } from "./app/data/TaskManagerRepository";
import { IUserRepository, UserRepository } from "./app/data/UserRepository";
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

  private _router: express.Router;

  private _repositories: {
    pullRequest: IPullRequestRepository;
    repository: IRepositoryRepository;
    reviewComment: IReviewCommentRepository;
    review: IReviewRepository;
    taskManager: ITaskManagerRepository;
    task: ITaskRepository;
    user: IUserRepository;
  } = {
    pullRequest: null,
    repository: null,
    reviewComment: null,
    review: null,
    taskManager: null,
    task: null,
    user: null,
  }

  private _services: {
    pullRequest: IPullRequestService;
    //repository: IRepositoryService;
    //reviewComment: IReviewCommentService;
    review: IReviewService;
    taskManager: ITaskManagerService;
    //user: IUserService;
  } = {
    pullRequest: null,
    review: null,
    taskManager: null
  }

  private _controllers: {
    pullRequest: IPullRequestController;
    taskManager: ITaskManagerController;
  } = {
    pullRequest: null,
    taskManager: null
  }

  private _routes: {
    pullRequest: PullRequestRoutes;
    tasks: TasksRoutes;
  } = {
    pullRequest: null,
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
    this._repositories.pullRequest = new PullRequestRepository();
    this._repositories.repository = new RepositoryRepository();
    this._repositories.reviewComment = new ReviewCommentRepository();
    this._repositories.review = new ReviewRepository();
    this._repositories.taskManager = new TaskManagerRepository();
    this._repositories.task = new TaskRepository();
    this._repositories.user = new UserRepository();
  }

  private async createServices(): Promise<void> {
    this._services.pullRequest = new PullRequestService(this._repositories.pullRequest);
    this._services.review = new ReviewService(this._repositories.review, this._services.pullRequest);
    await this.createTaskManager();
  }

  private async createTaskManager(): Promise<void> {
    let taskManagerRepos: any = {
      taskManager: this._repositories.taskManager,
      task: this._repositories.task
    };
    let taskManagerServices: any = {
      pullRequest: this._services.pullRequest,
      review: this._services.review
    };
    this._services.taskManager = new TaskManagerService(taskManagerRepos, taskManagerServices);
    let promise: Promise<void> = new Promise<void>((resolve, reject) => {
      if (this._services.taskManager.ready) {
        console.log("task manager ready: yuhu!");
        resolve();
      } else {
        this._services.taskManager.on("taskManager:ready", () => {
          console.log("task manager ready: yuhu!");
          resolve();
        });
      }
    });
    return promise;
  }

  private createControllers(): void {
    this._controllers.pullRequest = new PullRequestController(this._services.pullRequest, this._services.taskManager, this._services.review);
    this._controllers.taskManager = new TaskManagerController(this._services.taskManager);
  }

  private createRoutes(): void {
    this._routes.pullRequest = new PullRequestRoutes(this._controllers.pullRequest, this._router);
    this._routes.tasks = new TasksRoutes(this._controllers.taskManager, this._router);
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
    this._express.use('/api/', this._routes.pullRequest.routes);
    this._express.use('/api/', this._routes.tasks.routes);
  }

}

export default new App().express;