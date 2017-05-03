import { TaskDocument, SubTaskDocument } from "./documents/TaskDocument";
import { AbstractEntity } from "./AbstractEntity";
import { IEntity } from "./IEntity";

export interface ITaskEntity extends IEntity<TaskDocument> {

    isCompleted: boolean,

    creationDate: Date,

    startDate: Date,

    endDate: Date,

    owner: string,

    repository: string,

    currentPage: number

}

export interface ISubTaskEntity extends IEntity<SubTaskDocument> {

    parentTask: ITaskEntity,

    pullRequestNumber: number

}

abstract class AbstractTaskEntity<T extends TaskDocument> extends AbstractEntity<T> implements ITaskEntity {

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

}

export class TaskEntity extends AbstractTaskEntity<TaskDocument>{}

export class SubTaskEntity extends AbstractTaskEntity<SubTaskDocument> implements ISubTaskEntity {

    private _parentTask: ITaskEntity;

    constructor(document: SubTaskDocument, parentTask: ITaskEntity = null) {
        super(document);
        this.parentTask = parentTask;
    }

    get parentTask(): ITaskEntity {
        return this._parentTask;
    }

    set parentTask(parentTask: ITaskEntity){
        this._parentTask = parentTask;
        this.document.parent_id = parentTask.document._id;
    }

    get pullRequestNumber(): number {
        return this.document.pull_request_number;
    }

    set pullRequestNumber(pullRequestNumber: number){
        this.document.pull_request_number = pullRequestNumber;
    }

}