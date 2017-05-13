import { IRepository } from "../data/IRepository";
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
    findByPullId(id: number): Promise<IReviewEntity[]>;

    /**
     * Retrieves a review given its GitHub id.
     * @param id        Review GitHub id.
     * @returns a promise that returns a review entity if resolved.
     */
    findById(id: number): Promise<IReviewEntity>;

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
     * Updates a Review from database. Uses its GitHub id.
     * @param item      Review entity with updated data.
     * @returns a promise that returns the number of rows affected if resolved.
     */
    public async update(item: IReviewEntity): Promise<number> {
        try {
            let result: any = await this.model.update({ id: item.id }, item.document);
            return result.nModified;
        } catch (error) {
            return error;
        }
    }

    /**
     * Retrieves a list of reviews of a pull request given its GitHub id.
     * @param id    Pull Request GitHub id.
     * @returns a promise that returns a list of review entities if resolved.
     */
    public async findByPullId(id: number): Promise<IReviewEntity[]> {
        return this.retrieve({ pull_request_id: id });
    }

    /**
     * Retrieves a review given its GitHub id.
     * @param id    Review GitHub id.
     * @returns a promise that returns a review entity if resolved.
     */
    public async findById(id: number): Promise<IReviewEntity> {
        try {
            let document: ReviewDocument = await this.model.findOne({ id: id });
            let entity: IReviewEntity = ReviewEntity.toEntity(document);
            return entity;
        } catch (error) {
            return error;
        }
    }

    protected convertToEntity(document: ReviewDocument): IReviewEntity {
        return ReviewEntity.toEntity(document);
    }

    protected convertToEntityArray(documentArray: ReviewDocument[]): IReviewEntity[] {
        return ReviewEntity.toEntityArray(documentArray);
    }

}