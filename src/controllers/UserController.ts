import { Router, Request, Response, NextFunction } from "express";
import { AbstractController } from "./AbstractController";
import { IUserService } from "../app/services/UserService";
import { IUserEntity } from "../app/entities/UserEntity";
import { EntityUtil } from "../app/util/EntityUtil";
import { RoutesUtil } from "../app/util/RoutesUtil";

/**
 * User controller interface.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IUserController {

    get(req: Request, res: Response): Promise<void>;
    getPage(req: Request, res: Response): Promise<void>;
    getByNamePage(req: Request, res: Response): Promise<void>;
    getByPullRequestsPage(req: Request, res: Response): Promise<void>;
    getByReviewsPage(req: Request, res: Response): Promise<void>;
    getByReviewsByStatePage(req: Request, res: Response): Promise<void>;
    getByReviewCommentsPage(req: Request, res: Response): Promise<void>;
    getStatsMedians(req: Request, res: Response): Promise<void>;

}

/**
 * User controller.
 * Defines User requests handling.
 * @extends AbstractController.
 * @implements IUserController.
 */
export class UserController extends AbstractController implements IUserController {

    public async get(req: Request, res: Response): Promise<void> {
        const service: IUserService = this._services.user;
        const username: string = req.params.username;

        try {
            const user: IUserEntity = await service.getUser(username);
            const json: Object = EntityUtil.toJSON(user);
            res.json(json);
        } catch (error) {
            res.status(500).json({ message: "Oops, something went wrong." });
        }
    }

    public async getPage(req: Request, res: Response): Promise<void> {
        const service: IUserService = this._services.user;
        await this.getOrderedPage(req, res, service, handler);

        async function handler(page: number, direction: number): Promise<IUserEntity[]>{
            return service.getUsersPage(page, direction);
        }
    }

    public async getByNamePage(req: Request, res: Response): Promise<void> {
        const service: IUserService = this._services.user;
        await this.getOrderedPage(req, res, service, handler);

        async function handler(page: number, direction: number): Promise<IUserEntity[]>{
            return service.getUsersByNamePage(page, direction);
        }
    }

    public async getByPullRequestsPage(req: Request, res: Response): Promise<void> {
        const service: IUserService = this._services.user;
        await this.getOrderedPage(req, res, service, handler);

        async function handler(page: number, direction: number): Promise<IUserEntity[]>{
            return service.getUsersByPullRequestsPage(page, direction);
        }
    }

    public async getByReviewsPage(req: Request, res: Response): Promise<void> {
        const service: IUserService = this._services.user;
        await this.getOrderedPage(req, res, service, handler);

        async function handler(page: number, direction: number): Promise<IUserEntity[]>{
            return service.getUsersByReviewsPage(page, direction);
        }
    }

    public async getByReviewsByStatePage(req: Request, res: Response): Promise<void> {
        const service: IUserService = this._services.user;
        const state: string = req.params.state;
        await this.getOrderedPage(req, res, service, handler);

        async function handler(page: number, direction: number): Promise<IUserEntity[]>{
            return service.getUsersByReviewsByStatePage(page, state, direction);
        }
    }

    public async getByReviewCommentsPage(req: Request, res: Response): Promise<void> {
        const service: IUserService = this._services.user;
        await this.getOrderedPage(req, res, service, handler);

        async function handler(page: number, direction: number): Promise<IUserEntity[]>{
            return service.getUsersByReviewCommentsPage(page, direction);
        }
    }

    public async getStatsMedians(req: Request, res: Response): Promise<void> {
        const service: IUserService = this._services.user;
        try {
            const medians: Object = await service.getUsersStatsMedians();
            res.json(medians);
        } catch (error) {
            res.status(500).json({ message: "Oops, something went wrong." });
        }
    }

}