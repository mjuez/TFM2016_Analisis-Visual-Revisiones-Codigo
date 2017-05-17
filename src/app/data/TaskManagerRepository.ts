import { IRepository } from "../data/IRepository";
import { AbstractRepository } from "./AbstractRepository";
import { ITaskManagerEntity, TaskManagerEntity } from "../entities/TaskManagerEntity";
import { TaskManagerDocument } from "../entities/documents/TaskManagerDocument";
import { TaskManagerSchema } from "./schemas/TaskManagerSchema";
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

    public create(item: ITaskManagerEntity): Promise<ITaskManagerEntity> {
        let entity: ITaskManagerEntity = this.prepareToBePersisted(item);
        return super.create(entity);
    }

    public async find(): Promise<ITaskManagerEntity> {
        try {
            let documents: TaskManagerDocument[] = await this.model.find()
                .populate('current_task');
            let entity: ITaskManagerEntity = TaskManagerEntity.toEntity(documents[0]);
            return entity;
        } catch (error) {
            throw error;
        }
    }

    protected convertToEntity(document: TaskManagerDocument): ITaskManagerEntity {
        return TaskManagerEntity.toEntity(document);
    }

    protected convertToEntityArray(documentArray: TaskManagerDocument[]): ITaskManagerEntity[] {
        return TaskManagerEntity.toEntityArray(documentArray);
    }

    protected updateFilter(item: ITaskManagerEntity): Object {
        return { _id: item.document._id };
    }

    private prepareToBePersisted(entity: ITaskManagerEntity): ITaskManagerEntity {
        if (entity.currentTask != null) {
            entity.document.current_task = entity.currentTask.document._id;
        }
        return entity;
    }
}