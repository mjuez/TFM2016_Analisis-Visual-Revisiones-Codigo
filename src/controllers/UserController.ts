import { Request, Response } from "express";
import { AbstractController } from "./AbstractController";
import { IUserService } from "../app/services/UserService";
import { IUserEntity } from "../app/entities/UserEntity";
import { EntityUtil } from "../app/util/EntityUtil";
import { RoutesUtil } from "../app/util/RoutesUtil";

/**
 * User controller interface.
 * Defines the controllers of API routes related
 * with user data.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IUserController {

    /**
     * Sends an HTTP response with JSON data of
     * one user.
     * 
     * @param req   Express request.
     * @param res   Express response.
     */
    get(req: Request, res: Response): Promise<void>;

    /**
     * Sends an HTTP response with JSON array of
     * a page with data of users.
     * 
     * @param req   Express request.
     * @param res   Express response.
     * @param type  Optional page type.
     */
    getUserPageBy(req: Request, res: Response, type?: string): Promise<void>;

    /**
     * Sends an HTTP response with JSON array of
     * a page with data of users
     * User entities are ordered by number of reviews of
     * a specific state (APPROVED, COMMENTED, CHANGES_REQUESTED, DISMISSED)
     * depending the direction parameter from HTTP request.
     * 
     * @param req   Express request.
     * @param res   Express response.
     */
    getByReviewsByStatePage(req: Request, res: Response): Promise<void>;

    /**
     * Sends an HTTP response with users
     * mean statistics.
     * 
     * @param req   Express request.
     * @param res   Express response.
     */
    getStatsMeans(req: Request, res: Response): Promise<void>;

}

/**
 * User controller implementation.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class UserController extends AbstractController implements IUserController {

    /**
     * Sends an HTTP response with JSON data of
     * one user.
     * 
     * @async
     * @param req   Express request.
     * @param res   Express response.
     */
    public get = async (req: Request, res: Response): Promise<void> => {
        const service: IUserService = this._services.user;
        const username: string = req.params.username;

        try {
            const user: IUserEntity = await service.getUser(username);
            const json: Object = EntityUtil.toJSON(user);
            res.json(json);
        } catch (error) {
            RoutesUtil.errorResponse(res);
        }
    }

    /**
     * Sends an HTTP response with JSON array of
     * a page with data of users.
     * 
     * @async
     * @param req   Express request.
     * @param res   Express response.
     * @param type  Optional page type.
     */
    public getUserPageBy = async (req: Request, res: Response, type?: string): Promise<void> => {
        const userPageHandler: any = this._services.user.getUserPageHandler(type);
        await this.getOrderedPage(req, res, this._services.user, userPageHandler);
    }

    /**
     * Sends an HTTP response with JSON array of
     * a page with data of users
     * User entities are ordered by number of reviews of
     * a specific state (APPROVED, COMMENTED, CHANGES_REQUESTED, DISMISSED)
     * depending the direction parameter from HTTP request.
     * 
     * @async
     * @param req   Express request.
     * @param res   Express response.
     */
    public getByReviewsByStatePage = async (req: Request, res: Response): Promise<void> => {
        const service: IUserService = this._services.user;
        const state: string = req.params.state;
        const handler = async (page: number, direction: number): Promise<IUserEntity[]> => {
            return await service.getUsersByReviewsByStatePage(page, state, direction);
        }
        await this.getOrderedPage(req, res, service, handler);
    }

    /**
     * Sends an HTTP response with users
     * mean statistics.
     * 
     * @async
     * @param req   Express request.
     * @param res   Express response.
     */
    public getStatsMeans = async (req: Request, res: Response): Promise<void> => {
        const service: IUserService = this._services.user;
        try {
            const means: Object = await service.getUsersStatsMeans();
            res.json(means);
        } catch (error) {
            RoutesUtil.errorResponse(res);
        }
    }

}