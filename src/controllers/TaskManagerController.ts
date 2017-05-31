import { Router, Request, Response, NextFunction } from "express";
import { ITaskManagerService, TaskManagerService } from "../app/services/TaskManagerService";
import { AbstractController } from "./AbstractController";
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
    getStatus(req: Request, res: Response): Promise<void>;

    /**
     * Gets the list of pending tasks.
     * @param req   API request.
     * @param res   API response.
     */
    getPendingTasks(req: Request, res: Response): Promise<void>;

    /**
     * Gets the list of all tasks.
     * @param req   API request.
     * @param res   API response.
     */
    getAllTasks(req: Request, res: Response): Promise<void>;

    createTask(req: Request, res: Response): Promise<void>;
}

/**
 * Task Manager controller.
 * Defines Task manager requests handling.
 * @implements ITaskManagerController.
 */
export class TaskManagerController extends AbstractController implements ITaskManagerController {

    /** @inheritdoc */
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

    /** @inheritdoc */
    public async getPendingTasks(req: Request, res: Response): Promise<void> {
        let service: ITaskManagerService = this._services.taskManager;
        res.json(await service.getPendingTasks());
    }

    /** @inheritdoc */
    public async getAllTasks(req: Request, res: Response): Promise<void> {
        let service: ITaskManagerService = this._services.taskManager;
        res.json(await service.getAllTasks());
    }

    public async createTask(req: Request, res: Response): Promise<void> {
        let owner: string = req.params.owner;
        let repository: string = req.params.repository;
        let service: ITaskManagerService = this._services.taskManager;

        let created: boolean = await service.createTask(owner, repository);
        if (created) {
            res.json({ message: "task created successfully." });
        } else {
            res.status(500).json({ message: "Oops, something went wrong." });
        }
    }

}