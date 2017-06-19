import { TaskDocument } from "./documents/TaskDocument";
import { AbstractEntity } from "./AbstractEntity";
import { IEntity } from "./IEntity";
import { TaskType } from "./enum/TaskType";
import { EntityUtil } from "../util/EntityUtil";

/**
 * Task entity interface.
 * Exposes the properties of a task and
 * useful business logic for a task.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface ITaskEntity extends IEntity<TaskDocument> {

    /** Task type. */
    type: TaskType,

    /** If the task is completed. */
    isCompleted: boolean,

    /** When the task is created. */
    creationDate: Date,

    /** When the task starts running. */
    startDate: Date,

    /** When the task ends. */
    endDate: Date,

    /** Owner login of the repository. */
    owner: string,

    /** Repository name. */
    repository: string,

    /** Current GitHub API page. */
    currentPage: number,

    /** Optional parent task. */
    parentTask?: ITaskEntity,

    /** Optional last entity processed. */
    lastProcessed?: number,

    /** If is a subtask. */
    isSubTask(): boolean
}

/**
 * Task entity.
 * Implements the properties of a task and
 * useful business logic for a task.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class TaskEntity extends AbstractEntity<TaskDocument> implements ITaskEntity {

    /** Parent task. */
    private _parentTask: ITaskEntity;

    /**
     * Task entity constructor.
     * Sets the parent task as entity if any.
     * 
     * @param document raw data.
     */
    constructor(document: TaskDocument) {
        super(document);
        if (this.document.parent && 'type' in this.document.parent) {
            this.parentTask = new TaskEntity(this.document.parent);
        }
    }

    /**
     * Gets the task type.
     * 
     * @returns the task type.
     */
    public get type(): TaskType {
        return this.document.type;
    }

    /**
     * Sets the task type.
     * 
     * @param type task type.
     */
    public set type(type: TaskType) {
        this.document.type = type;
    }

    /**
     * Gets if the task is completed.
     * 
     * @returns if completed.
     */
    public get isCompleted(): boolean {
        return this.document.is_completed;
    }

    /**
     * Sets if the task is completed.
     */
    public set isCompleted(isCompleted: boolean) {
        this.document.is_completed = isCompleted;
    }

    /**
     * Gets when the task was created.
     * 
     * @returns creation date.
     */
    public get creationDate(): Date {
        return this.document.creation_date;
    }

    /**
     * Sets when the task was created.
     */
    public set creationDate(creationDate: Date) {
        this.document.creation_date = creationDate;
    }

    /**
     * Returns when the task was started.
     * 
     * @returns start date.
     */
    public get startDate(): Date {
        return this.document.start_date;
    }

    /**
     * Sets when the task was started.
     */
    public set startDate(startDate: Date) {
        this.document.start_date = startDate;
    }

    /**
     * Gets when the task was finished.
     * 
     * @returns end date.
     */
    public get endDate(): Date {
        return this.document.end_date;
    }

    /**
     * Sets when the task was finished.
     */
    public set endDate(endDate: Date) {
        this.document.end_date = endDate;
    }

    /**
     * Gets the repository owner login.
     * 
     * @returns repository owner.
     */
    public get owner(): string {
        return this.document.owner;
    }

    /**
     * Sets the repository owner login.
     */
    public set owner(owner: string) {
        this.document.owner = owner;
    }

    /**
     * Gets the repository name.
     * 
     * @returns repository name.
     */
    public get repository(): string {
        return this.document.repository;
    }

    /**
     * Sets the repository name.
     */
    public set repository(repository: string) {
        this.document.repository = repository;
    }

    /**
     * Gets the number of the page that is
     * currently being obtained from GitHub
     * API.
     * 
     * @returns current page.
     */
    public get currentPage(): number {
        return this.document.current_page;
    }

    /**
     * Sets the number of the page that is
     * currently being obtained from GitHub
     * API.
     */
    public set currentPage(currentPage: number) {
        this.document.current_page = currentPage;
    }

    /**
     * Gets the parent task.
     * 
     * @return parent task.
     */
    public get parentTask(): ITaskEntity {
        return this._parentTask;
    }

    /**
     * Sets the parent task.
     */
    public set parentTask(parentTask: ITaskEntity) {
        if (!parentTask.isSubTask()) {
            this._parentTask = parentTask;
            this.document.parent = parentTask.document._id;
        }
    }

    /**
     * Gets last processed entity id.
     * 
     * @returns last processed entity id.
     */
    public get lastProcessed(): number {
        return this.document.last_processed;
    }

    /**
     * Sets last processed entity id.
     */
    public set lastProcessed(lastProcessed: number) {
        this.document.last_processed = lastProcessed
    }

    /**
     * A task is a subtask if has a parent task.
     * 
     * @returns if is subtask.
     */
    public isSubTask(): boolean {
        return this._parentTask != null || undefined;
    }

    /**
     * Transforms raw data to ITaskEntity.
     * 
     * @param data  raw data.
     * @returns a task entity.
     */
    public static toEntity(data: any): ITaskEntity {
        if (data) {
            let entity: ITaskEntity = new TaskEntity(<TaskDocument>data);
            return entity;
        }
        return null;
    }

    /**
     * Transforms raw data to ITaskEntity array.
     * 
     * @param data  raw data.
     * @returns an array of task entities.
     */
    public static toTaskEntityArray(data: any[]): ITaskEntity[] {
        const taskEntityArray: ITaskEntity[] = <ITaskEntity[]>
            EntityUtil.toEntityArray(data, TaskEntity.toEntity);
        return taskEntityArray;
    }

}