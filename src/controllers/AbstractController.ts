import { IPullRequestService } from "../app/services/PullRequestService";
import { ITaskManagerService } from "../app/services/TaskManagerService";
import { IReviewService } from "../app/services/ReviewService";
import { IReviewCommentService } from "../app/services/ReviewCommentService";
import { IUserService } from "../app/services/UserService";
import { IRepositoryService } from "../app/services/RepositoryService";

interface Services {
  pull: IPullRequestService,
  review: IReviewService,
  reviewComment: IReviewCommentService,
  user: IUserService,
  repo: IRepositoryService,
  taskManager: ITaskManagerService
}

export abstract class AbstractController {

    protected readonly _services: Services;

    constructor(services: Services){
        this._services = services;
    }

}