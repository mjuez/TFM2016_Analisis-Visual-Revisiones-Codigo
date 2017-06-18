import { IRepository, RetrieveOptions } from "../data/IRepository";
import { AbstractRepository } from "./AbstractRepository";
import { IReviewEntity, ReviewEntity } from "../entities/ReviewEntity";
import { ReviewDocument } from "../entities/documents/ReviewDocument";
import { ReviewSchema } from "./schemas/ReviewSchema";
import { SinglePullRequestFilter } from "./filters/PullRequestFilter";
import * as mongoose from "mongoose";

/**
 * IReviewRepository interface.
 * Defines custom CRUD operations for a Review.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IReviewRepository extends IRepository<IReviewEntity, ReviewDocument> {

    /**
     * Retrieves a list of reviews of a pull request given its GitHub id.
     * @param id        Pull Request GitHub id.
     * @returns a promise that returns a list of review entities if resolved.
     */
    findByPullId(id: number, page?: number, startingFrom?: number): Promise<IReviewEntity[]>;

    /**
     * Retrieves a review given its GitHub id.
     * @param id        Review GitHub id.
     * @returns a promise that returns a review entity if resolved.
     */
    findById(id: number): Promise<IReviewEntity>;

    findByRepository(name: string, owner: string, startingFrom?: number, page?: number): Promise<IReviewEntity[]>;

}

/**
 * Review Repository class.
 * @author Mario Juez <mario@mjuez.com>
 */
export class ReviewRepository extends AbstractRepository<IReviewEntity, ReviewDocument> implements IReviewRepository {

    /** MongoDB collection name. */
    public static readonly COLLECTION_NAME = "review";

    /**
     * Class constructor.
     * Creates the repository using the collection name and the Review schema.
     * @param model     Optional mongoose model dependency injection.
     */
    constructor(model?: mongoose.Model<ReviewDocument>) {
        super(ReviewRepository.COLLECTION_NAME, ReviewSchema.schema, model);
    }

    /**
     * Retrieves a list of reviews of a pull request given its GitHub id.
     * @param id    Pull Request GitHub id.
     * @returns a promise that returns a list of review entities if resolved.
     */
    public async findByPullId(id: number, page: number = 1, startingFrom: number = 0): Promise<IReviewEntity[]> {
        const filter = { pull_request_id: id };
        return this.retrieve({ filter, page, startingFrom });
    }

    /**
     * Retrieves a review given its GitHub id.
     * @param id    Review GitHub id.
     * @returns a promise that returns a review entity if resolved.
     */
    public async findById(id: number): Promise<IReviewEntity> {
        return this.findOne({ id: id });
    }

    public async findByRepository(name: string, owner: string, page: number = 1, startingFrom: number = 0): Promise<IReviewEntity[]> {
        const repository: Object = {
            name,
            owner
        }
        const filter: Object = { repository: repository };
        return this.retrieve({ filter, page, startingFrom });
    }

    public async numPages(filter: Object = {}, startingFrom: number = 0): Promise<number> {
        return this._numPages(filter, startingFrom, 'id');
    }

    protected convertToEntity(document: ReviewDocument): IReviewEntity {
        return ReviewEntity.toEntity(document);
    }

    protected convertToEntityArray(documentArray: ReviewDocument[]): IReviewEntity[] {
        return ReviewEntity.toEntityArray(documentArray);
    }

    protected updateFilter(item: IReviewEntity): Object {
        return { id: item.id };
    }

}