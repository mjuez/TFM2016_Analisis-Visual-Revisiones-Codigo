import { Router, Request, Response, NextFunction } from "express";
import { ITaskManagerService, TaskManagerService } from "../app/services/TaskManagerService";
import * as mongoose from "mongoose";
import * as GitHubAPI from "github";
import * as BluebirdPromise from "bluebird";

/**
 * TaskManager controller interface.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface ITaskManagerController {

    /**
     * Gets the task manager status.
     * @param req   API request.
     * @param res   API response.
     */
    getStatus(req: Request, res: Response);

    /**
     * Gets the list of pending tasks.
     * @param req   API request.
     * @param res   API response.
     */
    getPendingTasks(req: Request, res: Response);

    /**
     * Gets the list of all tasks.
     * @param req   API request.
     * @param res   API response.
     */
    getAllTasks(req: Request, res: Response);
}

/**
 * Task Manager controller.
 * Defines Task manager requests handling.
 * @implements ITaskManagerController.
 */
export class TaskManagerController implements ITaskManagerController {

    private _taskManagerService: ITaskManagerService;

    /**
     * Class constructor.
     */
    constructor(taskManagerService: ITaskManagerService) {
        this._taskManagerService = taskManagerService;
    }

    /** @inheritdoc */
    public getStatus(req: Request, res: Response) {
        let service: ITaskManagerService = this._taskManagerService;

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

    /** @inheritdoc */
    public async getPendingTasks(req: Request, res: Response) {
        let service: ITaskManagerService = this._taskManagerService;
        res.json(await service.getPendingTasks());
    }

    /** @inheritdoc */
    public async getAllTasks(req: Request, res: Response) {
        let service: ITaskManagerService = this._taskManagerService;
        res.json(await service.getAllTasks());
    }

}