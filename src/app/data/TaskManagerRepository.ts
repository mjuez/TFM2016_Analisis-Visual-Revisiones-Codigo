import { IRepository } from "../data/IRepository";
import { AbstractRepository } from "./AbstractRepository";
import { ITaskManagerEntity, TaskManagerEntity } from "../entities/TaskManagerEntity";
import { TaskManagerDocument } from "../entities/documents/TaskManagerDocument";
import { TaskManagerSchema } from "./schemas/TaskManagerSchema";
import * as BluebirdPromise from "bluebird";
import * as mongoose from "mongoose";

/**
 * ITaskRepository interface.
 * Defines custom CRUD operations for a Task.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface ITaskManagerRepository extends IRepository<ITaskManagerEntity, TaskManagerDocument> {
    find(): Promise<ITaskManagerEntity>;
}

/**
 * Task Repository class.
 * @author Mario Juez <mario@mjuez.com>
 */
export class TaskManagerRepository extends AbstractRepository<ITaskManagerEntity, TaskManagerDocument> implements ITaskManagerRepository {

    /** MongoDB collection name. */
    public static readonly COLLECTION_NAME = "taskManager";

    /**
     * Class constructor.
     * Creates the repository using the collection name and the Task schema.
     * @param model     Optional mongoose model dependency injection.
     */
    constructor(model?: mongoose.Model<TaskManagerDocument>) {
        super(TaskManagerRepository.COLLECTION_NAME, TaskManagerSchema.schema, model);
    }

    /**
     * Updates a Task from database. Uses its _id.
     * @param item      Task entity with updated data.
     * @returns a promise that returns the number of rows affected if resolved.
     */
    public update(item: ITaskManagerEntity): BluebirdPromise<number> {
        let promise: BluebirdPromise<number> = new BluebirdPromise<number>((resolve, reject) => {
            this.model.update({ _id: item.document._id }, item.document, (error, rowsAffected) => {
                if (!error) {
                    resolve(rowsAffected);
                } else {
                    reject(error);
                }
            });
        });
        return promise;
    }

    public async find(): Promise<ITaskManagerEntity> {
        let promise: BluebirdPromise<ITaskManagerEntity> = new BluebirdPromise<ITaskManagerEntity>((resolve, reject) => {
            this.model.find()
                .populate('current_task')
                .then((documents) => {
                    let entity: ITaskManagerEntity = TaskManagerEntity.toEntity(documents[0]);
                    resolve(entity);
                }).catch((error) => {
                    reject(error);
                })
        });
        return promise;
    }

    protected convertToEntity(document: TaskManagerDocument): ITaskManagerEntity {
        return TaskManagerEntity.toEntity(document);
    }

    protected convertToEntityArray(documentArray: TaskManagerDocument[]): ITaskManagerEntity[] {
        return TaskManagerEntity.toEntityArray(documentArray);
    }
}