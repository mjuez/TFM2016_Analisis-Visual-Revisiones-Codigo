import { IRepository } from "../data/IRepository";
import { AbstractRepository } from "./AbstractRepository";
import { ITaskEntity, TaskEntity } from "../entities/TaskEntity";
import { TaskDocument } from "../entities/documents/TaskDocument";
import { TaskSchema } from "./schemas/TaskSchema";
import * as mongoose from "mongoose";

/**
 * ITaskRepository interface.
 * Defines custom CRUD operations for a Task.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface ITaskRepository extends IRepository<ITaskEntity, TaskDocument> {
    findById(id: any): Promise<ITaskEntity>;
    findNext(): Promise<ITaskEntity>;
}

/**
 * Task Repository class.
 * @author Mario Juez <mario@mjuez.com>
 */
export class TaskRepository extends AbstractRepository<ITaskEntity, TaskDocument> implements ITaskRepository {

    /** MongoDB collection name. */
    public static readonly COLLECTION_NAME = "task";

    /**
     * Class constructor.
     * Creates the repository using the collection name and the Task schema.
     * @param model     Optional mongoose model dependency injection.
     */
    constructor(model?: mongoose.Model<TaskDocument>) {
        super(TaskRepository.COLLECTION_NAME, TaskSchema.schema, model);
    }

    /**
     * Updates a Task from database. Uses its _id.
     * @param item      Task entity with updated data.
     * @returns a promise that returns the number of rows affected if resolved.
     */
    public update(item: ITaskEntity): Promise<number> {
        let promise: Promise<number> = new Promise<number>((resolve, reject) => {
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

    public findById(id: any): Promise<ITaskEntity> {
        let promise: Promise<ITaskEntity> = new Promise<ITaskEntity>((resolve, reject) => {
            this.model.findById(id)
                .populate('parent')
                .then((document) => {
                    let entity: ITaskEntity = TaskEntity.toEntity(document);
                    resolve(entity);
                }).catch((error) => {
                    reject(error);
                });
        });
        return promise;
    }

    public findNext(): Promise<ITaskEntity> {
        let promise: Promise<ITaskEntity> = new Promise<ITaskEntity>((resolve, reject) => {
            this.model.findOne({ is_completed: false })
                .sort({ creation_date: 1 })
                .populate('parent')
                .then((document) => {
                    let entity: ITaskEntity = TaskEntity.toEntity(document);
                    resolve(entity);
                }).catch((error) => {
                    reject(error);
                });
        });
        return promise;
    }

    public retrieve(filter: Object = {}): Promise<ITaskEntity[]> {
        let promise: Promise<ITaskEntity[]> = new Promise<ITaskEntity[]>((resolve, reject) => {
            this.model.find(filter)
                .sort({ creation_date: 1 })
                .populate('parent')
                .then((documents) => {
                    let entityArray: ITaskEntity[] = this.convertToEntityArray(documents);
                    resolve(entityArray);
                }).catch((error) => {
                    reject(error);
                });
        });

        return promise;
    }

    protected convertToEntity(document: TaskDocument): ITaskEntity {
        return TaskEntity.toEntity(document);
    }

    protected convertToEntityArray(documentArray: TaskDocument[]): ITaskEntity[] {
        return TaskEntity.toEntityArray(documentArray);
    }
}