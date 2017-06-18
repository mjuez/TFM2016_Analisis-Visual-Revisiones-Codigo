import { IRepository, RetrieveOptions } from "../data/IRepository";
import { AbstractRepository } from "./AbstractRepository";
import { IReviewCommentEntity, ReviewCommentEntity } from "../entities/ReviewCommentEntity";
import { ReviewCommentDocument } from "../entities/documents/ReviewCommentDocument";
import { ReviewCommentSchema } from "./schemas/ReviewCommentSchema";
import * as mongoose from "mongoose";

/**
 * IReviewCommentRepository interface.
 * Defines custom CRUD operations for a Review Comment.
 * 
 * @author Mario Juez <mario[at]mjuez.com>
 */
export interface IReviewCommentRepository extends IRepository<IReviewCommentEntity, ReviewCommentDocument> {

    /**
     * Retrieves a list of review comments of a review given its GitHub id.
     * 
     * @param id    Review GitHub id.
     * @returns a list of review comment entities.
     */
    findByReviewId(id: number, page?: number, startingFrom?: number): Promise<IReviewCommentEntity[]>;

    /**
     * Retrieves a review comment given its GitHub id.
     * 
     * @param id        review comment GitHub id.
     * @returns a review comment entity.
     */
    findById(id: number): Promise<IReviewCommentEntity>;

}

/**
 * Review Comment Repository class.
 * @author Mario Juez <mario@mjuez.com>
 */
export class ReviewCommentRepository extends AbstractRepository<IReviewCommentEntity, ReviewCommentDocument> implements IReviewCommentRepository {

    /** MongoDB collection name. */
    public static readonly COLLECTION_NAME = "review_comment";

    /**
     * Class constructor.
     * Creates the repository using the collection name and the Review Comment schema.
     * 
     * @param model     Optional mongoose model dependency injection.
     */
    constructor(model?: mongoose.Model<ReviewCommentDocument>) {
        super(ReviewCommentRepository.COLLECTION_NAME, ReviewCommentSchema.schema, model);
    }

    /**
     * Retrieves a list of review comments of a review given its GitHub id.
     * 
     * @param id    Review GitHub id.
     * @returns a list of review comment entities.
     */
    public async findByReviewId(id: number, page: number = 1, startingFrom: number = 0): Promise<IReviewCommentEntity[]> {
        const filter: Object = { pull_request_review_id: id };
        return await this.retrieve({ filter, page, startingFrom });
    }

    /**
     * Retrieves a review comment given its GitHub id.
     * 
     * @param id        review comment GitHub id.
     * @returns a review comment entity.
     */
    public async findById(id: number): Promise<IReviewCommentEntity> {
        return await this.findOne({ id: id });
    }

    /**
     * Obtains the number of pages given a filter and 
     * a starting from value.
     * It allows to count the number of pages starting
     * from a specific review comment id.
     * 
     * @param filter        filtering options.
     * @param startingFrom  starting from value.
     * @returns number of pages.
     */
    public async numPages(filter: Object = {}, startingFrom: number = 0): Promise<number> {
        return await this._numPages(filter, startingFrom, 'id');
    }

    /**
     * Converts a review comment document to a
     * review comment entity.
     * 
     * @param document  review comment document.
     * @returns a review comment entity.
     */
    protected convertToEntity(document: ReviewCommentDocument): IReviewCommentEntity {
        return ReviewCommentEntity.toEntity(document);
    }

    /**
     * Converts a review comment document array to an
     * array of review comment entities.
     * 
     * @param documentArray review comment document array.
     * @returns a review comment entity array.
     */
    protected convertToEntityArray(documentArray: ReviewCommentDocument[]): IReviewCommentEntity[] {
        return ReviewCommentEntity.toEntityArray(documentArray);
    }

    /**
     * Creates a filter for updating a review comment entity.
     * The filter sets the id field as the review comment id.
     * 
     * @param item  review comment entity.
     * @return update filter.
     */
    protected updateFilter(item: IReviewCommentEntity): Object {
        return { id: item.id };
    }

}