import { Request, Response } from "express";
import { ITaskManagerService } from "../app/services/TaskManagerService";
import { AbstractController } from "./AbstractController";
import { RoutesUtil } from "../app/util/RoutesUtil";

/**
 * TaskManager controller interface.
 * Defines the controllers of API routes related
 * with the task manager.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface ITaskManagerController {

    /**
     * Sends an HTTP response with the
     * task manager status.
     * 
     * @param req   Express request.
     * @param res   Express response.
     */
    getStatus(req: Request, res: Response): Promise<void>;

    /**
     * Sends an HTTP response with a list
     * of pending tasks.
     * 
     * @param req   Express request.
     * @param res   Express response.
     */
    getPendingTasks(req: Request, res: Response): Promise<void>;

    /**
     * Sends an HTTP response with a list
     * of all tasks.
     * 
     * @param req   Express request.
     * @param res   Express response.
     */
    getAllTasks(req: Request, res: Response): Promise<void>;

    /**
     * Creates a task and sends an HTTP 
     * response with information about if
     * was successfull or not.
     * 
     * @param req   Express request.
     * @param res   Express response.
     */
    createTask(req: Request, res: Response): Promise<void>;
}

/**
 * TaskManager controller implementation.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class TaskManagerController extends AbstractController implements ITaskManagerController {

    /**
     * Sends an HTTP response with the
     * task manager status.
     * 
     * @async
     * @param req   Express request.
     * @param res   Express response.
     */
    public async getStatus(req: Request, res: Response): Promise<void> {
        let service: ITaskManagerService = this._services.taskManager;

        if (service.currentTask != null) {
            res.json({ status: "running" });
        } else {
            if (service.error === undefined) {
                res.json({ status: "no tasks pending" });
            } else {
                res.json({ status: { error: service.error } });
            }
        }
    }

    /**
     * Sends an HTTP response with a list
     * of pending tasks.
     * 
     * @async
     * @param req   Express request.
     * @param res   Express response.
     */
    public async getPendingTasks(req: Request, res: Response): Promise<void> {
        let service: ITaskManagerService = this._services.taskManager;
        res.json(await service.getPendingTasks());
    }

    /**
     * Sends an HTTP response with a list
     * of all tasks.
     * 
     * @async
     * @param req   Express request.
     * @param res   Express response.
     */
    public async getAllTasks(req: Request, res: Response): Promise<void> {
        let service: ITaskManagerService = this._services.taskManager;
        res.json(await service.getAllTasks());
    }

    /**
     * Creates a task and sends an HTTP 
     * response with information about if
     * was successfull or not.
     * 
     * @async
     * @param req   Express request.
     * @param res   Express response.
     */
    public async createTask(req: Request, res: Response): Promise<void> {
        let owner: string = req.params.owner;
        let repository: string = req.params.repository;
        let service: ITaskManagerService = this._services.taskManager;

        let created: boolean = await service.createTask(owner, repository);
        if (created) {
            res.json({ message: "task created successfully." });
        } else {
            RoutesUtil.errorResponse(res);
        }
    }

}