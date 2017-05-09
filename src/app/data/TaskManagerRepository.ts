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
    public static readonly COLLECTION_NAME = "task_manager";

    /**
     * Class constructor.
     * Creates the repository using the collection name and the Task schema.
     * @param model     Optional mongoose model dependency injection.
     */
    constructor(model?: mongoose.Model<TaskManagerDocument>) {
        super(TaskManagerRepository.COLLECTION_NAME, TaskManagerSchema.schema, model);
    }

    public create(item: ITaskManagerEntity): BluebirdPromise<ITaskManagerEntity> {
        let entity: ITaskManagerEntity = this.prepareToBePersisted(item);
        return super.create(entity);
    }

    /**
     * Updates a Task from database. Uses its _id.
     * @param item      Task entity with updated data.
     * @returns a promise that returns the number of rows affected if resolved.
     */
    public update(item: ITaskManagerEntity): BluebirdPromise<number> {
        let promise: BluebirdPromise<number> = new BluebirdPromise<number>((resolve, reject) => {
            let entity: ITaskManagerEntity = this.prepareToBePersisted(item);

            this.model.update({ _id: entity.document._id }, entity.document, (error, rowsAffected) => {
                console.log(rowsAffected);
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
                .then(async (documents) => {
                    let document: TaskManagerDocument = documents[0];
                    let entity: ITaskManagerEntity = TaskManagerEntity.toEntity(document);
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

    private prepareToBePersisted(entity: ITaskManagerEntity): ITaskManagerEntity {
        if (entity.currentTask != null) {
            entity.document.current_task = entity.currentTask.document._id;
        }
        return entity;
    }
}