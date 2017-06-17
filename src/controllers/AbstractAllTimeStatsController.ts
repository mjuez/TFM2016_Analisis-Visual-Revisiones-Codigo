import { Request, Response } from "express";
import { IPersistenceService } from "../app/services/IPersistenceService";
import { EntityUtil } from "../app/util/EntityUtil";
import { RoutesUtil } from "../app/util/RoutesUtil";
import { IServices } from "../app/services/IServices";
import { AbstractController } from "./AbstractController";

/**
 * Abstract all time stats Controller.
 * Implements shared functionality for other controllers.
 * 
 * @author Mario Juez <mario@mjuez.com>
 */
export abstract class AbstractAllTimeStatsController extends AbstractController {

    protected async getAllTimeStatsByUser(req: Request, res: Response, userStatsHandler: any): Promise<void> {
        const userLogin: string = req.params.userlogin;
        try {
            const stats: any = await userStatsHandler(userLogin);
            res.json(stats);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Oops, something went wrong." });
        }
    }
    
    protected async _getAllTimeStatsByRepository(req: Request, res: Response, repoStatsHandler: any): Promise<void> {
        const owner: string = req.params.owner;
        const repository: string = req.params.repository;
        try {
            const stats: any = await repoStatsHandler(owner, repository);
            res.json(stats);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Oops, something went wrong." });
        }
    }

}