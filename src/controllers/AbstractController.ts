import { Request, Response } from "express";
import { IPersistenceService } from "../app/services/IPersistenceService";
import { IPullRequestService } from "../app/services/PullRequestService";
import { ITaskManagerService } from "../app/services/TaskManagerService";
import { IReviewService } from "../app/services/ReviewService";
import { IReviewCommentService } from "../app/services/ReviewCommentService";
import { IUserService } from "../app/services/UserService";
import { IRepositoryService } from "../app/services/RepositoryService";
import { IStatsService } from "../app/services/StatsService";
import { EntityUtil } from "../app/util/EntityUtil";
import { RoutesUtil } from "../app/util/RoutesUtil";

interface Services {
  pull: IPullRequestService,
  review: IReviewService,
  reviewComment: IReviewCommentService,
  user: IUserService,
  repo: IRepositoryService,
  taskManager: ITaskManagerService,
  stats: IStatsService
}

export abstract class AbstractController {

    protected readonly _services: Services;

    constructor(services: Services){
        this._services = services;
    }

    protected async getOrderedPage(req: Request, res: Response, service: IPersistenceService<any>, handler: any){
        const page: number = req.params.page;
        const direction: number = RoutesUtil.directionNameToNumber(req.params.direction);
        if (direction === 0) {
            res.status(404).json({ message: "Page not found." });
        }
        else {
            try {
                const entities: any[] = await handler(page, direction);
                const jsonRepos: Object[] = EntityUtil.toJSONArray(entities);
                const lastPage: number = await service.numPages();
                res.json({ data: jsonRepos, last_page: lastPage });
            } catch (error) {
                console.log(error);
                res.status(500).json({ message: "Oops, something went wrong." });
            }
        }
    }

}