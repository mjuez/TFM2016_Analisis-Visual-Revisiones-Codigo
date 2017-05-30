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

    public async findById(id: any): Promise<ITaskEntity> {
        try {
            let document: TaskDocument = await this.model.findById(id)
                .populate('parent');
            let entity: ITaskEntity = this.convertToEntity(document);
            return entity;
        } catch (error) {
            throw error;
        }
    }

    public async findNext(): Promise<ITaskEntity> {
        try {
            let document: TaskDocument = await this.model.findOne({ is_completed: false })
                .sort({ creation_date: 1 })
                .populate('parent');
            let entity: ITaskEntity = this.convertToEntity(document);
            return entity;
        } catch (error) {
            throw error;
        }
    }

    public async retrieve(filter: Object = {}): Promise<ITaskEntity[]> {
        try {
            let documents = await this.model.find(filter)
                .sort({ creation_date: 1 })
                .populate('parent');
            let entityArray: ITaskEntity[] = this.convertToEntityArray(documents);
            return entityArray;
        } catch (error) {
            throw error;
        }
    }

    public async retrievePartial(filter: Object = {}, page: number = 1, startingFrom: number = 0, sort: Object = { creation_date: 1 }): Promise<ITaskEntity[]> {
        try {
            let skip: number = (page - 1) * AbstractRepository.RESULTS_PER_PAGE;
            let documentArray: TaskDocument[] =
                await this.model.find(filter)
                    .sort(sort)
                    .populate('parent')
                    .skip(skip)
                    .limit(AbstractRepository.RESULTS_PER_PAGE);
            let entityArray: ITaskEntity[] = this.convertToEntityArray(documentArray);
            return entityArray;
        } catch (error) {
            throw error;
        }
    }

    public async numPages(filter: Object = {}, startingFrom: number = 0): Promise<number> {
        try {
            let numResults: number = await this.count(filter);
            return Math.ceil(numResults / AbstractRepository.RESULTS_PER_PAGE);
        } catch (error) {
            throw error;
        }
    }

    protected convertToEntity(document: TaskDocument): ITaskEntity {
        return TaskEntity.toEntity(document);
    }

    protected convertToEntityArray(documentArray: TaskDocument[]): ITaskEntity[] {
        return TaskEntity.toEntityArray(documentArray);
    }

    protected updateFilter(item: ITaskEntity): Object {
        return { _id: item.document._id };
    }
}