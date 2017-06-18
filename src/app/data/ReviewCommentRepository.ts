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
     * @param id        Review GitHub id.
     * @returns a promise that returns a list of review comment entities if resolved.
     */
    findByReviewId(id: number, page?: number, startingFrom?: number): Promise<IReviewCommentEntity[]>;

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
     * @param model     Optional mongoose model dependency injection.
     */
    constructor(model?: mongoose.Model<ReviewCommentDocument>) {
        super(ReviewCommentRepository.COLLECTION_NAME, ReviewCommentSchema.schema, model);
    }

    /**
     * Retrieves a list of review comments of a review given its GitHub id.
     * @param id        Review GitHub id.
     * @returns a promise that returns a list of review comment entities if resolved.
     */
    public async findByReviewId(id: number, page: number = 1, startingFrom: number = 0): Promise<IReviewCommentEntity[]> {
        const filter: Object = { pull_request_review_id: id };
        return this.retrieve({ filter, page, startingFrom });
    }

    /**
     * Retrieves a review given its GitHub id.
     * @param id    Review GitHub id.
     * @returns a promise that returns a review entity if resolved.
     */
    public async findById(id: number): Promise<IReviewCommentEntity> {
        return this.findOne({ id: id });
    }

    /*public async retrieve(options: RetrieveOptions = {}): Promise<IReviewCommentEntity[]> {
        return super.retrieve(options);
    }*/

    public async numPages(filter: Object = {}, startingFrom: number = 0): Promise<number> {
        return this._numPages(filter, startingFrom, 'id');
    }

    protected convertToEntity(document: ReviewCommentDocument): IReviewCommentEntity {
        return ReviewCommentEntity.toEntity(document);
    }

    protected convertToEntityArray(documentArray: ReviewCommentDocument[]): IReviewCommentEntity[] {
        return ReviewCommentEntity.toEntityArray(documentArray);
    }

    protected updateFilter(item: IReviewCommentEntity): Object {
        return { id: item.id };
    }

}