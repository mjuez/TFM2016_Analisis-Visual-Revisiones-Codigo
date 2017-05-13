import { TaskManagerDocument, TaskManagerError } from "./documents/TaskManagerDocument";
import { TaskDocument } from "./documents/TaskDocument";
import { AbstractEntity } from "./AbstractEntity";
import { ITaskEntity, TaskEntity } from "./TaskEntity";
import { IEntity } from "./IEntity";

export interface ITaskManagerEntity extends IEntity<TaskManagerDocument> {
    currentTask: ITaskEntity,
    error: TaskManagerError
}

export class TaskManagerEntity extends AbstractEntity<TaskManagerDocument> implements ITaskManagerEntity {

    private _currentTask: ITaskEntity;

    constructor(document: TaskManagerDocument) {
        super(document);
        if (this.document.current_task && 'type' in this.document.current_task) {
            this._currentTask = new TaskEntity(this.document.current_task);
        }
    }

    get currentTask(): ITaskEntity {
        return this._currentTask;
    }

    set currentTask(currentTask: ITaskEntity) {
        this._currentTask = currentTask;
        if (currentTask === null) {
            this.document.current_task = null;
        } else {
            this.document.current_task = currentTask.document._id;
        }
    }

    get error(): TaskManagerError {
        return this.document.error;
    }

    set error(error: TaskManagerError) {
        this.document.error = error;
    }

    /**
     * Transforms raw data to ITaskManagerEntity.
     * @param data  raw data.
     * @returns a task manager entity.
     */
    public static toEntity(data: any): ITaskManagerEntity {
        if (data) {
            let entity: ITaskManagerEntity = new TaskManagerEntity(<TaskManagerDocument>data);
            return entity;
        }
        return null;
    }

    /**
     * Transforms raw data to ITaskManagerEntity array.
     * @param data  raw data.
     * @returns an array of task manager entities.
     */
    public static toEntityArray(data: any[]): ITaskManagerEntity[] {
        let entityArray: ITaskManagerEntity[] = [];
        if (data.length > 0) {
            data.map((jsonObject) => {
                let entity: ITaskManagerEntity = this.toEntity(jsonObject);
                entityArray.push(entity);
            });
        }
        return entityArray;
    }

}