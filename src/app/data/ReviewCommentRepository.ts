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
     * Updates a Review from database. Uses its GitHub id.
     * @param item      Review entity with updated data.
     * @returns a promise that returns the number of rows affected if resolved.
     */
    public update(item: IReviewCommentEntity): Promise<number> {
        let promise: Promise<number> = new Promise<number>((resolve, reject) => {
            this.model.update({ id: item.id }, item.document, (error, rowsAffected) => {
                if (!error) {
                    resolve(rowsAffected);
                } else {
                    reject(error);
                }
            });
        });
        return promise;
    }

    /**
     * Retrieves a list of review comments of a review given its GitHub id.
     * @param id        Review GitHub id.
     * @returns a promise that returns a list of review comment entities if resolved.
     */
    public findByReviewId(id: number): Promise<IReviewCommentEntity[]> {
        let promise: Promise<IReviewCommentEntity[]>
            = new Promise<IReviewCommentEntity[]>((resolve, reject) => {
                this.model.find({ pull_request_review_id: id }, (error, result) => {
                    if (!error) {
                        let entityArray: IReviewCommentEntity[] = ReviewCommentEntity.toEntityArray(result);
                        resolve(entityArray);
                    } else {
                        reject(error);
                    }
                });
            });
        return promise;
    }

    protected convertToEntity(document: ReviewCommentDocument): IReviewCommentEntity {
        return ReviewCommentEntity.toEntity(document);
    }

    protected convertToEntityArray(documentArray: ReviewCommentDocument[]): IReviewCommentEntity[] {
        return ReviewCommentEntity.toEntityArray(documentArray);
    }

}