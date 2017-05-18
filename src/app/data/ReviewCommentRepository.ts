import { IRepository } from "../data/IRepository";
import { AbstractRepository } from "./AbstractRepository";
import { IReviewCommentEntity, ReviewCommentEntity } from "../entities/ReviewCommentEntity";
import { ReviewCommentDocument } from "../entities/documents/ReviewCommentDocument";
import { ReviewCommentSchema } from "./schemas/ReviewCommentSchema";
import { SinglePullRequestFilter } from "./filters/PullRequestFilter";
import * as mongoose from "mongoose";

/**
 * IReviewCommentRepository interface.
 * Defines custom CRUD operations for a Review Comment.
 * @author Mario Juez <mario@mjuez.com>
 */
export interface IReviewCommentRepository extends IRepository<IReviewCommentEntity, ReviewCommentDocument> {

    /**
     * Retrieves a list of review comments of a review given its GitHub id.
     * @param id        Review GitHub id.
     * @returns a promise that returns a list of review comment entities if resolved.
     */
    findByReviewId(id: number): Promise<IReviewCommentEntity[]>;

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
    public async findByReviewId(id: number): Promise<IReviewCommentEntity[]> {
        return this.retrieve({ pull_request_review_id: id }); // PAGINACION
    }

    /**
     * Retrieves a review given its GitHub id.
     * @param id    Review GitHub id.
     * @returns a promise that returns a review entity if resolved.
     */
    public async findById(id: number): Promise<IReviewCommentEntity> {
        return this.findOne({id: id});
    }

    public async retrievePartial(filter: Object = {}, page: number = 1, startingFrom: number = 0): Promise<IReviewCommentEntity[]> {
        return this._retrievePartial(filter, page, startingFrom, 'id', { id: 1 });
    }

    public async numPages(filter: Object = {}, startingFrom: number = 0): Promise<number> {
        return this._numPages(filter, startingFrom, 'id', { id: 1 });
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