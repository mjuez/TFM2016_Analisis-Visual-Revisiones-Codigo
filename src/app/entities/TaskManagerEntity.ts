import { TaskManagerDocument, TaskManagerStatus } from "./documents/TaskManagerDocument";
import { AbstractEntity } from "./AbstractEntity";
import { ITaskEntity, TaskEntity } from "./TaskEntity";
import { IEntity } from "./IEntity";

export interface ITaskManagerEntity extends IEntity<TaskManagerDocument> {
    currentTask: ITaskEntity,
    status: TaskManagerStatus
}

export class TaskManagerEntity extends AbstractEntity<TaskManagerDocument> implements ITaskManagerEntity {
    
    private _currentTask: ITaskEntity;

    constructor(document: TaskManagerDocument, currentTask?: ITaskEntity){
        super(document);
        this._currentTask = currentTask;
    }

    get currentTask(): ITaskEntity {
        return this._currentTask;
    }

    set currentTask(currentTask: ITaskEntity){
        this._currentTask = currentTask;
        this.document.current_task_id = currentTask.document._id;
    }

    get status(): TaskManagerStatus {
        return this.document.status;
    }

    set status(status: TaskManagerStatus) {
        this.document.status = status;
    }

    /**
     * Transforms raw data to ITaskManagerEntity.
     * @param data  raw data.
     * @returns a task manager entity.
     */
    public static toEntity(data: any): ITaskManagerEntity {
        let entity: ITaskManagerEntity = new TaskManagerEntity(<TaskManagerDocument>data);
        return entity;
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