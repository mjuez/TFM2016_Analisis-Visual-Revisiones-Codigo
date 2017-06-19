import { ITaskEntity, TaskEntity } from "../entities/TaskEntity";
import { TaskDocument } from "../entities/documents/TaskDocument";
import { TaskType } from "../entities/enum/TaskType";

/**
 * Task utilities.
 * 
 * @author Mario Juez <mario[at]mjuez.com> 
 */
export class TaskUtil {

    /**
     * Creates a main task entity.
     * 
     * @param owner         repository owner login.
     * @param repository    repository name.
     * @returns created task entity.
     */
    public static buildMainTaskEntity(owner: string, repository: string): ITaskEntity {
        const document: TaskDocument = <TaskDocument>{
            type: TaskType.ALL,
            is_completed: false,
            creation_date: new Date(),
            start_date: null,
            end_date: null,
            owner: owner,
            repository: repository,
            current_page: 1
        };
        const taskEntity: ITaskEntity = new TaskEntity(document);
        return taskEntity;
    }

    /**
     * Creates a subtask entity.
     * 
     * @param owner         repository owner login.
     * @param repository    repository name.
     * @returns created task entity.
     */
    public static buildSubTaskEntity(parentTask: ITaskEntity, taskType: TaskType): ITaskEntity {
        const document: TaskDocument = <TaskDocument>{
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
        const taskEntity: ITaskEntity = new TaskEntity(document);
        return taskEntity;
    }

}