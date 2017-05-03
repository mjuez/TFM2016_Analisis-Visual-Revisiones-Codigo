import { TaskDocument } from "./documents/TaskDocument";
import { AbstractEntity } from "./AbstractEntity";
import { IEntity } from "./IEntity";
import { TaskType } from "./enum/TaskType";

export interface ITaskEntity extends IEntity<TaskDocument> {
    type: TaskType,
    isCompleted: boolean,
    creationDate: Date,
    startDate: Date,
    endDate: Date,
    owner: string,
    repository: string,
    currentPage: number,
    parentTask?: ITaskEntity,
    currentPullRequestNumber?: number
}

export class TaskEntity extends AbstractEntity<TaskDocument> implements ITaskEntity {

    private _parentTask: ITaskEntity;

    constructor(document: TaskDocument, parentTask?: ITaskEntity) {
        super(document);
        this.parentTask = parentTask;
    }

    get type(): TaskType {
        return this.document.type;
    }

    set type(type: TaskType) {
        this.document.type = type;
    }

    get isCompleted(): boolean {
        return this.document.is_completed;
    }

    set isCompleted(isCompleted: boolean) {
        this.document.is_completed = isCompleted;
    }

    get creationDate(): Date {
        return this.document.creation_date;
    }

    set creationDate(creationDate: Date) {
        this.document.creation_date = creationDate;
    }

    get startDate(): Date {
        return this.document.start_date;
    }

    set startDate(startDate: Date) {
        this.document.start_date = startDate;
    }

    get endDate(): Date {
        return this.document.end_date;
    }

    set endDate(endDate: Date) {
        this.document.end_date = endDate;
    }

    get owner(): string {
        return this.document.owner;
    }

    set owner(owner: string) {
        this.document.owner = owner;
    }

    get repository(): string {
        return this.document.repository;
    }

    set repository(repository: string) {
        this.document.repository = repository;
    }

    get currentPage(): number {
        return this.document.current_page;
    }

    set currentPage(currentPage: number) {
        this.document.current_page = currentPage;
    }

    get parentTask(): ITaskEntity {
        return this._parentTask;
    }

    set parentTask(parentTask: ITaskEntity) {
        this._parentTask = parentTask;
        this.document.parent_id = parentTask.document._id;
    }

    get currentPullRequestNumber(): number {
        return this.document.current_pull_request_number;
    }

    set currentPullRequestNumber(pullRequestNumber: number) {
        this.document.current_pull_request_number = pullRequestNumber;
    }

}