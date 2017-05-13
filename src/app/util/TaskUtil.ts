import { ITaskEntity, TaskEntity } from "../entities/TaskEntity";
import { TaskDocument } from "../entities/documents/TaskDocument";
import { TaskType } from "../entities/enum/TaskType";

export class TaskUtil {

    public static buildMainTask(owner: string, repository: string): ITaskEntity {
        let document: TaskDocument = <TaskDocument>{
            type: TaskType.ALL,
            is_completed: false,
            creation_date: new Date(),
            start_date: null,
            end_date: null,
            owner: owner,
            repository: repository,
            current_page: 1
        };
        let taskEntity: ITaskEntity = new TaskEntity(document);
        return taskEntity;
    }

    public static buildSubTask(parentTask: ITaskEntity, taskType: TaskType): ITaskEntity {
        let document: TaskDocument = <TaskDocument>{
            type: taskType,
            is_completed: false,
            creation_date: new Date(),
            start_date: null,
            end_date: null,
            owner: parentTask.owner,
            repository: parentTask.repository,
            current_page: 1,
            parent: parentTask.document._id,
            last_processed: 0
        };
        let taskEntity: ITaskEntity = new TaskEntity(document);
        return taskEntity;
    }

}