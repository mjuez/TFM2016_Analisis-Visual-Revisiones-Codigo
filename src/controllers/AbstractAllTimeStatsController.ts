import { Request, Response } from "express";
import { RoutesUtil } from "../app/util/RoutesUtil";
import { AbstractController } from "./AbstractController";

/**
 * Abstract all time stats Controller.
 * Implements shared functionality for other controllers.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export abstract class AbstractAllTimeStatsController extends AbstractController {

    /**
     * Sends an HTTP response with all time 
     * statistics of an user.
     * 
     * @async
     * @param req               Express request.
     * @param res               Express response.
     * @param userStatsHandler  user stats getter handler.
     */
    protected async _getAllTimeStatsByUser(req: Request, res: Response, userStatsHandler: any): Promise<void> {
        const userLogin: string = req.params.userlogin;
        try {
            const stats: any = await userStatsHandler(userLogin);
            res.json(stats);
        } catch (error) {
            console.log(error);
            RoutesUtil.errorResponse(res);
        }
    }
    
    /**
     * Sends an HTTP response with all time 
     * statistics of a repository.
     * 
     * @async
     * @param req               Express request.
     * @param res               Express response.
     * @param repoStatsHandler  repository stats getter handler.
     */
    protected async _getAllTimeStatsByRepository(req: Request, res: Response, repoStatsHandler: any): Promise<void> {
        const owner: string = req.params.owner;
        const repository: string = req.params.repository;
        try {
            const stats: any = await repoStatsHandler(owner, repository);
            res.json(stats);
        } catch (error) {
            console.log(error);
            RoutesUtil.errorResponse(res);
        }
    }

}