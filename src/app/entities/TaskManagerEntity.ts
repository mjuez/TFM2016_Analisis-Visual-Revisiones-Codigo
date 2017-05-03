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
    
}