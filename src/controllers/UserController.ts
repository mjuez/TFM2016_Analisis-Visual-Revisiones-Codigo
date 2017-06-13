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

    /**
     * Gets an user entity and returns it as JSON data
     * through HTTP response.
     * @async
     * @param req   express request object.
     * @param res   express response object.
     */
    get(req: Request, res: Response): Promise<void>;

    /**
     * Gets a page of user entities and returns it as 
     * JSON data through HTTP response.
     * User entities are ordered by date depending the
     * direction parameter from HTTP request.
     * @async
     * @param req   express request object.
     * @param res   express response object.
     */
    getPage(req: Request, res: Response): Promise<void>;

    /**
     * Gets a page of user entities and returns it as 
     * JSON data through HTTP response.
     * User entities are ordered by name depending the
     * direction parameter from HTTP request.
     * @async
     * @param req   express request object.
     * @param res   express response object.
     */
    getByNamePage(req: Request, res: Response): Promise<void>;

    /**
     * Gets a page of user entities and returns it as 
     * JSON data through HTTP response.
     * User entities are ordered by number of pull requests
     * depending the direction parameter from HTTP request.
     * @async
     * @param req   express request object.
     * @param res   express response object.
     */
    getByPullRequestsPage(req: Request, res: Response): Promise<void>;

    /**
     * Gets a page of user entities and returns it as 
     * JSON data through HTTP response.
     * User entities are ordered by number of reviews
     * depending the direction parameter from HTTP request.
     * @async
     * @param req   express request object.
     * @param res   express response object.
     */
    getByReviewsPage(req: Request, res: Response): Promise<void>;

    /**
     * Gets a page of user entities and returns it as 
     * JSON data through HTTP response.
     * User entities are ordered by number of reviews of
     * a specific state (APPROVED, COMMENTED, CHANGES_REQUESTED, DISMISSED)
     * depending the direction parameter from HTTP request.
     * @async
     * @param req   express request object.
     * @param res   express response object.
     */
    getByReviewsByStatePage(req: Request, res: Response): Promise<void>;

    /**
     * Gets a page of user entities and returns it as 
     * JSON data through HTTP response.
     * User entities are ordered by number of review comments
     * depending the direction parameter from HTTP request.
     * @async
     * @param req   express request object.
     * @param res   express response object.
     */
    getByReviewCommentsPage(req: Request, res: Response): Promise<void>;

    /**
     * Gets an object with user mean statistics and 
     * returns it as JSON data through HTTP response.
     * @async
     * @param req   express request object.
     * @param res   express response object.
     */
    getStatsMeans(req: Request, res: Response): Promise<void>;

}

/**
 * User controller.
 * Defines User HTTP requests handling.
 * @extends AbstractController.
 * @implements IUserController.
 */
export class UserController extends AbstractController implements IUserController {

    /** @inheritdoc */
    public get = async (req: Request, res: Response): Promise<void> => {
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

    /** @inheritdoc */
    public getPage = async (req: Request, res: Response): Promise<void> => {
        const service: IUserService = this._services.user;
        await this.getOrderedPage(req, res, service, service.getUsersPage);
    }

    /** @inheritdoc */
    public getByNamePage = async (req: Request, res: Response): Promise<void> => {
        const service: IUserService = this._services.user;
        await this.getOrderedPage(req, res, service, service.getUsersByNamePage);
    }

    /** @inheritdoc */
    public getByPullRequestsPage = async (req: Request, res: Response): Promise<void> => {
        const service: IUserService = this._services.user;
        await this.getOrderedPage(req, res, service, service.getUsersByPullRequestsPage);
    }

    /** @inheritdoc */
    public getByReviewsPage = async (req: Request, res: Response): Promise<void> => {
        const service: IUserService = this._services.user;
        await this.getOrderedPage(req, res, service, service.getUsersByReviewsPage);
    }

    /** @inheritdoc */
    public getByReviewsByStatePage = async (req: Request, res: Response): Promise<void> => {
        const service: IUserService = this._services.user;
        const state: string = req.params.state;
        const handler = async (page: number, direction: number): Promise<IUserEntity[]> => {
            return await service.getUsersByReviewsByStatePage(page, state, direction);
        }
        await this.getOrderedPage(req, res, service, handler);
    }

    /** @inheritdoc */
    public getByReviewCommentsPage = async (req: Request, res: Response): Promise<void> => {
        const service: IUserService = this._services.user;
        await this.getOrderedPage(req, res, service, service.getUsersByReviewCommentsPage);
    }

    /** @inheritdoc */
    public getStatsMeans = async (req: Request, res: Response): Promise<void> => {
        const service: IUserService = this._services.user;
        try {
            const means: Object = await service.getUsersStatsMeans();
            res.json(means);
        } catch (error) {
            res.status(500).json({ message: "Oops, something went wrong." });
        }
    }

}