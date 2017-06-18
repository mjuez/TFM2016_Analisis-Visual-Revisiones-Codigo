import { IRepository, RetrieveOptions } from "../data/IRepository";
import { AbstractRepository } from "./AbstractRepository";
import { IPullRequestEntity, PullRequestEntity } from "../entities/PullRequestEntity";
import { PullRequestDocument } from "../entities/documents/PullRequestDocument";
import { PullRequestSchema } from "./schemas/PullRequestSchema";
import * as mongoose from "mongoose";

/**
 * IPullRequestRepository interface.
 * Defines custom CRUD operations for a Pull Request.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IPullRequestRepository extends IRepository<IPullRequestEntity, PullRequestDocument> {

    /**
     * Retrieves a Pull Request given its GitHub id.
     * @param id        Pull Request GitHub id.
     * @returns a promise that returns a pull request entity if resolved.
     */
    findById(id: number): Promise<IPullRequestEntity>;
}

/**
 * Pull Request Repository class.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export class PullRequestRepository extends AbstractRepository<IPullRequestEntity, PullRequestDocument> implements IPullRequestRepository {

    /** MongoDB collection name. */
    public static readonly COLLECTION_NAME = "pull_request";

    /**
     * Class constructor.
     * Creates the repository using the collection name and the Pull Request schema.
     * @param model     Optional mongoose model dependency injection.
     */
    constructor(model?: mongoose.Model<PullRequestDocument>) {
        super(PullRequestRepository.COLLECTION_NAME, PullRequestSchema.schema, model);
    }

    /**
     * Retrieves a Pull Request given its GitHub id.
     * @param id        Pull Request GitHub id.
     * @returns a promise that returns a pull request entity if resolved.
     */
    public async findById(id: number): Promise<IPullRequestEntity> {
        return this.findOne({ id: id });
    }

    /**
     * Retrieves an array of pull request from database
     * given retrieving options.
     * 
     * @param param0    optional retrieving options.
     * @returns an array of entities.
     *
     */
    public async retrieve({
        filter = {},
        page,
        startingFrom = 0,
        where = 'number',
        sort = { number: 1 },
        select = '' }: RetrieveOptions = {}): Promise<IPullRequestEntity[]> {

        return this._retrieve({ filter, page, startingFrom, where, sort, select });
    }

    /**
     * Obtains the number of pages given a filter and 
     * a starting from value.
     * It allows to count the number of pages starting
     * from a specific pull request number.
     * 
     * @param filter        filtering options.
     * @param startingFrom  starting from value.
     * @returns number of pages.
     */
    public async numPages(filter: Object = {}, startingFrom: number = 0): Promise<number> {
        return this._numPages(filter, startingFrom, 'number');
    }

    /**
     * Converts a pull request document to a
     * pull request entity.
     * 
     * @param document  pull request document.
     * @returns a pull request entity.
     */
    protected convertToEntity(document: PullRequestDocument): IPullRequestEntity {
        return PullRequestEntity.toEntity(document);
    }

    /**
     * Converts a pull request document array to an
     * array of pull request entities.
     * 
     * @param documentArray pull request document array.
     * @returns a pull request entity array.
     */
    protected convertToEntityArray(documentArray: PullRequestDocument[]): IPullRequestEntity[] {
        return PullRequestEntity.toEntityArray(documentArray);
    }

    /**
     * Creates a filter for updating a pull request entity.
     * The filter sets the id field as the pull request id.
     * 
     * @param item  pull request entity.
     * @return update filter.
     */
    protected updateFilter(item: IPullRequestEntity): Object {
        return { id: item.id };
    }

}